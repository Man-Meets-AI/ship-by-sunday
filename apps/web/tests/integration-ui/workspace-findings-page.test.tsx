import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { WorkspaceFindingDocument } from "@/app/(workspace)/_lib/workspace-findings-read-model";

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		...props
	}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
		children: React.ReactNode;
		href: string;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

vi.mock("@/app/(workspace)/_components/app-shell", () => ({
	AppShell: ({
		children,
		localNav,
	}: {
		children: React.ReactNode;
		localNav?: { desktop?: React.ReactNode };
	}) => (
		<div>
			<nav data-testid="workspace-findings-local-nav">{localNav?.desktop}</nav>
			{children}
		</div>
	),
}));

import { WorkspaceFindingsPage } from "@/app/(workspace)/_components/existing-codebase-findings/workspace-findings-page";

function createFinding(
	overrides: Partial<WorkspaceFindingDocument> = {},
): WorkspaceFindingDocument {
	return {
		_id: "codebaseFindings_1",
		findingId: "finding-source-truth-readiness",
		rank: 1,
		status: "needs_approval",
		title: "Source truth needs the first workflow",
		category: "source_truth",
		severity: "high",
		confidence: 0.91,
		buyerImpact: "Later agent work needs a clearer command and proof map.",
		blastRadius: "low",
		proofPath: "Review the source-truth readiness artifact.",
		proofability: "clear",
		permissionRequired: "docs_write",
		recommendedWorkflowId: "source-truth-agent-readiness",
		whyThisNow: "It improves every later local workflow.",
		evidenceRefs: [],
		syncSensitivity: "low",
		localReportRef:
			".sbs/reports/doctor-pass/run-1/source-truth-agent-readiness.json",
		...overrides,
	};
}

describe("WorkspaceFindingsPage", () => {
	it("renders dense ranked findings and filters by category", async () => {
		const user = userEvent.setup();
		const writeTextMock = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: { writeText: writeTextMock },
		});
		render(
			<WorkspaceFindingsPage
				initialFindings={[
					createFinding(),
					createFinding({
						_id: "codebaseFindings_2",
						findingId: "finding-observability",
						rank: 2,
						status: "ready",
						title: "Observability proof is thin",
						category: "observability",
						recommendedWorkflowId: "observability-debuggability",
					}),
				]}
			/>,
		);

		expect(screen.getByRole("heading", { name: "Top 9 ledger" })).toBeTruthy();
		expect(
			screen.getByRole("region", { name: "Findings summary" }),
		).toBeTruthy();
		expect(screen.getByText("Uploaded findings")).toBeTruthy();
		expect(screen.getByText("Open finding")).toBeTruthy();
		expect(screen.getByText("run-1")).toBeTruthy();
		expect(screen.getByText("Recommended first")).toBeTruthy();
		expect(
			screen.getByRole("link", {
				name: /Source truth needs the first workflow/i,
			}),
		).toBeTruthy();
		expect(
			screen
				.getByRole("link", {
					name: /Source truth needs the first workflow/i,
				})
				.getAttribute("href"),
		).toBe("/workers/findings/finding-source-truth-readiness");
		expect(screen.getByText("Observability proof is thin")).toBeTruthy();
		expect(screen.getByText("Source Truth Agent Readiness")).toBeTruthy();
		expect(screen.getByText("Observability Debuggability")).toBeTruthy();
		expect(
			screen
				.getByRole("link", { name: /Run doctor pass again/i })
				.getAttribute("href"),
		).toBe("/workers/doctor-pass");
		expect(
			screen.getByTestId("workspace-findings-local-nav").textContent,
		).toContain("Findings");
		await user.click(screen.getByRole("button", { name: "Copy Local run" }));
		expect(writeTextMock).toHaveBeenCalledWith("run-1");

		await user.selectOptions(
			screen.getByLabelText("Category"),
			"observability",
		);

		expect(
			screen.queryByText("Source truth needs the first workflow"),
		).toBeNull();
		expect(screen.getByText("Observability proof is thin")).toBeTruthy();
	});

	it("points empty workspaces back to the doctor pass", () => {
		render(<WorkspaceFindingsPage initialFindings={[]} />);

		expect(screen.getByText("No uploaded findings yet")).toBeTruthy();
		expect(
			screen
				.getByRole("link", { name: "Open Doctor Pass" })
				.getAttribute("href"),
		).toBe("/workers/doctor-pass");
		expect(screen.queryByText("Recommended first")).toBeNull();
	});
});
