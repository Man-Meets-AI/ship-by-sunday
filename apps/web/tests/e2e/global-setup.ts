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
	shouldRunSandboxAuth,
} from "./auth-state";

export default async function globalSetup(config: FullConfig) {
	const baseURL = getSandboxBaseUrl(config);
	const includesSandboxE2EProject = config.projects.some(
		(project) => project.name === "sandbox-e2e",
	);
	const sandboxProjectRequested = isSandboxProjectRequested();

	if (
		!shouldRunSandboxAuth ||
		!includesSandboxE2EProject ||
		!sandboxProjectRequested
	) {
		return;
	}

	await mkdir(authStateDirectory, { recursive: true });
	await createStorageState(baseURL, {
		email: memberWithoutAccessEmail,
		password: memberWithoutAccessPassword,
		storageStatePath: memberWithoutAccessStorageStatePath,
	});
	await createStorageState(baseURL, {
		email: memberWithAccessEmail,
		password: memberWithAccessPassword,
		storageStatePath: memberWithAccessStorageStatePath,
	});
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
	}: {
		email: string;
		password: string;
		storageStatePath: string;
	},
) {
	const browser = await chromium.launch();
	const page = await browser.newPage({ baseURL });

	try {
		await signIn(page, { email, password });
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
}

function isSandboxProjectRequested() {
	const argv = process.argv;
	return argv.includes("--project=sandbox-e2e") || argv.includes("sandbox-e2e");
}
