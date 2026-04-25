import { readdir, readFile } from "node:fs/promises"
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
import {
  BRIEF_STATUS_VALUES,
  buildProgramPacketDirectoryName,
  CURRENT_PLANNING_BRIEF_POINTER_FILENAME,
  PROGRAMS_ACTIVE_ROOT,
  PROGRAMS_COMPLETED_ROOT,
  getProgramsPacketRootPath,
  isProgramId,
  parseProgramPacketDirectoryName,
  parseVersionedBriefRepoPath,
  toRepoRelativePath,
} from "./briefs"

const REQUIRED_BRIEF_KEYS = [
  "title",
  "program_id",
  "brief_version",
  "status",
  "summary",
  "read_when",
] as const

const ALLOWED_BRIEF_KEYS = new Set(REQUIRED_BRIEF_KEYS)
const PROGRAM_DOCUMENT_FILENAME = "program.md"
const REQUIRED_PROGRAM_PACKET_FILES = [
  PROGRAM_DOCUMENT_FILENAME,
  "converged-decision-packet.md",
  "dependency-graph.md",
  "plan-split-recommendation.md",
  "cross-repo-review.md",
] as const

export type ProgramPacketLintReport = {
  issues: string[]
  programId: string
}

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT"
}

async function listProgramDirectories(repoRootDir: string): Promise<
  Array<{
    absolutePath: string
    createdAt: string
    directoryName: string
    programId: string
    rootKind: "active" | "completed"
  }>
> {
  const roots = [
    {
      path: path.join(repoRootDir, PROGRAMS_ACTIVE_ROOT),
      rootKind: "active" as const,
    },
    {
      path: path.join(repoRootDir, PROGRAMS_COMPLETED_ROOT),
      rootKind: "completed" as const,
    },
  ]
  const results: Array<{
    absolutePath: string
    createdAt: string
    directoryName: string
    programId: string
    rootKind: "active" | "completed"
  }> = []

  for (const root of roots) {
    let entries
    try {
      entries = await readdir(root.path, { withFileTypes: true })
    } catch (error) {
      if (isMissingFileError(error)) {
        continue
      }

      throw error
    }

    results.push(
      ...entries
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
        .sort((left, right) => left.name.localeCompare(right.name))
        .flatMap((entry) => {
          const parts = parseProgramPacketDirectoryName(entry.name)
          if (!parts) {
            return []
          }

          return [
            {
              programId: parts.programId,
              createdAt: parts.createdAt,
              directoryName: entry.name,
              absolutePath: path.join(root.path, entry.name),
              rootKind: root.rootKind,
            },
          ]
        }),
    )
  }

  return results
}

async function listProgramBriefFiles(
  programDirPath: string,
): Promise<Array<{ absolutePath: string }>> {
  let entries
  try {
    entries = await readdir(programDirPath, { withFileTypes: true })
  } catch (error) {
    if (isMissingFileError(error)) {
      return []
    }

    throw error
  }

  return entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.startsWith("planning-brief-") &&
        entry.name.endsWith(".md"),
    )
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((entry) => ({
      absolutePath: path.join(programDirPath, entry.name),
    }))
}

async function validateRequiredPacketArtifacts(
  programDirPath: string,
): Promise<string[]> {
  const issues: string[] = []
  let entries
  try {
    entries = await readdir(programDirPath, { withFileTypes: true })
  } catch (error) {
    if (isMissingFileError(error)) {
      return ["Program packet directory does not exist."]
    }

    throw error
  }

  const fileNames = new Set(
    entries.filter((entry) => entry.isFile()).map((entry) => entry.name),
  )
  for (const requiredFile of REQUIRED_PROGRAM_PACKET_FILES) {
    if (!fileNames.has(requiredFile)) {
      issues.push(`Program packet must include ${requiredFile}.`)
    }
  }

  const hasResearchPass = [...fileNames].some(
    (fileName) =>
      /^track-\d+-.+\.md$/.test(fileName) ||
      /^research-pass-.+\.md$/.test(fileName),
  )
  if (!hasResearchPass) {
    issues.push(
      "Program packet must include at least one research pass named track-<N>-<slug>.md or research-pass-<slug>.md.",
    )
  }

  const hasNormalizedPass = [...fileNames].some(
    (fileName) =>
      /^normalized-track-\d+\.md$/.test(fileName) ||
      /^normalized-pass-.+\.md$/.test(fileName),
  )
  if (!hasNormalizedPass) {
    issues.push(
      "Program packet must include at least one normalized pass named normalized-track-<N>.md or normalized-pass-<slug>.md.",
    )
  }

  return issues
}

async function validateBriefFile(params: {
  briefPath: string
  createdAt: string
  programId: string
  repoRootDir: string
}): Promise<string[]> {
  const issues: string[] = []
  const repoRelativePath = toRepoRelativePath(
    params.repoRootDir,
    params.briefPath,
  )
  const pathParts = parseVersionedBriefRepoPath(repoRelativePath)

  if (!pathParts) {
    issues.push(
      "Versioned planning briefs must live under docs/programs/(active|completed)/<YYYY-MM-DD-program-id>/planning-brief-<N>.md.",
    )
    return issues
  }

  const parsed = parseMarkdownFrontmatter(
    await readFile(params.briefPath, "utf8"),
  )
  if ("issue" in parsed) {
    issues.push(parsed.issue)
    return issues
  }

  const { metadata, body } = parsed
  validateRequiredFrontmatterKeys({
    issues,
    metadata,
    requiredKeys: REQUIRED_BRIEF_KEYS,
  })
  validateAllowedFrontmatterKeys({
    allowedKeys: ALLOWED_BRIEF_KEYS,
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

  if (!isProgramId(metadata.program_id)) {
    issues.push(
      "Frontmatter program_id must be a stable kebab-case Program id slug.",
    )
  } else if (metadata.program_id !== params.programId) {
    issues.push(
      `Frontmatter program_id must match the owning packet directory "${buildProgramPacketDirectoryName({ createdAt: params.createdAt, programId: params.programId })}".`,
    )
  }

  if (
    !Number.isInteger(metadata.brief_version) ||
    Number(metadata.brief_version) <= 0
  ) {
    issues.push("Frontmatter brief_version must be a positive integer.")
  } else if (Number(metadata.brief_version) !== pathParts.briefVersion) {
    issues.push(
      `Frontmatter brief_version must match the version in ${repoRelativePath}.`,
    )
  }

  if (pathParts.createdAt !== params.createdAt) {
    issues.push(
      `Versioned planning briefs must stay inside docs/programs/${pathParts.rootKind}/${buildProgramPacketDirectoryName({ createdAt: params.createdAt, programId: params.programId })}/.`,
    )
  }

  if (!isNonEmptyString(metadata.status)) {
    issues.push("Frontmatter status must be a non-empty string.")
  } else if (!BRIEF_STATUS_VALUES.has(metadata.status)) {
    issues.push("Frontmatter status must be one of: current, superseded.")
  }

  if (!isNonEmptyString(metadata.summary)) {
    issues.push("Frontmatter summary must be a non-empty string.")
  }

  validateReadWhen({ issues, value: metadata.read_when })
  return issues
}

async function validateCurrentPointer(params: {
  briefIssuesByPath: Map<string, string[]>
  briefPaths: string[]
  createdAt: string
  programId: string
  repoRootDir: string
  rootKind: "active" | "completed"
}): Promise<string[]> {
  const issues: string[] = []
  const pointerPath = path.join(
    params.repoRootDir,
    params.rootKind === "completed"
      ? PROGRAMS_COMPLETED_ROOT
      : PROGRAMS_ACTIVE_ROOT,
    buildProgramPacketDirectoryName({
      createdAt: params.createdAt,
      programId: params.programId,
    }),
    CURRENT_PLANNING_BRIEF_POINTER_FILENAME,
  )

  let pointerContents: string
  const programRootLabel =
    params.rootKind === "completed"
      ? PROGRAMS_COMPLETED_ROOT
      : PROGRAMS_ACTIVE_ROOT
  try {
    pointerContents = await readFile(pointerPath, "utf8")
  } catch (error) {
    if (isMissingFileError(error)) {
      issues.push(
        `Missing ${programRootLabel}/${buildProgramPacketDirectoryName({ createdAt: params.createdAt, programId: params.programId })}/${CURRENT_PLANNING_BRIEF_POINTER_FILENAME}.`,
      )
      return issues
    }

    throw error
  }

  const lines = pointerContents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== "")

  if (lines.length !== 1) {
    issues.push(
      `${CURRENT_PLANNING_BRIEF_POINTER_FILENAME} must contain exactly one non-empty planning brief filename.`,
    )
    return issues
  }

  const pointerTarget = lines[0] ?? ""
  if (pointerTarget.includes("/") || pointerTarget.includes("\\")) {
    issues.push(
      `${CURRENT_PLANNING_BRIEF_POINTER_FILENAME} must contain only a planning brief filename, not a path.`,
    )
    return issues
  }

  const targetPath = path.join(
    params.repoRootDir,
    params.rootKind === "completed"
      ? PROGRAMS_COMPLETED_ROOT
      : PROGRAMS_ACTIVE_ROOT,
    buildProgramPacketDirectoryName({
      createdAt: params.createdAt,
      programId: params.programId,
    }),
    pointerTarget,
  )
  const targetRepoPath = toRepoRelativePath(params.repoRootDir, targetPath)
  const parsedTarget = parseVersionedBriefRepoPath(targetRepoPath)
  if (!parsedTarget) {
    issues.push(
      `${CURRENT_PLANNING_BRIEF_POINTER_FILENAME} must point to planning-brief-<N>.md inside the Program packet directory.`,
    )
    return issues
  }

  if (!params.briefPaths.includes(targetPath)) {
    issues.push(
      `${CURRENT_PLANNING_BRIEF_POINTER_FILENAME} points to a brief that does not exist: ${targetRepoPath}.`,
    )
  }

  const briefIssues = params.briefIssuesByPath.get(targetRepoPath)
  if (briefIssues && briefIssues.length > 0) {
    issues.push(
      `${CURRENT_PLANNING_BRIEF_POINTER_FILENAME} must point at a valid versioned planning brief.`,
    )
  }

  return issues
}

export async function lintProgramPacket(params: {
  createdAt: string
  programId: string
  repoRootDir: string
  rootKind: "active" | "completed"
}): Promise<ProgramPacketLintReport> {
  const issues: string[] = []
  if (!isProgramId(params.programId)) {
    issues.push(
      "Program packet directory names must be stable kebab-case slugs.",
    )
    return {
      programId: params.programId,
      issues,
    }
  }

  const programDirPath = path.join(
    params.rootKind === "completed"
      ? path.join(params.repoRootDir, PROGRAMS_COMPLETED_ROOT)
      : getProgramsPacketRootPath(params.repoRootDir),
    buildProgramPacketDirectoryName({
      createdAt: params.createdAt,
      programId: params.programId,
    }),
  )

  issues.push(...(await validateRequiredPacketArtifacts(programDirPath)))

  const briefFiles = await listProgramBriefFiles(programDirPath)
  const briefIssuesByPath = new Map<string, string[]>()
  if (briefFiles.length === 0) {
    issues.push(
      "Program packet must include at least one versioned planning brief.",
    )
  }

  for (const briefFile of briefFiles) {
    const repoRelativePath = toRepoRelativePath(
      params.repoRootDir,
      briefFile.absolutePath,
    )
    const briefIssues = await validateBriefFile({
      repoRootDir: params.repoRootDir,
      briefPath: briefFile.absolutePath,
      createdAt: params.createdAt,
      programId: params.programId,
    })
    briefIssuesByPath.set(repoRelativePath, briefIssues)
    for (const issue of briefIssues) {
      issues.push(`${repoRelativePath}: ${issue}`)
    }
  }

  issues.push(
    ...(await validateCurrentPointer({
      repoRootDir: params.repoRootDir,
      createdAt: params.createdAt,
      programId: params.programId,
      rootKind: params.rootKind,
      briefPaths: briefFiles.map((file) => file.absolutePath),
      briefIssuesByPath,
    })),
  )

  return {
    programId: params.programId,
    issues,
  }
}

export async function lintProgramPackets(params: {
  repoRootDir: string
}): Promise<ProgramPacketLintReport[]> {
  const programDirectories = await listProgramDirectories(params.repoRootDir)
  return await Promise.all(
    programDirectories.map((programDirectory) =>
      lintProgramPacket({
        repoRootDir: params.repoRootDir,
        createdAt: programDirectory.createdAt,
        programId: programDirectory.programId,
        rootKind: programDirectory.rootKind,
      }),
    ),
  )
}

export function formatProgramPacketLintReports(
  reports: ProgramPacketLintReport[],
): string {
  const lines: string[] = []
  for (const report of reports) {
    if (report.issues.length === 0) {
      lines.push(`${report.programId}: ok`)
      continue
    }

    lines.push(report.programId)
    for (const issue of report.issues) {
      lines.push(`  - ${issue}`)
    }
  }

  return lines.join("\n")
}

export async function assertProgramPacketValid(params: {
  createdAt: string
  programId: string
  repoRootDir: string
  rootKind: "active" | "completed"
}): Promise<void> {
  const report = await lintProgramPacket(params)
  if (report.issues.length === 0) {
    return
  }

  throw new Error(formatProgramPacketLintReports([report]))
}
