/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PacketStageSaveFeedback } from "@/features/packet-flow/components/packet-stage-save-feedback";

describe("PacketStageSaveFeedback", () => {
	it("renders warning feedback as an alert with the warning icon", () => {
		render(
			<PacketStageSaveFeedback
				feedback={{
					tone: "warning",
					title: "This page needs a few more answers.",
					description:
						"Finish When does this problem show up? before this page is complete again.",
				}}
			/>,
		);

		const alert = screen.getByRole("alert");

		expect(alert.textContent).toContain("This page needs a few more answers.");
		expect(alert.textContent).toContain(
			"Finish When does this problem show up? before this page is complete again.",
		);
		expect(alert.querySelector("svg")).not.toBeNull();
	});
});
