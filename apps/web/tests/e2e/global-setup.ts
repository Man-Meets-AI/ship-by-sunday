import { mkdir } from "node:fs/promises";

import { chromium, type FullConfig, type Page } from "@playwright/test";

import {
	authStateDirectory,
	memberWithAccessEmail,
	memberWithAccessStorageStatePath,
	memberWithoutAccessEmail,
	memberWithoutAccessStorageStatePath,
	sharedPassword,
	shouldRunSandboxAuth,
} from "./auth-state";

export default async function globalSetup(config: FullConfig) {
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
	await createStorageState(config.projects[0]?.use.baseURL as string, {
		email: memberWithoutAccessEmail,
		storageStatePath: memberWithoutAccessStorageStatePath,
	});
	await createStorageState(config.projects[0]?.use.baseURL as string, {
		email: memberWithAccessEmail,
		storageStatePath: memberWithAccessStorageStatePath,
	});
}

async function createStorageState(
	baseURL: string,
	{
		email,
		storageStatePath,
	}: {
		email: string;
		storageStatePath: string;
	},
) {
	const browser = await chromium.launch();
	const page = await browser.newPage({ baseURL });

	try {
		await signIn(page, email);
		await page.context().storageState({ path: storageStatePath });
	} finally {
		await browser.close();
	}
}

async function signIn(page: Page, email: string) {
	await page.goto("/sign-in");
	await page.getByLabel(/^email$/i).fill(email);
	await page.getByLabel(/^password$/i).fill(sharedPassword);
	await page.getByRole("button", { name: /^sign in$/i }).click();
	await page.waitForLoadState("networkidle");
}

function isSandboxProjectRequested() {
	const argv = process.argv;
	return argv.includes("--project=sandbox-e2e") || argv.includes("sandbox-e2e");
}
