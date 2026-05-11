import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createCompleteProjectDefinition } from "../src";
import { materializeRepoSnapshot } from "../src/server";

function splitMarkdownTableRow(row: string) {
	return row
		.trim()
		.replace(/^\|/, "")
		.replace(/\|$/, "")
		.split("|")
		.map((cell) => cell.trim());
}

function parseMarkdownTable(content: string, firstHeader: string) {
	const lines = content.split("\n");
	const headerIndex = lines.findIndex(
		(line) =>
			line.startsWith("|") && splitMarkdownTableRow(line)[0] === firstHeader,
	);

	expect(headerIndex).toBeGreaterThanOrEqual(0);

	const headers = splitMarkdownTableRow(lines[headerIndex] ?? "");
	const rows: Record<string, string>[] = [];

	for (const line of lines.slice(headerIndex + 2)) {
		if (!line.startsWith("|")) {
			break;
		}

		const cells = splitMarkdownTableRow(line);
		rows.push(
			Object.fromEntries(
				headers.map((header, index) => [header, cells[index] ?? ""]),
			),
		);
	}

	return rows;
}

function stripInlineCode(value: string) {
	return value.replace(/^`|`$/g, "");
}

function extractWorkflowRunCommands(content: string) {
	return content
		.split("\n")
		.map((line) => line.trim())
		.flatMap((line) => {
			const match = line.match(/^- run: (.+)$/);
			return match ? [match[1]] : [];
		});
}

async function writeGeneratedRepoSnapshot(targetRoot: string) {
	const snapshotFiles = await materializeRepoSnapshot(
		createCompleteProjectDefinition(),
	);

	for (const file of snapshotFiles) {
		const targetPath = path.join(targetRoot, file.path);
		await mkdir(path.dirname(targetPath), { recursive: true });
		await writeFile(targetPath, file.content);
	}
}

function runCleanRoomCommand(repoRoot: string, args: readonly string[]) {
	const result = spawnSync("bun", [...args], {
		cwd: repoRoot,
		encoding: "utf8",
		env: {
			...process.env,
			CI: "1",
		},
	});

	expect(
		result.status,
		[
			`bun ${args.join(" ")} failed`,
			"stdout:",
			result.stdout,
			"stderr:",
			result.stderr,
		].join("\n"),
	).toBe(0);

	return result;
}

describe("generated repo command contract", () => {
	it("materializes a clean generated repo and runs the no-provider command contract", async () => {
		const tempRoot = await mkdtemp(
			path.join(tmpdir(), "sbs-generated-command-contract-"),
		);
		const generatedRepoRoot = path.join(tempRoot, "ship-by-sunday-os");

		try {
			await writeGeneratedRepoSnapshot(generatedRepoRoot);

			runCleanRoomCommand(generatedRepoRoot, ["ci"]);
			runCleanRoomCommand(generatedRepoRoot, ["run", "programs:lint"]);
			runCleanRoomCommand(generatedRepoRoot, ["run", "plans:lint"]);
			runCleanRoomCommand(generatedRepoRoot, ["run", "codebase:contract"]);
			runCleanRoomCommand(generatedRepoRoot, ["run", "agentic:check"]);

			const testedRunCommands = new Set([
				"bun ci",
				"bun run programs:lint",
				"bun run plans:lint",
				"bun run codebase:contract",
				"bun run agentic:check",
			]);
			const packageJson = JSON.parse(
				await readFile(path.join(generatedRepoRoot, "package.json"), "utf8"),
			) as {
				scripts?: Record<string, string>;
			};
			const readiness = await readFile(
				path.join(generatedRepoRoot, "docs/build/docs/readiness.md"),
				"utf8",
			);
			const validationRows = parseMarkdownTable(
				readiness,
				"Source validation step",
			);
			const basicCiWorkflow = await readFile(
				path.join(
					generatedRepoRoot,
					".github/workflows/examples/basic-ci.example.yml",
				),
				"utf8",
			);
			const runnableRows = validationRows.filter(
				(row) => row.Type === "runnable",
			);
			const workflowRunCommands = extractWorkflowRunCommands(basicCiWorkflow);

			expect(runnableRows).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						"Source validation step": "Run Codebase contract check",
						"Package script": "`codebase:contract`",
						"Proof path": "`bun run codebase:contract`",
					}),
					expect.objectContaining({
						"Source validation step": "Run generated operating pack check",
						"Package script": "`agentic:check`",
						"Proof path": "`bun run agentic:check`",
					}),
				]),
			);
			expect(workflowRunCommands).toEqual([
				"bun ci",
				"bun run codebase:contract",
				"bun run agentic:check",
			]);

			for (const row of runnableRows) {
				const scriptName = stripInlineCode(row["Package script"] ?? "");
				const proofPath = stripInlineCode(row["Proof path"] ?? "");

				expect(packageJson.scripts?.[scriptName]).toBeDefined();
				expect(testedRunCommands.has(proofPath)).toBe(true);
			}

			for (const command of workflowRunCommands) {
				if (!command.startsWith("bun run ")) {
					expect(command).toBe("bun ci");
					continue;
				}

				expect(testedRunCommands.has(command)).toBe(true);
			}
		} finally {
			await rm(tempRoot, { force: true, recursive: true });
		}
	}, 60_000);
});
