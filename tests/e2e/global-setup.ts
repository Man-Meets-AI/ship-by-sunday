import { mkdir } from "node:fs/promises";

import { chromium, type FullConfig, type Page } from "@playwright/test";

import {
	authStateDirectory,
	entitledEmail,
	entitledStorageStatePath,
	nonEntitledEmail,
	nonEntitledStorageStatePath,
	sharedPassword,
	shouldRunSandboxAuth,
} from "./auth-state";

export default async function globalSetup(config: FullConfig) {
	if (!shouldRunSandboxAuth) {
		return;
	}

	await mkdir(authStateDirectory, { recursive: true });
	await createStorageState(config.projects[0]?.use.baseURL as string, {
		email: nonEntitledEmail,
		storageStatePath: nonEntitledStorageStatePath,
	});
	await createStorageState(config.projects[0]?.use.baseURL as string, {
		email: entitledEmail,
		storageStatePath: entitledStorageStatePath,
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
	await page.getByLabel(/email address/i).fill(email);
	await page.getByLabel(/^password$/i).fill(sharedPassword);
	await page.getByRole("button", { name: /continue|sign in/i }).click();
	await page.waitForLoadState("networkidle");
}
