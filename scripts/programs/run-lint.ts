import process from "node:process"

import {
  formatMarkdownMetadataLintReports,
  lintMarkdownMetadata,
} from "../markdown-metadata/lint"
import {
  formatProgramPacketLintReports,
  lintProgramPackets,
} from "./frontmatter-lint"
import {
  formatProgramPromptContractReports,
  lintProgramPromptContract,
} from "./prompt-contract"

function buildUsage(): string {
  return [
    "Usage: bun run programs:lint",
    "",
    "Lints durable Program docs, checked-in Program packet folders, and Program prompt contracts.",
  ].join("\n")
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  if (args.includes("--help")) {
    console.log(buildUsage())
    return
  }

  if (args.length > 0) {
    throw new Error(`Unknown arguments: ${args.join(" ")}\n\n${buildUsage()}`)
  }

  const repoRootDir = process.cwd()
  const [docReports, packetReports, promptReports] = await Promise.all([
    lintMarkdownMetadata({
      repoRootDir,
      requestedPaths: ["docs/programs"],
    }),
    lintProgramPackets({
      repoRootDir,
    }),
    lintProgramPromptContract({
      repoRootDir,
    }),
  ])

  const outputBlocks: string[] = []
  outputBlocks.push("Program docs")
  outputBlocks.push(formatMarkdownMetadataLintReports(docReports).trimEnd())

  if (packetReports.length === 0) {
    outputBlocks.push("")
    outputBlocks.push("Program packets")
    outputBlocks.push("No program packets found.")
  } else {
    outputBlocks.push("")
    outputBlocks.push("Program packets")
    outputBlocks.push(formatProgramPacketLintReports(packetReports).trimEnd())
  }

  outputBlocks.push("")
  outputBlocks.push("Program prompts")
  outputBlocks.push(formatProgramPromptContractReports(promptReports).trimEnd())

  console.log(outputBlocks.join("\n"))

  const hasDocFailures = docReports.some((report) => report.issues.length > 0)
  const hasPacketFailures = packetReports.some(
    (report) => report.issues.length > 0,
  )
  const hasPromptFailures = promptReports.some(
    (report) => report.issues.length > 0,
  )
  if (hasDocFailures || hasPacketFailures || hasPromptFailures) {
    process.exitCode = 1
  }
}

if (import.meta.url === new URL(process.argv[1] ?? "", "file://").href) {
  await main()
}
