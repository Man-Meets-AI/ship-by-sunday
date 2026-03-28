import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	createCanonicalProjectDefinitionDraft,
	createCompleteProjectDefinition,
	deriveStageStatus,
	getPacketStageDefinition,
} from "@packet-compiler";
import { PacketStageSidebar } from "@/features/packet-flow/components/packet-stage-sidebar";

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

function createProductStageStatus() {
	const baseFacts = createCompleteProjectDefinition().facts;
	const projectDefinition = createCanonicalProjectDefinitionDraft({
		clerkUserId: "user_123",
		productKey: "ship-by-sunday",
		facts: {
			...baseFacts,
			why_this_matters: undefined,
		},
	});
	return deriveStageStatus(projectDefinition.facts).stageStatuses.find(
		(stageStatus) => stageStatus.stageId === "product",
	);
}

describe("PacketStageSidebar", () => {
	it("renders human-readable missing fact labels instead of raw field keys", () => {
		const stageStatus = createProductStageStatus();
		if (!stageStatus) {
			throw new Error("Missing product stage status");
		}

		render(
			<PacketStageSidebar
				stage={getPacketStageDefinition("product")}
				stageStatus={stageStatus}
			/>,
		);

		expect(screen.getByText("Why does this person want this?")).toBeTruthy();
		expect(screen.queryByText("why_this_matters")).toBeNull();
	});
});
