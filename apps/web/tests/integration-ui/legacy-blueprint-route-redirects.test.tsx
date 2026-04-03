import { describe, expect, it, vi } from "vitest";
import { redirect } from "next/navigation";
import BuildPlanPage from "@/app/(workspace)/build-plan/[stepId]/page";
import DesignPage from "@/app/(workspace)/design/[stepId]/page";
import MarketingPage from "@/app/(workspace)/marketing/[stepId]/page";
import ProductPage from "@/app/(workspace)/product/[stepId]/page";
import StartPage from "@/app/(workspace)/start/page";

vi.mock("next/navigation", () => ({
	redirect: vi.fn((href: string) => {
		throw new Error(`NEXT_REDIRECT:${href}`);
	}),
}));

describe("legacy blueprint route redirects", () => {
	it("redirects the old stage entry routes to the canonical blueprint page", async () => {
		await expect(StartPage()).rejects.toThrowError("NEXT_REDIRECT:/blueprint");
	});

	it("redirects old step routes to the matching blueprint anchors", async () => {
		await expect(
			ProductPage({ params: Promise.resolve({ stepId: "problem" }) }),
		).rejects.toThrowError("NEXT_REDIRECT:/blueprint#problem");
		await expect(
			DesignPage({ params: Promise.resolve({ stepId: "references" }) }),
		).rejects.toThrowError("NEXT_REDIRECT:/blueprint#design");
		await expect(
			MarketingPage({ params: Promise.resolve({ stepId: "preview" }) }),
		).rejects.toThrowError("NEXT_REDIRECT:/blueprint#generated-preview");
		await expect(
			BuildPlanPage({ params: Promise.resolve({ stepId: "setup" }) }),
		).rejects.toThrowError("NEXT_REDIRECT:/blueprint#setup");
		expect(vi.mocked(redirect)).toHaveBeenCalled();
	});
});
