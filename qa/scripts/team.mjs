import { spawnSync } from "node:child_process";
import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";

import { repoRoot } from "./lib/personas.mjs";

function parseArgs(argv) {
	const options = {};

	for (const argument of argv) {
		if (!argument.startsWith("--")) {
			continue;
		}

		const normalized = argument.replace(/^--/, "");
		const separatorIndex = normalized.indexOf("=");
		const key =
			separatorIndex === -1
				? normalized
				: normalized.slice(0, separatorIndex);
		const value =
			separatorIndex === -1 ? "" : normalized.slice(separatorIndex + 1);
		options[key] = value || "1";
	}

	return options;
}

function formatLocalDateStamp(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function runGitCommand(args) {
	const result = spawnSync("git", args, {
		cwd: repoRoot,
		encoding: "utf8",
	});

	if (result.status !== 0) {
		throw new Error(
			`git ${args.join(" ")} failed.\nstdout: ${result.stdout}\nstderr: ${result.stderr}`,
		);
	}

	return result.stdout
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}

function collectChangedFiles(baseRef) {
	const changedFiles = new Set();
	const commands = [
		["diff", "--name-only", "--cached"],
		["diff", "--name-only"],
		["ls-files", "--others", "--exclude-standard"],
	];

	if (baseRef) {
		commands.unshift(["diff", "--name-only", `${baseRef}...HEAD`]);
	}

	for (const command of commands) {
		for (const filePath of runGitCommand(command)) {
			changedFiles.add(filePath);
		}
	}

	return [...changedFiles].sort((left, right) => left.localeCompare(right));
}

function formatChangedFiles(changedFiles) {
	if (changedFiles.length === 0) {
		return "- No changed files detected.";
	}

	return changedFiles.map((filePath) => `- ${filePath}`).join("\n");
}

function parseDelimitedList(value) {
	if (!value) {
		return [];
	}

	return value
		.split("||")
		.map((item) => item.trim())
		.filter(Boolean);
}

function getAdvisorySpecialists() {
	return ["journey_mapper", "coverage_analyst", "gap_reviewer"];
}

function getExecutionSpecialists() {
	return [
		"browser_runner (only when browser execution is explicitly requested and the environment is safe)",
		"release_summarizer (after command-backed reviews or report-worthy verdicts)",
	];
}

function formatList(items) {
	return items.map((item) => `- ${item}`).join("\n");
}

function getReviewMode(input) {
	return input === "command-backed" ? "command-backed" : "advisory";
}

function getReleaseSummarizerNote(reviewMode) {
	if (reviewMode === "command-backed") {
		return "- Required for the final verdict because commands or concrete evidence are part of this review.";
	}

	return "- Optional. Use only if the review becomes command-backed or report-worthy during execution.";
}

function formatCommandEvidence(reviewMode, commands, environment) {
	if (commands.length > 0) {
		return commands.map((command) => `- ${command}`).join("\n");
	}

	if (reviewMode === "command-backed") {
		return `- Add the exact commands that ran in ${environment} and summarize only the evidence they actually produced.`;
	}

	return "- No commands planned yet. Add command evidence only if the review stops being advisory-only.";
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	const slug = options.slug ?? "local-review";
	const baseRef = options.base ?? "main";
	const reviewMode = getReviewMode(options["review-mode"]);
	const environment = options.environment ?? "not-declared";
	const commands = parseDelimitedList(options.commands);
	const dryRun = options["dry-run"] === "1";
	const dateStamp = formatLocalDateStamp(new Date());
	const changedFiles = collectChangedFiles(baseRef);
	const templatePath = path.join(repoRoot, "qa/templates/team-review.md");
	const template = await readFile(templatePath, "utf8");
	const reviewDirectory = path.join(repoRoot, "qa/reviews/local");
	const reviewPath = path.join(reviewDirectory, `${dateStamp}-${slug}.md`);
	const reviewPathRelative = path.relative(repoRoot, reviewPath);
	const advisorySpecialists = getAdvisorySpecialists();
	const executionSpecialists = getExecutionSpecialists();
	const recommendedPrompt =
		reviewMode === "command-backed"
			? `Go talk to our QA team about the ${slug} feature diff against ${baseRef}. This is a command-backed review in ${environment}. Start advisory-first, use the material-review specialist fan-out, separate proven behavior from missing proof, and use release_summarizer for the final verdict.`
			: `Go talk to our QA team about the ${slug} feature diff against ${baseRef}. Start advisory-first, map affected journeys, inspect current proof, call out missing proof, and recommend the smallest next run.`;

	const reviewContents = template
		.replaceAll("{{date}}", dateStamp)
		.replaceAll("{{slug}}", slug)
		.replaceAll("{{base_ref}}", baseRef)
		.replaceAll("{{review_path}}", reviewPathRelative)
		.replaceAll("{{review_mode}}", reviewMode)
		.replaceAll("{{environment}}", environment)
		.replaceAll("{{changed_files}}", formatChangedFiles(changedFiles))
		.replaceAll(
			"{{advisory_specialists}}",
			formatList(advisorySpecialists),
		)
		.replaceAll(
			"{{execution_specialists}}",
			formatList(executionSpecialists),
		)
		.replaceAll(
			"{{release_summarizer_note}}",
			getReleaseSummarizerNote(reviewMode),
		)
		.replaceAll(
			"{{command_evidence}}",
			formatCommandEvidence(reviewMode, commands, environment),
		)
		.replaceAll("{{recommended_prompt}}", recommendedPrompt);

	if (!dryRun) {
		await mkdir(reviewDirectory, { recursive: true });
		await writeFile(reviewPath, reviewContents, "utf8");
	}

	console.log(
		JSON.stringify(
			{
				status: dryRun ? "planned" : "scaffolded",
				baseRef,
				slug,
				reviewMode,
				environment,
				reviewPath: reviewPathRelative,
				changedFiles,
				advisorySpecialists,
				executionSpecialists,
				commands,
				recommendedPrompt,
			},
			null,
			2,
		),
	);
}

await main();
