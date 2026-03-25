import { expect, test } from "@playwright/test";

test("landing page renders the main offer CTA", async ({ request }) => {
	const response = await request.get("/?marketing=1");
	const html = await response.text();

	expect(response.ok()).toBe(true);
	expect(html).toContain("Turn one product idea");
	expect(html).toContain("Agent-Ready Packs");
	expect(html).toContain("Agents will change. Your packs still work.");
	expect(html).toContain("Get instant access");
	expect(html).toContain('id="system"');
	expect(html).toContain('id="pricing"');
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
	expect(robotsBody).toContain("Disallow: /sign-in");

	expect(sitemapResponse.ok()).toBe(true);
	expect(sitemapBody).toContain("<urlset");
	expect(sitemapBody).toContain("/docs/local-setup</loc>");
});

test("docs pages emit canonical tags and auth pages emit noindex", async ({
	request,
}) => {
	const docsResponse = await request.get("/docs/local-setup");
	const docsHtml = await docsResponse.text();
	const signInResponse = await request.get("/sign-in");
	const signInHtml = (await signInResponse.text()).toLowerCase();

	expect(docsResponse.ok()).toBe(true);
	expect(docsHtml).toContain('rel="canonical"');
	expect(docsHtml).toContain("/docs/local-setup");
	expect(docsHtml).toContain('property="og:type"');
	expect(docsHtml).toContain('content="article"');

	expect(signInResponse.ok()).toBe(true);
	expect(signInHtml).toContain('name="robots"');
	expect(signInHtml).toContain("noindex");
	expect(signInHtml).toContain("nofollow");
});
