/** @vitest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BlueprintProblemStatementOptimizer } from "@/features/blueprint-flow/components/blueprint-problem-statement-optimizer";
import { buildBlueprintFieldOptimizationRequest } from "@/features/blueprint-flow/lib/blueprint-field-optimizer";

function createJsonResponse(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"content-type": "application/json",
		},
	});
}

describe("blueprint field optimization", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it("builds a problem-statement prompt from the accepted product context", () => {
		const request = buildBlueprintFieldOptimizationRequest(
			"problem_statement",
			{
				product_name: "Ship by Sunday",
				product_summary: "A blueprint-first launch system.",
				primary_user: "Indie founders",
				problem_statement: "I keep restarting the launch plan.",
				problem_trigger: "When the week gets busy, the plan falls apart.",
				problem_severity: "8",
				success_looks_like: "A clear launch path by Sunday.",
			},
		);

		expect(request.templateId).toBe("blueprint_problem_statement");
		expect(request.prompt).toContain("Ship by Sunday");
		expect(request.prompt).toContain("A blueprint-first launch system.");
		expect(request.prompt).toContain("Indie founders");
		expect(request.prompt).toContain("I keep restarting the launch plan.");
		expect(request.prompt).toContain(
			"When the week gets busy, the plan falls apart.",
		);
		expect(request.prompt).toContain("A clear launch path by Sunday.");
	});

	it("writes optimized text back into the field when Codex returns a completed result", async () => {
		const user = userEvent.setup();
		const onApplyOptimizedValue = vi.fn();
		const fetchMock = vi.fn().mockResolvedValueOnce(
			createJsonResponse({
				ok: true,
				output: "The user needs a clearer path from idea to launch.",
			}),
		);

		vi.stubGlobal("fetch", fetchMock);

		render(
			<BlueprintProblemStatementOptimizer
				stepId="problem"
				facts={{
					product_name: "Ship by Sunday",
					product_summary: "A blueprint-first launch system.",
					primary_user: "Indie founders",
					problem_statement: "I keep restarting the launch plan.",
					problem_trigger: "When the week gets busy, the plan falls apart.",
					problem_severity: "8",
					success_looks_like: "A clear launch path by Sunday.",
				}}
				draftValues={{
					problem_statement: "I keep restarting the launch plan.",
				}}
				onApplyOptimizedValue={onApplyOptimizedValue}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Optimize" }));

		await waitFor(() =>
			expect(fetchMock).toHaveBeenCalledWith(
				"/api/codex/generate",
				expect.objectContaining({
					method: "POST",
				}),
			),
		);
		expect(onApplyOptimizedValue).toHaveBeenCalledWith(
			"The user needs a clearer path from idea to launch.",
		);
		expect(screen.queryByRole("dialog")).toBeNull();
	});

	it("opens the managed login dialog and retries optimization after the account connects", async () => {
		const user = userEvent.setup();
		const onApplyOptimizedValue = vi.fn();
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
					output: "The user needs a clearer path from idea to launch.",
				}),
			);

		const openMock = vi.spyOn(window, "open").mockImplementation(() => null);
		vi.stubGlobal("fetch", fetchMock);

		render(
			<BlueprintProblemStatementOptimizer
				stepId="problem"
				facts={{
					product_name: "Ship by Sunday",
					product_summary: "A blueprint-first launch system.",
					primary_user: "Indie founders",
					problem_statement: "I keep restarting the launch plan.",
					problem_trigger: "When the week gets busy, the plan falls apart.",
					problem_severity: "8",
					success_looks_like: "A clear launch path by Sunday.",
				}}
				draftValues={{
					problem_statement: "I keep restarting the launch plan.",
				}}
				onApplyOptimizedValue={onApplyOptimizedValue}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Optimize" }));
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
			expect(onApplyOptimizedValue).toHaveBeenCalledWith(
				"The user needs a clearer path from idea to launch.",
			),
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
