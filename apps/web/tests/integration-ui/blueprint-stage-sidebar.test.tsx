import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	createCanonicalProjectDefinitionDraft,
	createCompleteProjectDefinition,
	deriveStageStatus,
	getBlueprintStageDefinition,
} from "@blueprint-compiler";
import { BlueprintStageSidebar } from "@/features/blueprint-flow/components/blueprint-stage-sidebar";

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
			product_summary: undefined,
		},
	});
	return deriveStageStatus(projectDefinition.facts).stageStatuses.find(
		(stageStatus) => stageStatus.stageId === "product",
	);
}

describe("BlueprintStageSidebar", () => {
	it("renders human-readable missing fact labels instead of raw field keys", () => {
		const stageStatus = createProductStageStatus();
		if (!stageStatus) {
			throw new Error("Missing product stage status");
		}

		render(
			<BlueprintStageSidebar
				stage={getBlueprintStageDefinition("product")}
				stageStatus={stageStatus}
			/>,
		);

		expect(screen.getByText("What's the one-liner?")).toBeTruthy();
		expect(screen.queryByText("product_summary")).toBeNull();
	});
});
