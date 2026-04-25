import { access, readFile } from "node:fs/promises"
import path from "node:path"

import {
  extractMarkdownH1,
  parseMarkdownFrontmatter,
} from "../markdown-metadata/frontmatter"
import {
  isNonEmptyString,
  validateAllowedFrontmatterKeys,
  validateReadWhen,
  validateRequiredFrontmatterKeys,
} from "../markdown-metadata/schema"
import { buildProgramPacketDirectoryName, isProgramId } from "./briefs"

const REQUIRED_FRONTMATTER_KEYS = [
  "program_id",
  "title",
  "status",
  "created_at",
  "completed_at",
  "summary",
  "post_build_recap",
  "read_when",
] as const

const ALLOWED_FRONTMATTER_KEYS = new Set<string>([
  ...REQUIRED_FRONTMATTER_KEYS,
])
const ALLOWED_STATUSES = new Set(["active", "complete"])
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const PROGRAM_DOC_PATH_PATTERN =
  /^docs\/programs\/(active|completed)\/\d{4}-\d{2}-\d{2}-[a-z0-9-]+\/program\.md$/
const REQUIRED_SECTION_HEADINGS = [
  "Purpose / Big Picture",
  "Program Inputs",
  "Current State",
  "Progress",
  "Decision Log",
  "Slice Ledger",
  "Next Slice",
  "Risks and Watchpoints",
  "Outcomes & Retrospective",
  "Validation and Acceptance",
  "Artifacts and Notes",
  "Interfaces and Dependencies",
] as const

export type ProgramDocumentLintReport = {
  issues: string[]
  programPath: string
}

function getProgramSlugFromPath(programPath: string): string | null {
  const folderName = path.posix.basename(path.posix.dirname(programPath))
  const match = folderName.match(/^\d{4}-\d{2}-\d{2}-(.+)$/)
  return match?.[1] ?? null
}

function extractMarkdownSection(body: string, heading: string): string | null {
  const lines = body.split("\n")
  const headingLine = `## ${heading}`
  const startIndex = lines.findIndex((line) => line === headingLine)
  if (startIndex === -1) {
    return null
  }

  let endIndex = lines.length
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (lines[index]?.startsWith("## ")) {
      endIndex = index
      break
    }
  }

  return lines
    .slice(startIndex + 1, endIndex)
    .join("\n")
    .trim()
}

export async function lintProgramDocument(params: {
  programPath: string
  repoRootDir: string
}): Promise<ProgramDocumentLintReport> {
  const issues: string[] = []
  if (
    /^docs\/programs\/active\/\d{4}-\d{2}-\d{2}-[a-z0-9-]+\/.+\.md$/.test(
      params.programPath,
    ) &&
    !params.programPath.endsWith("/program.md")
  ) {
    return {
      issues,
      programPath: params.programPath,
    }
  }

  if (!PROGRAM_DOC_PATH_PATTERN.test(params.programPath)) {
    issues.push(
      "Program docs must live under docs/programs/active/ or docs/programs/completed/ with a dated filename.",
    )
    return {
      issues,
      programPath: params.programPath,
    }
  }

  const text = await readFile(
    `${params.repoRootDir}/${params.programPath}`,
    "utf8",
  )
  const parsed = parseMarkdownFrontmatter(text)
  if ("issue" in parsed) {
    return {
      issues: [parsed.issue],
      programPath: params.programPath,
    }
  }

  const { metadata, body } = parsed
  validateRequiredFrontmatterKeys({
    issues,
    metadata,
    requiredKeys: REQUIRED_FRONTMATTER_KEYS,
  })
  validateAllowedFrontmatterKeys({
    allowedKeys: ALLOWED_FRONTMATTER_KEYS,
    issues,
    metadata,
  })

  if (!isNonEmptyString(metadata.title)) {
    issues.push("Frontmatter title must be a non-empty string.")
  } else {
    const h1 = extractMarkdownH1(body)
    if (!h1) {
      issues.push("Body must include an H1 that matches frontmatter title.")
    } else if (h1 !== metadata.title) {
      issues.push(
        `Frontmatter title must match the H1 exactly. Found title "${String(metadata.title)}" and H1 "${h1}".`,
      )
    }
  }

  if (!isNonEmptyString(metadata.summary)) {
    issues.push("Frontmatter summary must be a non-empty string.")
  }

  if (!isProgramId(metadata.program_id)) {
    issues.push(
      "Frontmatter program_id must be a stable kebab-case Program id slug.",
    )
  } else {
    const slugFromPath = getProgramSlugFromPath(params.programPath)
    if (slugFromPath && slugFromPath !== metadata.program_id) {
      issues.push(
        `Frontmatter program_id must match the dated filename slug "${slugFromPath}".`,
      )
    }
  }

  if (!isNonEmptyString(metadata.status)) {
    issues.push("Frontmatter status must be a non-empty string.")
  } else if (!ALLOWED_STATUSES.has(metadata.status)) {
    issues.push("Frontmatter status must be one of: active, complete.")
  }

  if (
    !isNonEmptyString(metadata.created_at) ||
    !ISO_DATE_PATTERN.test(metadata.created_at)
  ) {
    issues.push("Frontmatter created_at must be a YYYY-MM-DD string.")
  }

  if (metadata.completed_at !== null) {
    if (
      !isNonEmptyString(metadata.completed_at) ||
      !ISO_DATE_PATTERN.test(metadata.completed_at)
    ) {
      issues.push(
        "Frontmatter completed_at must be null or a YYYY-MM-DD string.",
      )
    }
  }

  validateReadWhen({ issues, value: metadata.read_when })
  if (metadata.status === "active") {
    if (metadata.completed_at !== null) {
      issues.push("Active Program docs must use completed_at: null.")
    }
    if (metadata.post_build_recap !== null) {
      issues.push("Active Program docs must use post_build_recap: null.")
    }
  }

  if (metadata.status === "complete") {
    if (!isNonEmptyString(metadata.completed_at)) {
      issues.push(
        "Completed Program docs must include a real completed_at date.",
      )
    }
    if (!isNonEmptyString(metadata.post_build_recap)) {
      issues.push(
        "Completed Program docs must include a non-empty post_build_recap.",
      )
    }
  }

  const isCompletedPath = params.programPath.startsWith(
    "docs/programs/completed/",
  )
  if (isCompletedPath && metadata.status !== "complete") {
    issues.push(
      "Program docs under docs/programs/completed/ must use status: complete.",
    )
  }

  if (!isCompletedPath && metadata.status !== "active") {
    issues.push(
      "Program docs under docs/programs/active/ must use status: active.",
    )
  }

  for (const heading of REQUIRED_SECTION_HEADINGS) {
    const section = extractMarkdownSection(body, heading)
    if (!section) {
      issues.push(`Missing required section: ## ${heading}.`)
    }
  }

  if (
    isProgramId(metadata.program_id) &&
    isNonEmptyString(metadata.created_at) &&
    ISO_DATE_PATTERN.test(metadata.created_at)
  ) {
    const packetRoot = isCompletedPath
      ? "docs/programs/completed"
      : "docs/programs/active"
    const packetPath = path.join(
      params.repoRootDir,
      packetRoot,
      buildProgramPacketDirectoryName({
        createdAt: metadata.created_at,
        programId: metadata.program_id,
      }),
    )
    try {
      await access(packetPath)
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        issues.push(
          `Programs must have a checked-in packet directory at ${packetRoot}/${buildProgramPacketDirectoryName({ createdAt: metadata.created_at, programId: metadata.program_id })}/.`,
        )
      } else {
        throw error
      }
    }
  }

  const nextSliceSection = extractMarkdownSection(body, "Next Slice")
  if (
    metadata.status === "complete" &&
    nextSliceSection &&
    !nextSliceSection.startsWith("No required next slice remains")
  ) {
    issues.push(
      'Completed Program docs must make `## Next Slice` explicit by starting with "No required next slice remains".',
    )
  }

  return {
    issues,
    programPath: params.programPath,
  }
}
