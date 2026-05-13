import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";

import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { chromium, type FullConfig, type Page } from "@playwright/test";

import {
	authStateDirectory,
	getAuthenticatedE2EPrereqProblems,
	memberWithAccessEmail,
	memberWithAccessStorageStatePath,
	memberWithoutAccessEmail,
	memberWithoutAccessStorageStatePath,
	shouldRunAuthenticatedE2E,
} from "./auth-state";

const DEFAULT_COURSE_SLUG = "ship-by-sunday";
const appsWebDirectory = path.resolve(__dirname, "../..");
const workspaceRootDirectory = path.resolve(appsWebDirectory, "../..");
const convexBinPath = resolveConvexBinPath();

export default async function globalSetup(config: FullConfig) {
	const baseURL = getSandboxBaseUrl(config);
	const includesSandboxE2EProject = config.projects.some(
		(project) => project.name === "sandbox-e2e",
	);
	const sandboxProjectRequested = isSandboxProjectRequested();

	if (
		!shouldRunAuthenticatedE2E ||
		!includesSandboxE2EProject ||
		!sandboxProjectRequested
	) {
		return;
	}

	loadHostedConvexEnv();
	const prereqProblems = getAuthenticatedE2EPrereqProblems();
	if (prereqProblems.length > 0) {
		throw new Error(
			`Authenticated Playwright bootstrap is not configured correctly.\n${prereqProblems
				.map((problem, index) => `${index + 1}. ${problem}`)
				.join("\n")}`,
		);
	}

	await clerkSetup({ dotenv: false });
	await mkdir(authStateDirectory, { recursive: true });
	await createStorageState(baseURL, {
		email: memberWithoutAccessEmail,
		storageStatePath: memberWithoutAccessStorageStatePath,
		syncProductAccessAfterSignIn: async (clerkUserId) => {
			await syncProductAccessState({
				clerkUserId,
				email: memberWithoutAccessEmail,
				kind: "reset",
			});
			await syncCodebaseProgressState({
				clerkUserId,
				kind: "reset",
			});
		},
	});
	await createStorageState(baseURL, {
		email: memberWithAccessEmail,
		storageStatePath: memberWithAccessStorageStatePath,
		syncProductAccessAfterSignIn: async (clerkUserId) => {
			await syncProductAccessState({
				clerkUserId,
				email: memberWithAccessEmail,
				kind: "grant",
				fulfillmentTrack: "generated_codebase",
			});
			await syncCodebaseProgressState({
				clerkUserId,
				kind: "seed_complete",
			});
		},
	});
}

function loadHostedConvexEnv() {
	if (
		process.env.NEXT_PUBLIC_CONVEX_URL &&
		process.env.CONVEX_DEPLOYMENT &&
		process.env.CLERK_SECRET_KEY
	) {
		return;
	}

	process.loadEnvFile(resolveHostedEnvPath());
}

function resolveHostedEnvPath() {
	const configuredEnvFile = process.env.QA_ENV_FILE?.trim();
	if (!configuredEnvFile) {
		return path.resolve(appsWebDirectory, ".env.local");
	}

	if (path.isAbsolute(configuredEnvFile)) {
		return configuredEnvFile;
	}

	return path.resolve(workspaceRootDirectory, configuredEnvFile);
}

function getSandboxBaseUrl(config: FullConfig) {
	const sandboxProject = config.projects.find(
		(project) => project.name === "sandbox-e2e",
	);
	const baseURL = sandboxProject?.use.baseURL;

	if (typeof baseURL !== "string" || baseURL.length === 0) {
		throw new Error(
			"Playwright sandbox auth bootstrap requires a non-empty baseURL.",
		);
	}

	return baseURL;
}

async function createStorageState(
	baseURL: string,
	{
		email,
		storageStatePath,
		syncProductAccessAfterSignIn,
	}: {
		email: string;
		storageStatePath: string;
		syncProductAccessAfterSignIn?: (clerkUserId: string) => Promise<void>;
	},
) {
	const consoleMessages: string[] = [];
	const pageErrors: string[] = [];
	const browser = await chromium.launch();
	const page = await browser.newPage({ baseURL });
	page.on("console", (message) => {
		consoleMessages.push(`[${message.type()}] ${message.text().trim()}`.trim());
	});
	page.on("pageerror", (error) => {
		pageErrors.push(error.message);
	});

	try {
		const clerkUserId = await signIn(
			page,
			{ email },
			{ consoleMessages, pageErrors },
		);
		if (syncProductAccessAfterSignIn) {
			await syncProductAccessAfterSignIn(clerkUserId);
		}
		await page.context().storageState({ path: storageStatePath });
	} catch (error) {
		const artifactSummary = await captureAuthBootstrapArtifacts(page, email);
		throw new Error(
			`Failed to create Playwright auth storage state for ${email} at ${baseURL} (${storageStatePath}). ${await describeAuthBootstrapPage(
				page,
				{
					consoleMessages,
					pageErrors,
				},
			)}. ${artifactSummary}. ${formatAuthBootstrapError(error)}`,
		);
	} finally {
		await browser.close();
	}
}

async function signIn(
	page: Page,
	{
		email,
	}: {
		email: string;
	},
	diagnostics: {
		consoleMessages: string[];
		pageErrors: string[];
	},
) {
	const signInPath = "/sign-in?redirect_url=%2Fgenerate-codebase";
	await assertPasswordlessOtpCanSend(page, {
		diagnostics,
		email,
		signInPath,
	});
	await page.goto(signInPath, {
		waitUntil: "networkidle",
	});
	await waitForClerkLoaded(page, { diagnostics, email, signInPath });
	await clerk.signIn({ page, emailAddress: email });
	await page.goto("/generate-codebase", {
		waitUntil: "networkidle",
	});
	try {
		await waitForSignedInWorkspaceLanding(page);
	} catch (error) {
		throw new Error(
			`Playwright auth bootstrap reached the sign-in form for ${email} but never reached an authenticated workspace landing page. ${await describeAuthBootstrapPage(page, diagnostics)}. ${formatAuthBootstrapError(error)}`,
		);
	}
	try {
		await page.waitForFunction(
			() => {
				const runtimeWindow = window as Window & {
					Clerk?: {
						user?: { id?: string | null };
						session?: { id?: string | null };
					};
				};

				return (
					Boolean(runtimeWindow.Clerk?.user?.id) &&
					Boolean(runtimeWindow.Clerk?.session?.id)
				);
			},
			{
				timeout: 15_000,
			},
		);
	} catch (error) {
		throw new Error(
			`Playwright auth bootstrap reached an authenticated workspace landing page for ${email}, but Clerk never exposed a user/session pair. ${await describeAuthBootstrapPage(page, diagnostics)}. ${formatAuthBootstrapError(error)}`,
		);
	}

	const clerkUserId = await page.evaluate(() => {
		const runtimeWindow = window as Window & {
			Clerk?: {
				user?: { id?: string | null };
			};
		};

		return runtimeWindow.Clerk?.user?.id ?? null;
	});

	if (!clerkUserId) {
		throw new Error(`Missing Clerk user id after sign-in for ${email}.`);
	}

	return clerkUserId;
}

async function waitForClerkLoaded(
	page: Page,
	{
		diagnostics,
		email,
		signInPath,
	}: {
		diagnostics: {
			consoleMessages: string[];
			pageErrors: string[];
		};
		email: string;
		signInPath: string;
	},
) {
	try {
		await page.waitForFunction(
			() => {
				const runtimeWindow = window as Window & {
					Clerk?: {
						loaded?: boolean;
					};
				};

				return runtimeWindow.Clerk?.loaded === true;
			},
			{
				timeout: 15_000,
			},
		);
	} catch (error) {
		throw new Error(
			`Clerk did not finish loading while bootstrapping Playwright auth for ${email} at ${page.url()}. Expected ${signInPath}. ${await describeAuthBootstrapPage(page, diagnostics)}. ${formatAuthBootstrapError(error)}`,
		);
	}
}

async function assertPasswordlessOtpCanSend(
	page: Page,
	{
		diagnostics,
		email,
		signInPath,
	}: {
		diagnostics: {
			consoleMessages: string[];
			pageErrors: string[];
		};
		email: string;
		signInPath: string;
	},
) {
	await page.goto(signInPath, {
		waitUntil: "networkidle",
	});
	await waitForClerkLoaded(page, { diagnostics, email, signInPath });

	const passwordFieldCount = await page.getByLabel(/^password$/i).count();
	if (passwordFieldCount > 0) {
		throw new Error(
			`Passwordless release proof found ${passwordFieldCount} password field(s) on ${signInPath} for ${email}.`,
		);
	}

	await page.getByLabel(/^email$/i).fill(email);
	await page.getByRole("button", { name: /^send email code$/i }).click();
	try {
		await page
			.getByLabel(/^email code$/i)
			.waitFor({ state: "visible", timeout: 20_000 });
	} catch (error) {
		throw new Error(
			`Passwordless release proof could not send an email code for ${email}. ${await describeAuthBootstrapPage(page, diagnostics)}. ${formatAuthBootstrapError(error)}`,
		);
	}
}

async function waitForSignedInWorkspaceLanding(page: Page) {
	await page.waitForURL(
		(url) =>
			url.pathname === "/generate-codebase" ||
			url.pathname === "/home" ||
			url.pathname === "/workers/setup",
		{
			timeout: 15_000,
		},
	);
}

async function describeAuthBootstrapPage(
	page: Page,
	diagnostics: {
		consoleMessages: string[];
		pageErrors: string[];
	},
) {
	const [title, alertText, clerkState] = await Promise.all([
		page.title().catch(() => ""),
		page
			.getByRole("alert")
			.allTextContents()
			.catch(() => []),
		page
			.evaluate(() => {
				const runtimeWindow = window as Window & {
					Clerk?: {
						loaded?: boolean;
						user?: { id?: string | null };
						session?: { id?: string | null };
					};
				};

				return {
					loaded: runtimeWindow.Clerk?.loaded ?? null,
					userId: runtimeWindow.Clerk?.user?.id ?? null,
					sessionId: runtimeWindow.Clerk?.session?.id ?? null,
				};
			})
			.catch(() => ({
				loaded: null,
				userId: null,
				sessionId: null,
			})),
	]);

	const normalizedAlertText =
		alertText
			.map((text) => text.trim())
			.filter(Boolean)
			.join(" | ") || "No alert text rendered.";

	const recentConsoleMessages =
		diagnostics.consoleMessages.slice(-5).join(" | ") ||
		"No console messages captured.";
	const recentPageErrors =
		diagnostics.pageErrors.slice(-3).join(" | ") || "No page errors captured.";

	return `page=${page.url()}, title=${title || "Unknown title"}, alert=${normalizedAlertText}, clerkLoaded=${String(clerkState.loaded)}, clerkUser=${clerkState.userId ?? "null"}, clerkSession=${clerkState.sessionId ?? "null"}, console=${recentConsoleMessages}, pageErrors=${recentPageErrors}`;
}

function formatAuthBootstrapError(error: unknown) {
	if (error instanceof Error) {
		return error.message;
	}

	return String(error);
}

async function captureAuthBootstrapArtifacts(page: Page, email: string) {
	const safeEmail = email.replaceAll(/[^a-z0-9]+/gi, "-").toLowerCase();
	const artifactDirectory = path.join(authStateDirectory, "bootstrap-failures");
	await mkdir(artifactDirectory, { recursive: true });

	const screenshotPath = path.join(artifactDirectory, `${safeEmail}.png`);
	const htmlPath = path.join(artifactDirectory, `${safeEmail}.html`);

	await page
		.screenshot({ path: screenshotPath, fullPage: true })
		.catch(() => {});
	const content = await page.content().catch(() => null);
	if (content) {
		await writeFile(htmlPath, content, "utf8").catch(() => {});
	}

	return `Artifacts: screenshot=${screenshotPath}, html=${htmlPath}`;
}

function isSandboxProjectRequested() {
	const argv = process.argv;
	return argv.includes("--project=sandbox-e2e") || argv.includes("sandbox-e2e");
}

function resolveConvexBinPath() {
	const requireFromAppsWeb = createRequire(
		path.resolve(appsWebDirectory, "package.json"),
	);
	const convexPackageJsonPath = requireFromAppsWeb.resolve(
		"convex/package.json",
	);
	return path.join(path.dirname(convexPackageJsonPath), "bin/main.js");
}

async function syncProductAccessState({
	clerkUserId,
	email,
	kind,
	fulfillmentTrack,
}: {
	clerkUserId: string;
	email: string;
	kind: "grant" | "reset";
	fulfillmentTrack?: "generated_codebase" | "existing_codebase_doctor";
}) {
	if (kind === "reset") {
		const pendingClaimResetResult = await runConvexInternalCommand({
			functionName: "checkoutClaims:resetPendingCheckoutClaimsForEmail",
			args: {
				checkoutEmail: email,
			},
			env: process.env,
		});

		if (pendingClaimResetResult.code !== 0) {
			throw new Error(
				`Failed to reset pending checkout claims for ${email}. ${pendingClaimResetResult.stderr || pendingClaimResetResult.stdout || "No command output."}`,
			);
		}
	}

	const result =
		kind === "grant"
			? await runConvexInternalCommand({
					functionName: "access:grantProductAccess",
					args: {
						clerkUserId,
						source: "manual",
						capabilities: ["generate_codebase", "tutorials"],
						...(fulfillmentTrack ? { fulfillmentTrack } : {}),
					},
					env: {
						...process.env,
						QA_COURSE_SLUG: DEFAULT_COURSE_SLUG,
					},
				})
			: await runConvexInternalCommand({
					functionName: "access:resetProductAccess",
					args: {
						clerkUserId,
					},
					env: process.env,
				});

	if (result.code === 0) {
		return;
	}

	const actionLabel =
		kind === "grant" ? "grant entitled access" : "reset access";
	throw new Error(
		`Failed to ${actionLabel} for ${clerkUserId}. ${result.stderr || result.stdout || "No command output."}`,
	);
}

async function syncCodebaseProgressState({
	clerkUserId,
	kind,
}: {
	clerkUserId: string;
	kind: "seed_complete" | "reset";
}) {
	const result =
		kind === "seed_complete"
			? await runConvexInternalCommand({
					functionName: "codebase:seedCompleteProjectDefinitionForQa",
					args: {
						clerkUserId,
					},
					env: process.env,
				})
			: await runConvexInternalCommand({
					functionName: "codebase:resetProjectDefinitionForQa",
					args: {
						clerkUserId,
					},
					env: process.env,
				});

	if (result.code === 0) {
		return;
	}

	const actionLabel =
		kind === "seed_complete"
			? "seed complete codebase progress"
			: "reset codebase progress";
	throw new Error(
		`Failed to ${actionLabel} for ${clerkUserId}. ${result.stderr || result.stdout || "No command output."}`,
	);
}

function runConvexInternalCommand({
	functionName,
	args,
	env,
}: {
	functionName: string;
	args: Record<string, unknown>;
	env: NodeJS.ProcessEnv;
}) {
	const convexEnv = withConvexDeploymentEnv(env);

	return new Promise<{
		code: number;
		stdout: string;
		stderr: string;
	}>((resolve) => {
		const convexCommandArguments = [
			convexBinPath,
			"run",
			...(isProductionQaTarget(convexEnv) ? ["--prod"] : []),
			functionName,
			JSON.stringify(args),
		];
		const child = spawn(process.execPath, convexCommandArguments, {
			cwd: appsWebDirectory,
			env: convexEnv,
			stdio: ["ignore", "pipe", "pipe"],
		});

		let stdout = "";
		let stderr = "";

		child.stdout.on("data", (chunk) => {
			stdout += String(chunk);
		});
		child.stderr.on("data", (chunk) => {
			stderr += String(chunk);
		});
		child.on("close", (code) => {
			resolve({
				code: code ?? 1,
				stdout: stdout.trim(),
				stderr: stderr.trim(),
			});
		});
	});
}
function isProductionQaTarget(env: NodeJS.ProcessEnv = process.env) {
	return (
		env.QA_ENV_FILE?.endsWith(".env.production") === true ||
		env.PLAYWRIGHT_BASE_URL === "https://www.man-meets-ai.com"
	);
}

function isHostedQaTarget(env: NodeJS.ProcessEnv = process.env) {
	const baseUrl = env.PLAYWRIGHT_BASE_URL?.trim();
	if (!baseUrl) {
		return false;
	}

	try {
		const hostname = new URL(baseUrl).hostname;
		return hostname !== "localhost" && hostname !== "127.0.0.1";
	} catch {
		return false;
	}
}

export function withConvexDeploymentEnv(env: NodeJS.ProcessEnv) {
	if (env.CONVEX_DEPLOYMENT || !isHostedQaTarget(env)) {
		return env;
	}

	const convexUrl = env.NEXT_PUBLIC_CONVEX_URL?.trim();
	if (!convexUrl) {
		return env;
	}

	const deploymentName = new URL(convexUrl).hostname.split(".")[0];
	if (!deploymentName) {
		return env;
	}

	return {
		...env,
		CONVEX_DEPLOYMENT:
			isProductionQaTarget(env) || deploymentName.startsWith("prod:")
				? deploymentName
				: `prod:${deploymentName}`,
	};
}
