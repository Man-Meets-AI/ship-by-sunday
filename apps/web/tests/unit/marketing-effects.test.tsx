import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Cover } from "@/features/marketing/components/effects/cover";
import { PointerHighlight } from "@/features/marketing/components/effects/pointer-highlight";

describe("marketing visual effects", () => {
	it("renders moved homepage effect exports from marketing-owned paths", () => {
		const coverMarkup = renderToString(<Cover>Sunday</Cover>);
		const pointerMarkup = renderToString(
			<PointerHighlight>blueprint</PointerHighlight>,
		);

		expect(coverMarkup).toContain("Sunday");
		expect(pointerMarkup).toContain("blueprint");
	});
});
