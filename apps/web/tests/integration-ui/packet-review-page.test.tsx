import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";

vi.mock("@/features/course/shared/components/app-shell", () => ({
	AppShell: ({
		title,
		subtitle,
		children,
	}: {
		title: string;
		subtitle: string;
		children: ReactNode;
	}) => (
		<div>
			<h1>{title}</h1>
			<p>{subtitle}</p>
			{children}
		</div>
	),
}));

vi.mock("@/features/packet-flow/components/packet-stage-nav", () => ({
	PacketStageNav: () => <div data-testid="packet-stage-nav" />,
}));

import { PacketReviewPage } from "@/features/packet-flow/components/packet-review-page";

const readyWorkspaceState = {
	projectDefinition: null,
	firstIncompleteStageId: "review",
	packetReadiness: {
		product: { isReady: true, missingFactKeys: [] },
		design: { isReady: true, missingFactKeys: [] },
		marketing: { isReady: true, missingFactKeys: [] },
		build: { isReady: true, missingFactKeys: [] },
		review: { isReady: true, missingFactKeys: [] },
	},
	stageStatuses: [],
} as PacketWorkspaceState;

describe("PacketReviewPage", () => {
	it("renders outward-facing pack labels and starter snapshot download", () => {
		render(<PacketReviewPage initialWorkspaceState={readyWorkspaceState} />);

		expect(
			screen.getByRole("heading", { name: "Review & Download" }),
		).toBeTruthy();
		expect(screen.getByText("Design Pack")).toBeTruthy();
		expect(screen.getByText("Marketing Pack")).toBeTruthy();
		expect(screen.getByText("Build Pack")).toBeTruthy();
		expect(screen.getByText("Prompt Pack")).toBeTruthy();

		expect(
			screen
				.getByRole("link", { name: "Download Design Pack" })
				.getAttribute("href"),
		).toBe("/api/download/packet/design");
		expect(
			screen
				.getByRole("link", { name: "Download Marketing Pack" })
				.getAttribute("href"),
		).toBe("/api/download/packet/marketing");
		expect(
			screen
				.getByRole("link", { name: "Download Build Pack" })
				.getAttribute("href"),
		).toBe("/api/download/packet/build");
		expect(
			screen
				.getByRole("link", { name: "Download Starter Snapshot" })
				.getAttribute("href"),
		).toBe("/api/download/repo");
	});
});
