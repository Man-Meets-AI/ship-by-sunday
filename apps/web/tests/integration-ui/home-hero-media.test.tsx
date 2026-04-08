import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
	default: ({ alt, src }: { alt: string; src: string }) => (
		<img alt={alt} src={src} />
	),
}));

import { HomeHeroMedia } from "@/features/marketing/components/home-page/home-hero-media";

describe("HomeHeroMedia", () => {
	it("renders the preview image when the hero is in preview mode", () => {
		render(
			<HomeHeroMedia
				media={{
					kind: "preview",
					previewImageSrc: "/agent-ready-packs-preview.svg",
					previewImageAlt: "Hero preview",
				}}
			/>,
		);

		const image = screen.getByRole("img", { name: "Hero preview" });
		expect(image.getAttribute("src")).toContain(
			"/agent-ready-packs-preview.svg",
		);
	});

	it("renders the iframe when the hero is in embed mode", () => {
		render(
			<HomeHeroMedia
				media={{
					kind: "embed",
					embedUrl: "https://www.youtube.com/embed/demo",
					title: "Sales walkthrough",
				}}
			/>,
		);

		const iframe = screen.getByTitle("Sales walkthrough");
		expect(iframe.getAttribute("src")).toBe(
			"https://www.youtube.com/embed/demo",
		);
		expect(iframe.getAttribute("allowfullscreen")).not.toBeNull();
	});
});
