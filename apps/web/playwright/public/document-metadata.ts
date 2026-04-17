import { expect, type Page } from "@playwright/test";

export async function expectCanonicalPath(page: Page, path: string) {
	const canonicalLink = page.locator('head link[rel="canonical"]').first();

	await expect(canonicalLink).toHaveAttribute("href", new RegExp(`${path}$`));
}

export async function expectStructuredData(
	page: Page,
	structuredDataType: string,
) {
	const structuredDataScripts = await page
		.locator('script[type="application/ld+json"]')
		.allTextContents();

	expect(structuredDataScripts.join("\n")).toContain(
		`"@type":"${structuredDataType}"`,
	);
}

export async function expectNoIndex(page: Page) {
	const robotsMeta = page.locator('head meta[name="robots"]').first();

	await expect(robotsMeta).toHaveAttribute("content", /noindex/i);
	await expect(robotsMeta).toHaveAttribute("content", /nofollow/i);
}
