import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { EncryptedText } from "@/features/marketing/components/effects/encrypted-text";

describe("EncryptedText", () => {
	it("renders stable server markup before the reveal animation starts", () => {
		const firstMarkup = renderToString(
			<EncryptedText charset="SHIPBYUNDA" text="Ship by Sunday" />,
		);
		const secondMarkup = renderToString(
			<EncryptedText charset="SHIPBYUNDA" text="Ship by Sunday" />,
		);

		expect(firstMarkup).toBe(secondMarkup);
	});
});
