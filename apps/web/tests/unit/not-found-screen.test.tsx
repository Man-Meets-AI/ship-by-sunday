import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { vi } from "vitest";

import NotFound from "@/app/not-found";

type MotionElementProps = {
	children?: React.ReactNode;
	initial?: unknown;
	animate?: unknown;
	transition?: unknown;
	[key: string]: unknown;
};

vi.mock("motion/react", async () => {
	const ReactModule = await import("react");
	const createMotionComponent = (tagName: string) => {
		const MotionComponent = ({
			children,
			initial: _initial,
			animate: _animate,
			transition: _transition,
			...props
		}: MotionElementProps) =>
			ReactModule.createElement(tagName, props, children);
		MotionComponent.displayName = `MockMotion${tagName}`;
		return MotionComponent;
	};

	return {
		motion: {
			div: createMotionComponent("div"),
			h1: createMotionComponent("h1"),
			p: createMotionComponent("p"),
		},
	};
});

describe("app not-found route", () => {
	it("renders the branded workspace 404", () => {
		const markup = renderToStaticMarkup(<NotFound />);

		expect(markup).toContain("Path Not");
		expect(markup).toContain("Open workspace");
		expect(markup).toContain("Exit to safety");
	});
});
