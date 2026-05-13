import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import IdentityLayout from "@/app/(auth)/layout";

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

const taskResetPasswordMock = vi.fn(
	({ redirectUrlComplete }: { redirectUrlComplete: string }) => (
		<div data-testid="task-reset-password">
			Task reset password for {redirectUrlComplete}
		</div>
	),
);

vi.mock("@clerk/nextjs", () => ({
	TaskResetPassword: (props: { redirectUrlComplete: string }) =>
		taskResetPasswordMock(props),
}));

import ResetPasswordPage from "@/app/(auth)/session-tasks/reset-password/page";

describe("reset-password route", () => {
	it("keeps the Clerk task inside the refreshed identity shell", async () => {
		const page = await ResetPasswordPage({
			searchParams: Promise.resolve({ redirect_url: "/settings" }),
		});

		render(<IdentityLayout>{page}</IdentityLayout>);

		expect(screen.getByRole("link", { name: "Ship by Sunday" })).toBeTruthy();
		expect(screen.getByRole("link", { name: "Home" })).toBeTruthy();
		expect(screen.getByText("Reset your password")).toBeTruthy();
		expect(screen.getByText("Finish the required recovery step.")).toBeTruthy();
		expect(screen.getByTestId("task-reset-password").textContent).toContain(
			"Task reset password for /settings",
		);
	});
});
