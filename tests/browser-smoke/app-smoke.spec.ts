import { expect, test } from "@playwright/test";

test("landing page renders the main offer CTA", async ({ request }) => {
	const response = await request.get("/?marketing=1");
	const html = await response.text();

	expect(response.ok()).toBe(true);
	expect(html).toContain("Go from app idea");
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
	expect(html).toContain("Check access");
});
