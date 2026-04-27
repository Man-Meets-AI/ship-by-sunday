import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Cover } from "@/components/ui/cover";
import { PointerHighlight } from "@/components/ui/pointer-highlight";

describe("marketing visual effects", () => {
	it("renders moved homepage effect exports from shared UI paths", () => {
		const coverMarkup = renderToString(<Cover>Sunday</Cover>);
		const pointerMarkup = renderToString(
			<PointerHighlight>blueprint</PointerHighlight>,
		);

		expect(coverMarkup).toContain("Sunday");
		expect(pointerMarkup).toContain("blueprint");
	});
});
