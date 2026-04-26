import { readFile } from "node:fs/promises"
import path from "node:path"

const PROMPTS_ROOT = "docs/prompts"
const PROGRAMS_README_PATH = "docs/programs/README.md"
const PROGRAMS_CONTRACT_PATH = "docs/programs/PROGRAMS.md"
const PROMPTS_README_PATH = "docs/prompts/README.md"

export const PROGRAM_PROMPT_PATHS = [
  "docs/prompts/program-orchestrator.md",
  "docs/prompts/program-initialize.md",
  "docs/prompts/program-funnel.md",
  "docs/prompts/program-research-passes.md",
  "docs/prompts/program-normalize-pass.md",
  "docs/prompts/program-converged-decision-packet.md",
  "docs/prompts/program-dependency-graph.md",
  "docs/prompts/program-plan-split-recommendation.md",
  "docs/prompts/program-cross-repo-review.md",
  "docs/prompts/program-planning-brief.md",
  "docs/prompts/program-doc-synthesis.md",
  "docs/prompts/program-loop.md",
  "docs/prompts/program-docs-sync.md",
  "docs/prompts/program-planning-refresh.md",
  "docs/prompts/program-completion-review.md",
] as const

type ProgramPromptPath = (typeof PROGRAM_PROMPT_PATHS)[number]

type PromptContract = {
  path: ProgramPromptPath
  requiredText: string[]
}

export type ProgramPromptContractReport = {
  issues: string[]
  scope: string
}

const COMMON_PROMPT_REQUIRED_TEXT = [
  "Read the repo root `AGENTS.md` first and follow it.",
  "docs/programs/PROGRAMS.md",
  "docs/prompts/README.md",
  "Quality gate before returning:",
  "Return:",
  "bun run",
] as const

const FORBIDDEN_LEGACY_PROGRAM_PROMPT_TEXT = [
  "~/Developer/worker/tmp",
  "tmp/programs/<program-slug>",
  "tmp/planning-brief",
  "planning-refresh-after-plan",
] as const

const PROMPT_CONTRACTS: PromptContract[] = [
  {
    path: "docs/prompts/program-orchestrator.md",
    requiredText: [
      "State classification:",
      "Prompt routing:",
      "completion-review",
      "docs/prompts/program-completion-review.md",
    ],
  },
  {
    path: "docs/prompts/program-initialize.md",
    requiredText: [
      "Create only the Program root and skeletal `program.md`.",
      "Do not create placeholder packet files that would mislead `programs:lint`.",
      "docs/prompts/program-research-passes.md",
    ],
  },
  {
    path: "docs/prompts/program-funnel.md",
    requiredText: [
      "Required packet outputs:",
      "docs/prompts/program-initialize.md",
      "docs/prompts/program-doc-synthesis.md",
      "planning-brief-1.md",
      "current-planning-brief.txt",
    ],
  },
  {
    path: "docs/prompts/program-research-passes.md",
    requiredText: [
      "Preserve the source findings faithfully.",
      "Do not normalize, synthesize, plan, or implement yet.",
      "track-<N>-<slug>.md",
    ],
  },
  {
    path: "docs/prompts/program-normalize-pass.md",
    requiredText: [
      "# Track N Normalized",
      "## Facts",
      "## Recommendation",
      "do not merge with other tracks yet",
    ],
  },
  {
    path: "docs/prompts/program-converged-decision-packet.md",
    requiredText: [
      "# Converged Decision Packet",
      "## Converged Decisions",
      "## Tensions Or Open Questions",
      "Do not write an ExecPlan",
    ],
  },
  {
    path: "docs/prompts/program-dependency-graph.md",
    requiredText: [
      "# Dependency Graph",
      "## Dependency Order",
      "## Unsafe Orders To Avoid",
      "optimize for real prerequisite order",
    ],
  },
  {
    path: "docs/prompts/program-plan-split-recommendation.md",
    requiredText: [
      "# Plan Split Recommendation",
      "## Recommended Number Of Plans",
      "## First Plan To Write",
      "what it must not absorb",
    ],
  },
  {
    path: "docs/prompts/program-cross-repo-review.md",
    requiredText: [
      "# Cross-Repo Review",
      "## What Holds Up",
      "## What Is Still Weak",
      "## Final Recommended First Plan",
    ],
  },
  {
    path: "docs/prompts/program-planning-brief.md",
    requiredText: [
      "# Planning Brief",
      "## First ExecPlan To Write",
      "planning-brief-1.md",
      "current-planning-brief.txt",
    ],
  },
  {
    path: "docs/prompts/program-doc-synthesis.md",
    requiredText: [
      "program.md",
      "Follow `docs/programs/PROGRAMS.md` frontmatter and section order exactly.",
      "The `Next Slice` section must name the first recommended child ExecPlan slice",
    ],
  },
  {
    path: "docs/prompts/program-loop.md",
    requiredText: [
      "docs/prompts/exec-plan-writer.md",
      "docs/prompts/exec-plan-validate.md",
      "docs/prompts/program-planning-refresh.md",
      "docs/prompts/program-completion-review.md",
    ],
  },
  {
    path: "docs/prompts/program-docs-sync.md",
    requiredText: [
      "markdown:lint",
      "do not create duplicate truth",
      "Update the child ExecPlan with:",
    ],
  },
  {
    path: "docs/prompts/program-planning-refresh.md",
    requiredText: [
      "# Planning Refresh",
      "planning-brief-<N+1>.md",
      "current-planning-brief.txt",
      "Next Plan Recommendation",
    ],
  },
  {
    path: "docs/prompts/program-completion-review.md",
    requiredText: [
      "Completion criteria:",
      "move the entire folder from `docs/programs/active/YYYY-MM-DD-program-id/` to `docs/programs/completed/YYYY-MM-DD-program-id/`",
      "completion verdict: complete / not complete",
    ],
  },
]

function getFileName(repoPath: string): string {
  return path.posix.basename(repoPath)
}

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT"
}

async function readRepoFile(params: {
  repoRootDir: string
  repoPath: string
}): Promise<string | null> {
  try {
    return await readFile(
      path.join(params.repoRootDir, params.repoPath),
      "utf8",
    )
  } catch (error) {
    if (isMissingFileError(error)) {
      return null
    }

    throw error
  }
}

function findMissingText(params: {
  requiredText: readonly string[]
  text: string
}): string[] {
  return params.requiredText.filter(
    (requiredText) => !params.text.includes(requiredText),
  )
}

function findForbiddenText(text: string): string[] {
  return FORBIDDEN_LEGACY_PROGRAM_PROMPT_TEXT.filter((forbiddenText) =>
    text.includes(forbiddenText),
  )
}

async function lintPromptFile(params: {
  contract: PromptContract
  repoRootDir: string
}): Promise<ProgramPromptContractReport> {
  const text = await readRepoFile({
    repoRootDir: params.repoRootDir,
    repoPath: params.contract.path,
  })
  if (text === null) {
    return {
      scope: params.contract.path,
      issues: ["Program prompt file is missing."],
    }
  }

  const issues = [
    ...findMissingText({
      text,
      requiredText: COMMON_PROMPT_REQUIRED_TEXT,
    }).map((missingText) => `Missing required prompt text: ${missingText}`),
    ...findMissingText({
      text,
      requiredText: params.contract.requiredText,
    }).map(
      (missingText) => `Missing step-specific prompt text: ${missingText}`,
    ),
    ...findForbiddenText(text).map(
      (forbiddenText) =>
        `Uses legacy tmp-only Program prompt text: ${forbiddenText}`,
    ),
  ]

  return {
    scope: params.contract.path,
    issues,
  }
}

async function lintIndexFile(params: {
  repoRootDir: string
  repoPath: string
  requireFullPromptPaths: boolean
}): Promise<ProgramPromptContractReport> {
  const text = await readRepoFile({
    repoRootDir: params.repoRootDir,
    repoPath: params.repoPath,
  })
  if (text === null) {
    return {
      scope: params.repoPath,
      issues: ["Program prompt index file is missing."],
    }
  }

  const requiredReferences = PROGRAM_PROMPT_PATHS.map((promptPath) =>
    params.requireFullPromptPaths ? promptPath : getFileName(promptPath),
  )
  const issues = [
    ...findMissingText({ text, requiredText: requiredReferences }).map(
      (missingText) =>
        `Missing Program prompt inventory reference: ${missingText}`,
    ),
    ...findForbiddenText(text).map(
      (forbiddenText) =>
        `Uses legacy tmp-only Program prompt text: ${forbiddenText}`,
    ),
  ]

  return {
    scope: params.repoPath,
    issues,
  }
}

function lintPromptDirectoryShape(): ProgramPromptContractReport {
  const promptFilesOutsideRoot = PROGRAM_PROMPT_PATHS.filter(
    (promptPath) => !promptPath.startsWith(`${PROMPTS_ROOT}/program-`),
  )
  return {
    scope: "Program prompt inventory",
    issues: promptFilesOutsideRoot.map(
      (promptPath) =>
        `Program prompt must live under ${PROMPTS_ROOT}/ and use the program- prefix: ${promptPath}`,
    ),
  }
}

export async function lintProgramPromptContract(params: {
  repoRootDir: string
}): Promise<ProgramPromptContractReport[]> {
  return [
    lintPromptDirectoryShape(),
    ...(await Promise.all(
      PROMPT_CONTRACTS.map((contract) =>
        lintPromptFile({
          repoRootDir: params.repoRootDir,
          contract,
        }),
      ),
    )),
    await lintIndexFile({
      repoRootDir: params.repoRootDir,
      repoPath: PROMPTS_README_PATH,
      requireFullPromptPaths: false,
    }),
    await lintIndexFile({
      repoRootDir: params.repoRootDir,
      repoPath: PROGRAMS_README_PATH,
      requireFullPromptPaths: true,
    }),
    await lintIndexFile({
      repoRootDir: params.repoRootDir,
      repoPath: PROGRAMS_CONTRACT_PATH,
      requireFullPromptPaths: false,
    }),
  ]
}

export function formatProgramPromptContractReports(
  reports: ProgramPromptContractReport[],
): string {
  const lines: string[] = []
  for (const report of reports) {
    if (report.issues.length === 0) {
      lines.push(`${report.scope}: ok`)
      continue
    }

    lines.push(report.scope)
    for (const issue of report.issues) {
      lines.push(`  - ${issue}`)
    }
  }

  return lines.join("\n")
}
