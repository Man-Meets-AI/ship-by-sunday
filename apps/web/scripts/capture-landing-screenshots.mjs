/**
 * Full-page PNGs of the marketing home page for decks / clients.
 *
 * Run from `apps/web` with the dev server up (`bun run dev`, `bun run dev:web:only`, or `bun run dev:web:raw`):
 *   node scripts/capture-landing-screenshots.mjs
 *
 * Headless Chromium often never completes Framer Motion `whileInView` reveals, so
 * marketing content stays at effective opacity 0. This script scrolls the page and
 * forces visible opacity on zero-opacity nodes under `<main>` before capturing.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const defaultUrl = "http://127.0.0.1:3000/";
const url = process.env.LANDING_URL ?? defaultUrl;
const outDir = path.resolve(
	process.env.LANDING_SCREENSHOT_DIR ??
		path.join(process.cwd(), "..", "..", ".screenshots", "landing-page"),
);

async function forceRevealMarketingContent(page) {
	await page.evaluate(() => {
		const root = document.querySelector("main");
		if (!root) return;
		for (const el of root.querySelectorAll("*")) {
			if (!(el instanceof HTMLElement)) continue;
			const o = getComputedStyle(el).opacity;
			if (o === "0") {
				el.style.opacity = "1";
				el.style.transform = "none";
			}
		}
	});
}

async function scrollFullPage(page) {
	await sleep(1500);
	const scrollHeight = await page.evaluate(
		() => document.documentElement.scrollHeight,
	);
	for (let y = 0; y <= scrollHeight; y += 500) {
		await page.evaluate((pos) => {
			window.scrollTo(0, pos);
		}, y);
		await sleep(100);
	}
	await page.evaluate(() => window.scrollTo(0, 0));
	await sleep(500);
	await forceRevealMarketingContent(page);
}

async function capture(viewport, filename) {
	const browser = await chromium.launch();
	const context = await browser.newContext({
		viewport,
		colorScheme: "light",
		reducedMotion: "reduce",
	});
	const page = await context.newPage();
	await page.goto(url, { waitUntil: "load", timeout: 60_000 });
	await scrollFullPage(page);
	await forceRevealMarketingContent(page);
	await sleep(400);
	await page.screenshot({ path: path.join(outDir, filename), fullPage: true });
	await browser.close();
}

await mkdir(outDir, { recursive: true });
await capture({ width: 1440, height: 900 }, "landing-desktop-1440-full.png");
await capture({ width: 390, height: 844 }, "landing-mobile-390-full.png");
console.log(`Wrote PNGs to ${outDir}`);
