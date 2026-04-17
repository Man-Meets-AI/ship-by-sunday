import { expect, test } from "@playwright/test";

import { shouldVerifyCheckoutRoute } from "./env";

test("landing page renders the main offer CTA", async ({ request }) => {
	const response = await request.get("/?marketing=1");
	const html = await response.text();

	expect(response.ok()).toBe(true);
	expect(html).toContain("Ship a real product");
	expect(html).toContain("by Sunday");
	expect(html).toContain(
		"More than a starter. A system you can keep shipping from.",
	);
	expect(html).toContain("One source of truth. No drift.");
	expect(html).toContain("Get the system");
	expect(html).toContain('id="system"');
	expect(html).toContain('id="pricing"');
	expect(html).toContain("Sign in");
});

test("checkout success without a session renders the recovery surface", async ({
	request,
}) => {
	const response = await request.get("/checkout/success");
	const html = await response.text();

	expect(response.ok()).toBe(true);
	expect(html).toContain("Verify access");
	expect(html).toContain("Missing checkout session");
	expect(html).toContain("Open workspace");
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

test("homepage renders structured SEO data", async ({ request }) => {
	const response = await request.get("/?marketing=1");
	const html = await response.text();

	expect(response.ok()).toBe(true);
	expect(html).toContain('type="application/ld+json"');
	expect(html).toContain('"@type":"FAQPage"');
	expect(html).toContain('"@type":"Product"');
});

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

test("blog index renders the published post and canonical tag", async ({
	request,
}) => {
	const response = await request.get("/blog");
	const html = await response.text();

	expect(response.ok()).toBe(true);
	expect(html).toContain("Build the operating system");
	expect(html).toContain("The operating system beats the prompt");
	expect(html).toContain('rel="canonical"');
	expect(html).toContain('type="application/ld+json"');
	expect(html).toContain('"@type":"Blog"');
	expect(html).toContain("/blog");
});

test("blog article emits article metadata and shared promo content", async ({
	request,
}) => {
	const response = await request.get(
		"/blog/the-operating-system-beats-the-prompt",
	);
	const html = await response.text();

	expect(response.ok()).toBe(true);
	expect(html).toContain("The operating system beats the prompt");
	expect(html).toContain('rel="canonical"');
	expect(html).toContain("/blog/the-operating-system-beats-the-prompt");
	expect(html).toContain('property="og:type"');
	expect(html).toContain('content="article"');
	expect(html).toContain('type="application/ld+json"');
	expect(html).toContain('"@type":"BlogPosting"');
	expect(html).toContain("Ship a real product by Sunday");
	expect(html).toContain("Contents");
	expect(html).toContain("The interface should prove the sequence");
	expect(html).toContain("The build breaks when the facts stop being durable");
});

test("docs pages emit canonical tags and auth pages emit noindex", async ({
	request,
}) => {
	const docsResponse = await request.get("/docs/local-setup");
	const docsHtml = await docsResponse.text();
	const signInResponse = await request.get("/sign-in");
	const signInHtml = await signInResponse.text();
	const signInRobotsHtml = signInHtml.toLowerCase();
	const resetPasswordResponse = await request.get(
		"/session-tasks/reset-password",
	);
	const resetPasswordHtml = await resetPasswordResponse.text();
	const resetPasswordRobotsHtml = resetPasswordHtml.toLowerCase();
	const ssoCallbackResponse = await request.get("/sso-callback");
	const ssoCallbackHtml = await ssoCallbackResponse.text();
	const ssoCallbackRobotsHtml = ssoCallbackHtml.toLowerCase();

	expect(docsResponse.ok()).toBe(true);
	expect(docsHtml).toContain('rel="canonical"');
	expect(docsHtml).toContain("/docs/local-setup");
	expect(docsHtml).toContain('property="og:type"');
	expect(docsHtml).toContain('content="article"');

	expect(signInResponse.ok()).toBe(true);
	expect(signInHtml).toContain('aria-label="Ship by Sunday"');
	expect(signInHtml).toContain(
		"Reconnect the workspace tied to your checkout.",
	);
	expect(signInRobotsHtml).toContain('name="robots"');
	expect(signInRobotsHtml).toContain("noindex");
	expect(signInRobotsHtml).toContain("nofollow");

	expect(resetPasswordResponse.ok()).toBe(true);
	expect(resetPasswordHtml).toContain("Reset your password");
	expect(resetPasswordHtml).toContain("Finish the required recovery step.");
	expect(resetPasswordRobotsHtml).toContain('name="robots"');
	expect(resetPasswordRobotsHtml).toContain("noindex");
	expect(resetPasswordRobotsHtml).toContain("nofollow");

	expect(ssoCallbackResponse.ok()).toBe(true);
	expect(ssoCallbackHtml).toContain("Completing Google sign-in");
	expect(ssoCallbackHtml).toContain(
		"We are stitching the Google session back into your purchased account.",
	);
	expect(ssoCallbackRobotsHtml).toContain('name="robots"');
	expect(ssoCallbackRobotsHtml).toContain("noindex");
	expect(ssoCallbackRobotsHtml).toContain("nofollow");
});
