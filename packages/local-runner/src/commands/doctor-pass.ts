import { readRunnerCredential } from "../core/local-runner-home";
import { readLocalProjectState } from "../core/local-project-state";
import { resolveRepositoryRoot } from "../core/repository-root";
import {
	runDoctorPass,
	uploadDoctorPassFindings,
} from "../core/doctor-pass/doctor-pass-runner";

type DoctorPassOptions = {
	repo?: string;
	json?: boolean;
	localOnly?: boolean;
	runId?: string;
	intakeProbePath?: string;
	codexBinary?: string;
};

export async function runDoctorPassCommand(argv: string[]) {
	const [action = "run", ...rest] = argv;
	if (action === "run") {
		return await runDoctorPassRunCommand(rest);
	}
	if (action === "upload") {
		return await runDoctorPassUploadCommand(rest);
	}
	throw new Error("Usage: ship-by-sunday doctor-pass <run|upload>");
}

async function runDoctorPassRunCommand(argv: string[]) {
	const options = parseDoctorPassOptions(argv);
	const { repositoryRoot } = await resolveRepositoryRoot({
		explicitRoot: options.repo,
	});
	const [state, credential] = await Promise.all([
		readLocalProjectState(repositoryRoot),
		readRunnerCredential({ repositoryRoot }),
	]);
	if (!state || !credential) {
		throw new Error("Run setup pair before doctor-pass run.");
	}

	const result = await runDoctorPass({
		repositoryRoot,
		state,
		credential,
		runId: options.runId,
		localOnly: options.localOnly,
		intakeProbePath: options.intakeProbePath,
		codexBinary: options.codexBinary,
	});

	if (options.json) {
		console.log(JSON.stringify(result, null, 2));
	} else {
		console.log(`Doctor pass wrote ${result.localReportRefPrefix}.`);
		console.log(`Sync preview digest: ${result.previewDigest ?? "not ready"}.`);
		console.log(`Findings: ${result.findings.length}.`);
	}
	return 0;
}

async function runDoctorPassUploadCommand(argv: string[]) {
	const options = parseDoctorPassOptions(argv);
	if (!options.runId) {
		throw new Error("doctor-pass upload requires --run-id.");
	}
	const { repositoryRoot } = await resolveRepositoryRoot({
		explicitRoot: options.repo,
	});
	const credential = await readRunnerCredential({ repositoryRoot });
	if (!credential) {
		throw new Error("Run setup pair before doctor-pass upload.");
	}

	const result = await uploadDoctorPassFindings({
		repositoryRoot,
		credential,
		runId: options.runId,
	});
	if (options.json) {
		console.log(JSON.stringify(result, null, 2));
	} else {
		console.log(
			`Uploaded findings. Inserted ${result?.insertedCount ?? 0}; patched ${result?.patchedCount ?? 0}.`,
		);
	}
	return 0;
}

function parseDoctorPassOptions(argv: string[]): DoctorPassOptions {
	const options: DoctorPassOptions = {};
	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === "--repo") {
			options.repo = requireOptionValue(argv, index, "--repo");
			index += 1;
		} else if (arg === "--json") {
			options.json = true;
		} else if (arg === "--local-only") {
			options.localOnly = true;
		} else if (arg === "--run-id") {
			options.runId = requireOptionValue(argv, index, "--run-id");
			index += 1;
		} else if (arg === "--intake-probe") {
			options.intakeProbePath = requireOptionValue(
				argv,
				index,
				"--intake-probe",
			);
			index += 1;
		} else if (arg === "--codex-binary") {
			options.codexBinary = requireOptionValue(argv, index, "--codex-binary");
			index += 1;
		} else {
			throw new Error(`Unknown doctor-pass option: ${arg}`);
		}
	}
	return options;
}

function requireOptionValue(argv: string[], index: number, optionName: string) {
	const value = argv[index + 1];
	if (!value) {
		throw new Error(`${optionName} requires a value.`);
	}
	return value;
}
