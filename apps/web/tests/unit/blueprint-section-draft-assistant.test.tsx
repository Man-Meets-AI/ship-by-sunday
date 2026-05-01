/** @vitest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BlueprintSectionDraftAssistant } from "@/app/(workspace)/_components/blueprint-flow/blueprint-section-draft-assistant";
import {
	buildBlueprintSectionDraftRequest,
	isBlueprintSectionDraftable,
	parseBlueprintSectionDraftOutput,
} from "@/lib/blueprint-flow/blueprint-section-draft-assistant";

function createJsonResponse(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"content-type": "application/json",
		},
	});
}

describe("blueprint section draft assistant", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it("enables draft helpers for the five intake sections only", () => {
		expect(isBlueprintSectionDraftable("foundation")).toBe(true);
		expect(isBlueprintSectionDraftable("problem")).toBe(true);
		expect(isBlueprintSectionDraftable("outcome")).toBe(true);
		expect(isBlueprintSectionDraftable("pricing")).toBe(true);
		expect(isBlueprintSectionDraftable("setup")).toBe(true);
		expect(isBlueprintSectionDraftable("design")).toBe(false);
		expect(isBlueprintSectionDraftable("generated-preview")).toBe(false);
	});

	it("builds a foundation prompt from rough intake context", () => {
		const request = buildBlueprintSectionDraftRequest("foundation", {
			product_summary:
				"Rough idea: help indie founders stop restarting and ship by Sunday.",
			primary_user: "Indie founders",
			problem_statement: "Launch plans keep getting too vague.",
		});

		expect(request.templateId).toBe("blueprint_intake_foundation");
		expect(request.prompt).toContain("Return JSON only.");
		expect(request.prompt).toContain(
			"product_name, product_summary, primary_user",
		);
		expect(request.prompt).toContain("Rough idea");
		expect(request.prompt).toContain("Launch plans keep getting too vague.");
	});

	it("parses section JSON into editable field draft values", () => {
		const values = parseBlueprintSectionDraftOutput(
			"outcome",
			JSON.stringify({
				success_looks_like:
					"A founder has a live offer page, checkout, and deploy path by Sunday.",
				core_flow: [
					"Paste the rough idea",
					"Review the generated blueprint",
					"Download the starter",
					"Launch the first offer",
				],
				extra_field: "ignored",
			}),
		);

		expect(values).toEqual({
			success_looks_like:
				"A founder has a live offer page, checkout, and deploy path by Sunday.",
			core_flow:
				"Paste the rough idea\nReview the generated blueprint\nDownload the starter\nLaunch the first offer",
		});
	});

	it("normalizes drafted scale and numeric values for form controls", () => {
		const values = parseBlueprintSectionDraftOutput(
			"pricing",
			JSON.stringify({
				pricing_model: "annual plan",
				pricing: "$497.99",
			}),
		);

		expect(values).toEqual({
			pricing_model: "yearly",
			pricing: "498",
		});
	});

	it("extracts JSON drafts from common model wrappers", () => {
		const values = parseBlueprintSectionDraftOutput(
			"problem",
			[
				"```json",
				"{",
				'  "problem_statement": "Founders keep restarting because scope is vague.",',
				'  "problem_trigger": "When they try to turn an AI prototype into a paid offer.",',
				'  "problem_severity": "high"',
				"}",
				"```",
			].join("\n"),
		);

		expect(values).toEqual({
			problem_statement: "Founders keep restarting because scope is vague.",
			problem_trigger:
				"When they try to turn an AI prototype into a paid offer.",
			problem_severity: "8",
		});
	});

	it("writes a drafted section back into multiple fields", async () => {
		const user = userEvent.setup();
		const onApplyDraftValues = vi.fn();
		const fetchMock = vi.fn().mockResolvedValueOnce(
			createJsonResponse({
				ok: true,
				output: JSON.stringify({
					product_name: "Ship by Sunday",
					product_summary:
						"A blueprint-first launch system for shipping a paid product in a weekend.",
					primary_user: "Indie founders with messy AI-built ideas",
				}),
			}),
		);

		vi.stubGlobal("fetch", fetchMock);

		render(
			<BlueprintSectionDraftAssistant
				sectionId="foundation"
				sectionLabel="Foundation"
				facts={{}}
				draftValues={{
					product_summary:
						"rough: help people with messy ai builds get live by sunday",
				}}
				onApplyDraftValues={onApplyDraftValues}
			/>,
		);

		await user.click(
			screen.getByRole("button", { name: "Draft Foundation with AI" }),
		);

		await waitFor(() =>
			expect(fetchMock).toHaveBeenCalledWith(
				"/api/codex/generate",
				expect.objectContaining({
					method: "POST",
				}),
			),
		);
		expect(onApplyDraftValues).toHaveBeenCalledWith({
			product_name: "Ship by Sunday",
			product_summary:
				"A blueprint-first launch system for shipping a paid product in a weekend.",
			primary_user: "Indie founders with messy AI-built ideas",
		});
		expect(screen.queryByRole("dialog")).toBeNull();
	});

	it("opens the managed login dialog and retries section drafting after the account connects", async () => {
		const user = userEvent.setup();
		const onApplyDraftValues = vi.fn();
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(
				createJsonResponse(
					{
						error: "Connect your Codex account in Settings before generating.",
						code: "account_not_connected",
					},
					409,
				),
			)
			.mockResolvedValueOnce(
				createJsonResponse({
					ok: true,
					loginId: "login_123",
					authUrl: "https://auth.example.test",
				}),
			)
			.mockResolvedValueOnce(
				createJsonResponse({
					connected: true,
					account: {
						type: "chatgpt",
						email: "builder@example.com",
						planType: "plus",
					},
					rateLimits: null,
				}),
			)
			.mockResolvedValueOnce(
				createJsonResponse({
					ok: true,
					output: JSON.stringify({
						problem_statement:
							"Founders keep restarting because their build scope is vague.",
						problem_trigger:
							"When they sit down to turn an AI prototype into a paid product.",
						problem_severity: "8",
					}),
				}),
			);

		const openMock = vi.spyOn(window, "open").mockImplementation(() => null);
		vi.stubGlobal("fetch", fetchMock);

		render(
			<BlueprintSectionDraftAssistant
				sectionId="problem"
				sectionLabel="Problem"
				facts={{}}
				draftValues={{
					problem_statement: "scope is fuzzy",
				}}
				onApplyDraftValues={onApplyDraftValues}
			/>,
		);

		await user.click(
			screen.getByRole("button", { name: "Draft Problem with AI" }),
		);
		await screen.findByRole("dialog");

		await user.click(screen.getByRole("button", { name: "Connect account" }));

		await waitFor(() =>
			expect(openMock).toHaveBeenCalledWith(
				"https://auth.example.test",
				"_blank",
				"noopener,noreferrer",
			),
		);
		await waitFor(() =>
			expect(onApplyDraftValues).toHaveBeenCalledWith({
				problem_statement:
					"Founders keep restarting because their build scope is vague.",
				problem_trigger:
					"When they sit down to turn an AI prototype into a paid product.",
				problem_severity: "8",
			}),
		);
		expect(fetchMock).toHaveBeenCalledWith(
			"/api/codex/account/login/start",
			expect.objectContaining({
				method: "POST",
			}),
		);
		expect(fetchMock).toHaveBeenCalledWith(
			"/api/codex/account/login/poll?loginId=login_123&refresh=true",
			expect.objectContaining({
				method: "GET",
			}),
		);
		expect(fetchMock).toHaveBeenCalledTimes(4);
	});
});
