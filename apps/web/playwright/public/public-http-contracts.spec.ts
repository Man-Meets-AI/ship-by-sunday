import { expect, test } from "@playwright/test";

import { shouldVerifyCheckoutRoute } from "../env";

test("public crawl endpoints expose the indexable surface", async ({
	request,
}) => {
	const robotsResponse = await request.get("/robots.txt");
	const robotsBody = await robotsResponse.text();
	const sitemapResponse = await request.get("/sitemap.xml");
	const sitemapBody = await sitemapResponse.text();

	expect(robotsResponse.ok()).toBe(true);
	expect(robotsBody).toContain("Sitemap:");
	expect(robotsBody).toContain("/sitemap.xml");
	expect(robotsBody).toContain("Allow: /blog");
	expect(robotsBody).toContain("Disallow: /sign-in");

	expect(sitemapResponse.ok()).toBe(true);
	expect(sitemapBody).toContain("<urlset");
	expect(sitemapBody).toContain("/blog</loc>");
	expect(sitemapBody).toContain(
		"/blog/the-operating-system-beats-the-prompt</loc>",
	);
	expect(sitemapBody).toContain("/docs/local-setup</loc>");
});

test("checkout route can create a Stripe session", async ({ request }) => {
	test.skip(
		!shouldVerifyCheckoutRoute,
		"Set PLAYWRIGHT_CHECKOUT_SMOKE=1 to verify the deployed checkout route.",
	);

	const response = await request.post("/api/stripe/checkout");
	const body = await response.json();

	expect(response.ok()).toBe(true);
	expect(body).toMatchObject({
		sessionId: expect.stringMatching(/^cs_/),
		url: expect.stringContaining("checkout.stripe.com"),
	});
});
