import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { requestStarterRepoAccessMock, toastSuccessMock } = vi.hoisted(() => ({
	requestStarterRepoAccessMock: vi.fn(),
	toastSuccessMock: vi.fn(),
}));

vi.mock("convex/react", () => ({
	useMutation: () => requestStarterRepoAccessMock,
}));

vi.mock("@tanstack/react-form", () => ({
	useForm: ({
		defaultValues,
		onSubmit,
	}: {
		defaultValues: { githubUsername: string };
		onSubmit: (payload: { value: { githubUsername: string } }) => Promise<void>;
	}) => {
		const values = { ...defaultValues };
		return {
			setFieldValue: (
				name: keyof typeof values,
				value: (typeof values)[keyof typeof values],
			) => {
				values[name] = value;
			},
			handleSubmit: () => onSubmit({ value: values }),
			Field: ({
				children,
			}: {
				children: (field: {
					name: "githubUsername";
					state: {
						value: string;
						meta: { errors: string[] };
					};
					handleBlur: () => void;
					handleChange: (value: string) => void;
				}) => React.ReactNode;
			}) =>
				children({
					name: "githubUsername",
					state: {
						value: values.githubUsername,
						meta: { errors: [] },
					},
					handleBlur: () => {},
					handleChange: (value: string) => {
						values.githubUsername =
							value.length === 1 && values.githubUsername
								? `${values.githubUsername}${value}`
								: value;
					},
				}),
			Subscribe: ({
				children,
			}: {
				children: (value: boolean) => React.ReactNode;
			}) => children(false),
		};
	},
}));

vi.mock("sonner", () => ({
	toast: {
		success: toastSuccessMock,
	},
}));

import { StarterRepoAccessForm } from "@/app/(workspace)/_components/starter-repo-access/starter-repo-access-form";

describe("StarterRepoAccessForm interactions", () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach(() => {
		requestStarterRepoAccessMock.mockReset();
		toastSuccessMock.mockReset();
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
	});

	afterEach(() => {
		act(() => {
			root.unmount();
		});
		container.remove();
	});

	it("shows a success toast after a mission starter repo request is saved", async () => {
		requestStarterRepoAccessMock.mockResolvedValue(undefined);
		const onSubmitted = vi.fn();
		const user = userEvent.setup();

		act(() => {
			root.render(
				<StarterRepoAccessForm
					initialUsername=""
					onSubmitted={onSubmitted}
					surface="mission"
				/>,
			);
		});

		await user.type(getUsernameInput(container), "ShipBySunday");
		await user.click(getSubmitButton(container));

		await vi.waitFor(() => {
			expect(requestStarterRepoAccessMock).toHaveBeenCalledWith({
				githubUsername: "ShipBySunday",
			});
		});
		expect(toastSuccessMock).toHaveBeenCalledWith(
			"Starter repo request saved. Watch for the GitHub invite.",
		);
		expect(onSubmitted).toHaveBeenCalled();
	});

	it("does not show the mission toast on settings", async () => {
		requestStarterRepoAccessMock.mockResolvedValue(undefined);
		const user = userEvent.setup();

		act(() => {
			root.render(
				<StarterRepoAccessForm initialUsername="" surface="settings" />,
			);
		});

		await user.type(getUsernameInput(container), "ShipBySunday");
		await user.click(getSubmitButton(container));

		await vi.waitFor(() => {
			expect(requestStarterRepoAccessMock).toHaveBeenCalledWith({
				githubUsername: "ShipBySunday",
			});
		});

		expect(toastSuccessMock).not.toHaveBeenCalled();
	});
});

function getUsernameInput(container: HTMLElement) {
	const input = container.querySelector<HTMLInputElement>("#githubUsername");
	if (!input) {
		throw new Error("Expected GitHub username input to render.");
	}
	return input;
}

function getSubmitButton(container: HTMLElement) {
	const button = Array.from(container.querySelectorAll("button")).find(
		(candidate) => candidate.textContent === "Save GitHub username",
	);
	if (!button) {
		throw new Error("Expected submit button to render.");
	}
	return button;
}
