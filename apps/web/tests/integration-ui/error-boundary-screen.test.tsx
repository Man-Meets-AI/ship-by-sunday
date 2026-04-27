import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

type MotionElementProps = {
	children?: React.ReactNode;
	initial?: unknown;
	animate?: unknown;
	transition?: unknown;
	[key: string]: unknown;
};

const pathnameMock = vi.fn(() => "/mission");
const reportClientErrorMock = vi.fn();
const resetMock = vi.fn();

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

vi.mock("next/navigation", () => ({
	usePathname: () => pathnameMock(),
}));

vi.mock("@/lib/observability/client-error-report", () => ({
	reportClientError: (input: unknown) => reportClientErrorMock(input),
}));

import { ErrorBoundaryScreen } from "@/app/_components/error-boundary-screen";

describe("ErrorBoundaryScreen", () => {
	it("reports the error and allows retrying", async () => {
		const user = userEvent.setup();
		render(
			<ErrorBoundaryScreen
				error={Object.assign(new Error("Mission failed"), {
					digest: "digest_123",
				})}
				reset={resetMock}
				title="Protected workspace error"
				description="The workspace failed while loading protected content."
				code="protected_app_error_boundary"
			/>,
		);

		expect(
			screen.getByText("The workspace failed while loading protected content."),
		).toBeTruthy();
		expect(screen.getByText("Path: /mission")).toBeTruthy();
		expect(reportClientErrorMock).toHaveBeenCalledWith(
			expect.objectContaining({
				code: "protected_app_error_boundary",
				pathname: "/mission",
			}),
		);

		await user.click(screen.getByRole("button", { name: "Try to recompile" }));
		expect(resetMock).toHaveBeenCalledTimes(1);
	});

	it("marks global errors as critical in the client report payload", () => {
		render(
			<ErrorBoundaryScreen
				error={Object.assign(new Error("Root failed"), {
					digest: "digest_999",
				})}
				reset={resetMock}
				title="Workspace unavailable"
				description="A root-level error interrupted the app."
				code="global_error_boundary"
			/>,
		);

		expect(reportClientErrorMock).toHaveBeenCalledWith(
			expect.objectContaining({
				severity: "critical",
			}),
		);
	});

	it("renders safe fallbacks when pathname and digest are unavailable", () => {
		pathnameMock.mockReturnValueOnce(null);

		render(
			<ErrorBoundaryScreen
				error={new Error("Root failed")}
				reset={resetMock}
				title="Workspace unavailable"
				description="A root-level error interrupted the app."
				code="global_error_boundary"
			/>,
		);

		expect(screen.getByText("Path: unknown")).toBeTruthy();
		expect(screen.getByText("Digest: none")).toBeTruthy();
	});
});
