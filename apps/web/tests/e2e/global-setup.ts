import path from "node:path";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";

import { chromium, type FullConfig, type Page } from "@playwright/test";

import {
	authStateDirectory,
	memberWithAccessEmail,
	memberWithAccessPassword,
	memberWithAccessStorageStatePath,
	memberWithoutAccessEmail,
	memberWithoutAccessPassword,
	memberWithoutAccessStorageStatePath,
	shouldRunAuthenticatedE2E,
} from "./auth-state";

const DEFAULT_COURSE_SLUG = "ship-by-sunday";
const localEnvPath = path.resolve(__dirname, "../../.env.local");
const appsWebDirectory = path.resolve(__dirname, "../..");
const convexBinPath = path.resolve(
	appsWebDirectory,
	"node_modules/convex/bin/main.js",
);

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
	await mkdir(authStateDirectory, { recursive: true });
	await createStorageState(baseURL, {
		email: memberWithoutAccessEmail,
		password: memberWithoutAccessPassword,
		storageStatePath: memberWithoutAccessStorageStatePath,
		syncProductAccessAfterSignIn: async (clerkUserId) => {
			await syncProductAccessState({
				clerkUserId,
				kind: "reset",
			});
			await syncPacketProgressState({
				clerkUserId,
				kind: "reset",
			});
		},
	});
	await createStorageState(baseURL, {
		email: memberWithAccessEmail,
		password: memberWithAccessPassword,
		storageStatePath: memberWithAccessStorageStatePath,
		syncProductAccessAfterSignIn: async (clerkUserId) => {
			await syncProductAccessState({
				clerkUserId,
				kind: "grant",
			});
			await syncPacketProgressState({
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

	process.loadEnvFile(localEnvPath);
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
		password,
		storageStatePath,
		syncProductAccessAfterSignIn,
	}: {
		email: string;
		password: string;
		storageStatePath: string;
		syncProductAccessAfterSignIn?: (clerkUserId: string) => Promise<void>;
	},
) {
	const browser = await chromium.launch();
	const page = await browser.newPage({ baseURL });

	try {
		const clerkUserId = await signIn(page, { email, password });
		if (syncProductAccessAfterSignIn) {
			await syncProductAccessAfterSignIn(clerkUserId);
		}
		await page.context().storageState({ path: storageStatePath });
	} finally {
		await browser.close();
	}
}

async function signIn(
	page: Page,
	{
		email,
		password,
	}: {
		email: string;
		password: string;
	},
) {
	await page.goto("/sign-in?redirect_url=%2Fstart", {
		waitUntil: "networkidle",
	});
	await page.waitForFunction(
		() => {
			const runtimeWindow = window as Window & {
				Clerk?: {
					loaded?: boolean;
					user?: { id?: string | null };
					session?: { id?: string | null };
				};
			};

			return runtimeWindow.Clerk?.loaded === true;
		},
		{
			timeout: 15_000,
		},
	);
	await page.getByLabel(/^email$/i).fill(email);
	await page.getByLabel(/^password$/i).fill(password);
	await page.getByRole("button", { name: /^sign in$/i }).click();
	try {
		await page.waitForURL((url) => url.pathname === "/start", {
			timeout: 15_000,
		});
	} catch {
		const alertText =
			(
				await page
					.getByRole("alert")
					.allTextContents()
					.catch(() => [])
			)
				.map((text) => text.trim())
				.filter(Boolean)
				.join(" | ") || "No alert text rendered.";
		throw new Error(
			`Failed to establish a QA session for ${email}. Expected /start after sign-in, got ${page.url()}. ${alertText}`,
		);
	}
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
	await page.waitForLoadState("networkidle");

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

function isSandboxProjectRequested() {
	const argv = process.argv;
	return argv.includes("--project=sandbox-e2e") || argv.includes("sandbox-e2e");
}

async function syncProductAccessState({
	clerkUserId,
	kind,
}: {
	clerkUserId: string;
	kind: "grant" | "reset";
}) {
	const result =
		kind === "grant"
			? await runConvexInternalCommand({
					functionName: "access:grantProductAccess",
					args: {
						clerkUserId,
						source: "manual",
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

async function syncPacketProgressState({
	clerkUserId,
	kind,
}: {
	clerkUserId: string;
	kind: "seed_complete" | "reset";
}) {
	const result =
		kind === "seed_complete"
			? await runConvexInternalCommand({
					functionName: "packet:seedCompleteProjectDefinitionForQa",
					args: {
						clerkUserId,
					},
					env: process.env,
				})
			: await runConvexInternalCommand({
					functionName: "packet:resetProjectDefinitionForQa",
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
			? "seed complete packet progress"
			: "reset packet progress";
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
	args: Record<string, string>;
	env: NodeJS.ProcessEnv;
}) {
	return new Promise<{
		code: number;
		stdout: string;
		stderr: string;
	}>((resolve) => {
		const child = spawn(
			process.execPath,
			[convexBinPath, "run", functionName, JSON.stringify(args)],
			{
				cwd: appsWebDirectory,
				env,
				stdio: ["ignore", "pipe", "pipe"],
			},
		);

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
