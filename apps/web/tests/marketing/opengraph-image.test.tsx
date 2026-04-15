import { describe, expect, it, vi } from "vitest";

import { productConfig } from "@/config/product";

vi.mock("next/og", () => ({
	ImageResponse: class MockImageResponse {
		element: unknown;
		options: unknown;

		constructor(element: unknown, options: unknown) {
			this.element = element;
			this.options = options;
		}
	},
}));

function collectText(node: unknown): string[] {
	if (
		typeof node === "string" ||
		typeof node === "number" ||
		typeof node === "bigint"
	) {
		return [String(node)];
	}

	if (!node || typeof node !== "object") {
		return [];
	}

	const candidate = node as {
		props?: {
			children?: unknown;
		};
	};
	const children = candidate.props?.children;

	if (Array.isArray(children)) {
		return children.flatMap((child) => collectText(child));
	}

	return collectText(children);
}

describe("opengraph image", () => {
	it("renders the canonical price display into the social preview content", async () => {
		const { default: Image, size } = await import("@/app/opengraph-image");
		const imageResponse = Image() as {
			element: unknown;
			options: { width: number; height: number };
		};
		const flattenedText = collectText(imageResponse.element).join(" ");

		expect(flattenedText).toContain(productConfig.name);
		expect(flattenedText).toContain(productConfig.promise);
		expect(flattenedText).toContain(productConfig.priceDisplay);
		expect(imageResponse.options).toEqual(size);
	});
});
