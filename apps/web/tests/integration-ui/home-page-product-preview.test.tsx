import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/_components/home-page/sections/scroll-reveal", () => ({
	ScrollReveal: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

vi.mock("@/components/ui/pointer-highlight", () => ({
	PointerHighlight: ({ children }: { children: React.ReactNode }) => (
		<span>{children}</span>
	),
}));

vi.mock("@/app/checkout/_components/checkout-button", () => ({
	CheckoutButton: ({
		label,
		className,
		testId,
		onBeforeCheckout,
	}: {
		label: string;
		className?: string;
		testId?: string;
		onBeforeCheckout?: () => void | Promise<void>;
	}) => (
		<button
			type="button"
			data-kind="checkout"
			data-testid={testId}
			className={className}
			onClick={() => void onBeforeCheckout?.()}
		>
			{label}
		</button>
	),
}));

vi.mock("@/app/checkout/_components/express-checkout-button", () => ({
	ExpressCheckoutButton: () => {
		throw new Error("Homepage checkout CTAs must not render Express Checkout.");
	},
}));

vi.mock("@/app/_components/home-page/support/home-page-support-widget", () => ({
	HomePageSupportWidget: () => <div data-testid="home-page-support-widget" />,
}));

import { homePageContent } from "@/app/_content/home-page";
import HomePage from "@/app/_components/home-page/home-page";
import { CodebaseDemoSectionBlock } from "@/app/_components/home-page/sections/codebase-demo/codebase-demo-section";
import {
	HOME_PAGE_CODEBASE_DRAFT_STORAGE_KEY,
	parseHomePageCodebaseDraftEnvelope,
} from "@/app/_components/home-page/sections/codebase-demo/home-page-codebase-draft-storage";
import { codebasePageSections } from "@/lib/codebase-flow/codebase-page-sections";

describe("CodebaseDemoSectionBlock", () => {
	beforeEach(() => {
		window.localStorage.clear();
	});

	afterEach(() => {
		window.localStorage.clear();
		vi.restoreAllMocks();
	});

	it("renders all 7 canonical sections in order with foundation, design, and pricing interactive", () => {
		render(
			<CodebaseDemoSectionBlock
				section={homePageContent.productPreviewSection}
			/>,
		);

		expect(
			screen.getByRole("heading", {
				name: "Install leverage and the loop repeats TOMORROW",
			}),
		).toBeTruthy();
		expect(
			screen
				.getByRole("button", {
					name: "I want an AI starter template",
				})
				.getAttribute("aria-pressed"),
		).toBe("true");
		expect(
			screen
				.getByRole("button", {
					name: "I want an AI worker",
				})
				.getAttribute("aria-pressed"),
		).toBe("false");

		const sidebarItems = screen.getAllByTestId(
			/codebase-demo-sidebar-section-/,
		);
		expect(sidebarItems.map((item) => item.dataset.testid)).toEqual([
			"codebase-demo-sidebar-section-foundation",
			"codebase-demo-sidebar-section-problem",
			"codebase-demo-sidebar-section-outcome",
			"codebase-demo-sidebar-section-design",
			"codebase-demo-sidebar-section-pricing",
			"codebase-demo-sidebar-section-setup",
			"codebase-demo-sidebar-section-generated-preview",
		]);

		expect(screen.getByTestId("codebase-demo-section-foundation")).toBeTruthy();
		expect(screen.getByTestId("codebase-demo-section-design")).toBeTruthy();
		expect(screen.getByTestId("codebase-demo-section-pricing")).toBeTruthy();
		expect(screen.getByTestId("codebase-demo-locked-problem")).toBeTruthy();
		expect(screen.getByTestId("codebase-demo-locked-outcome")).toBeTruthy();
		expect(screen.getByTestId("codebase-demo-locked-setup")).toBeTruthy();
		expect(
			screen.getByTestId("codebase-demo-locked-generated-preview"),
		).toBeTruthy();
	});

	it("typing into Foundation, choosing a Design preset, and toggling pricing model updates the draft and persists before checkout", async () => {
		const user = userEvent.setup();
		render(
			<CodebaseDemoSectionBlock
				section={homePageContent.productPreviewSection}
			/>,
		);

		const productNameInput = screen.getByTestId(
			"codebase-demo-input-product_name",
		);
		await user.type(productNameInput, "Telemetry Pro");
		expect((productNameInput as HTMLInputElement).value).toBe("Telemetry Pro");

		const linearChip = screen.getByTestId("codebase-demo-design-preset-linear");
		await user.click(linearChip);
		expect(linearChip.getAttribute("aria-checked")).toBe("true");

		const monthlyToggle = screen.getByTestId(
			"codebase-demo-pricing-model-monthly",
		);
		await user.click(monthlyToggle);
		expect(monthlyToggle.getAttribute("aria-checked")).toBe("true");
		expect(
			screen.getByTestId("codebase-demo-pricing-label").textContent,
		).toContain("monthly");

		const checkoutButton = screen.getByTestId("codebase-demo-checkout-cta");
		expect(checkoutButton.textContent).toContain(
			"Start my AI starter template",
		);
		await user.click(checkoutButton);

		await waitFor(() => {
			const raw = window.localStorage.getItem(
				HOME_PAGE_CODEBASE_DRAFT_STORAGE_KEY,
			);
			expect(raw).not.toBeNull();
			const envelope = parseHomePageCodebaseDraftEnvelope(raw ?? "");
			expect(envelope?.fields.product_name).toBe("Telemetry Pro");
			expect(envelope?.fields.design_preset_id).toBe("linear");
			expect(envelope?.fields.pricing_model).toBe("monthly");
			expect(envelope?.fields.theme_preset.length).toBeGreaterThan(0);
		});
	});

	it("lets visitors toggle the leverage hero starting point", async () => {
		const user = userEvent.setup();
		render(
			<CodebaseDemoSectionBlock
				section={homePageContent.productPreviewSection}
			/>,
		);

		const codebaseOption = screen.getByRole("button", {
			name: "I want an AI worker",
		});
		const ideaOption = screen.getByRole("button", {
			name: "I want an AI starter template",
		});

		expect(ideaOption.getAttribute("aria-pressed")).toBe("true");
		expect(screen.getByTestId("codebase-demo-idea-branch")).toBeTruthy();
		expect(screen.queryByTestId("codebase-demo-codebase-branch")).toBeNull();
		await user.click(codebaseOption);
		expect(codebaseOption.getAttribute("aria-pressed")).toBe("true");
		expect(ideaOption.getAttribute("aria-pressed")).toBe("false");
		expect(screen.queryByTestId("codebase-demo-idea-branch")).toBeNull();
		expect(screen.getByTestId("codebase-demo-codebase-branch")).toBeTruthy();
		expect(screen.getAllByText(/private doctor pass/i).length).toBeGreaterThan(
			0,
		);
		expect(
			screen.getByRole("link", { name: "the audit" }).getAttribute("href"),
		).toBe("#doctor-pass-audit");
		expect(document.querySelector("#doctor-pass-audit")?.textContent).toContain(
			"The Doctor Pass.",
		);
		expect(screen.getByText("The Doctor Pass.")).toBeTruthy();
		expect(screen.getByText("→ Local runner pairing")).toBeTruthy();
		expect(screen.queryByTestId("codebase-demo-checkout-cta")).toBeNull();
		expect(
			screen.getByTestId("codebase-demo-existing-checkout-cta"),
		).toBeTruthy();
	});

	it("keeps the shared homepage sections visible for the codebase starting point", async () => {
		const user = userEvent.setup();
		render(await HomePage());

		await user.click(
			screen.getByRole("button", {
				name: "I want an AI worker",
			}),
		);

		expect(screen.getByTestId("codebase-demo-codebase-branch")).toBeTruthy();
		expectPageTextToContain("Agent doctor for web apps");
		expectPageTextNotToContain("How Workers Work.");
		expectPageTextToContain("A worker layer. each hat, a trained role.");
		expectPageTextToContain("Role packets");
		expectPageTextToContain("PARKER, shipper of products,");
		expectPageTextToContain("startup scale to $73M/year");
		expectPageTextToContain("PROGRAMS.md is not a bigger ExecPlan.");
		expectPageTextToContain("Common Questions");
		expectPageTextToContain("Run the doctor pass by Sunday");
		expectPageTextNotToContain("Exec Loops: OpenAI's Weapon of choice");
		expectPageTextNotToContain(
			"An exec loop is the repeatable path from decision to agent run",
		);
		expect(
			screen.getAllByRole("img", { name: "Founder portrait" }),
		).toHaveLength(1);
		expect(document.querySelector("#system")).toBeNull();
	});

	it("does not create Express Checkout sessions during homepage render", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response("{}"));

		render(await HomePage());

		const createdExpressCheckoutSession = fetchMock.mock.calls.some(
			([input]) =>
				typeof input === "string" &&
				input.includes("/api/stripe/checkout/express"),
		);

		expect(createdExpressCheckoutSession).toBe(false);
		expect(document.querySelector("[data-testid$='-express']")).toBeNull();
		expect(
			screen
				.getByTestId("codebase-demo-checkout-cta")
				.getAttribute("data-kind"),
		).toBe("checkout");
	});

	it("exposes a theme toggle in the demo top bar", async () => {
		render(
			<CodebaseDemoSectionBlock
				section={homePageContent.productPreviewSection}
			/>,
		);

		const toggle = await screen.findByRole("button", {
			name: /switch to (dark|light) mode/i,
		});
		expect(toggle).toBeTruthy();
	});

	it("renders each locked card with the canonical 'After checkout' unlock preview line", () => {
		render(
			<CodebaseDemoSectionBlock
				section={homePageContent.productPreviewSection}
			/>,
		);

		const lockedSectionIds = [
			"problem",
			"outcome",
			"setup",
			"generated-preview",
		] as const;
		const sectionDescriptionById = new Map(
			codebasePageSections.map((section) => [section.id, section.description]),
		);
		for (const lockedId of lockedSectionIds) {
			const lockedNode = screen.getByTestId(`codebase-demo-locked-${lockedId}`);
			expect(lockedNode.textContent).toContain("After checkout:");
			const expectedDescription = sectionDescriptionById.get(lockedId);
			expect(expectedDescription).toBeDefined();
			expect(lockedNode.textContent).toContain(expectedDescription as string);
		}
	});
});

function expectPageTextToContain(expectedText: string) {
	const compactPageText = document.body.textContent?.replace(/\s+/g, "") ?? "";
	expect(compactPageText).toContain(expectedText.replace(/\s+/g, ""));
}

function expectPageTextNotToContain(expectedText: string) {
	const compactPageText = document.body.textContent?.replace(/\s+/g, "") ?? "";
	expect(compactPageText).not.toContain(expectedText.replace(/\s+/g, ""));
}
