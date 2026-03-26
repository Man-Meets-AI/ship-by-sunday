import {
	buildClerkConvexDevAuthReport,
	buildClerkConvexDevFixSteps,
	buildStartupSuccessMessage,
	formatCheck,
	getConvexEnvEntries,
	getHostedConvexDevContext,
} from "./lib/clerk-convex-dev-auth-guardrail.mjs";

function readTrimmedEnvValue(name) {
	return process.env[name]?.trim() || null;
}

function renderFailureReport(report, fixSteps) {
	console.error("Clerk + Convex dev auth doctor");
	console.error("");

	for (const check of report.checks) {
		console.error(formatCheck(check));
	}

	console.error("");
	console.error("Fix");

	for (const [index, step] of fixSteps.entries()) {
		console.error(`${index + 1}. ${step}`);
	}
}

async function main() {
	const isStartupCheck = process.argv.includes("--startup-check");
	const hostedConvexDevContext = getHostedConvexDevContext(process.env);

	if (!hostedConvexDevContext) {
		console.error(
			"Missing hosted Convex dev deployment config in .env.local. Run `bun run dev:convex` to sync NEXT_PUBLIC_CONVEX_URL and CONVEX_DEPLOYMENT first.",
		);
		process.exit(1);
	}

	const convexEnvEntries = await getConvexEnvEntries();
	const report = buildClerkConvexDevAuthReport({
		convexUrl: hostedConvexDevContext.convexUrl,
		deploymentName: hostedConvexDevContext.deploymentName,
		hostedFrontendApiUrl:
			convexEnvEntries.CLERK_FRONTEND_API_URL?.trim() || null,
		localFrontendApiUrl: readTrimmedEnvValue("CLERK_FRONTEND_API_URL"),
		localPublishableKey: readTrimmedEnvValue(
			"NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
		),
		localSecretKey: readTrimmedEnvValue("CLERK_SECRET_KEY"),
	});

	if (report.hasFailure) {
		renderFailureReport(
			report,
			buildClerkConvexDevFixSteps({
				deploymentName: hostedConvexDevContext.deploymentName,
			}),
		);
		process.exit(1);
	}

	if (isStartupCheck) {
		console.log(
			buildStartupSuccessMessage({
				deploymentName: hostedConvexDevContext.deploymentName,
				localFrontendApiUrl: readTrimmedEnvValue("CLERK_FRONTEND_API_URL"),
				localPublishableKey: readTrimmedEnvValue(
					"NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
				),
			}),
		);
		return;
	}

	console.log("Clerk + Convex dev auth doctor");
	console.log("");

	for (const check of report.checks) {
		console.log(formatCheck(check));
	}
}

await main();
