import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildDesignPresetFactSeed } from "@shipbysunday/blueprint-compiler";
import { createBlueprintWorkspaceState } from "./blueprint-test-fixtures";

const saveProjectDefinitionFactsMock = vi.fn();
const unlockExecuteShipMock = vi.fn();
type MockBlueprintMutation = ((args: unknown) => Promise<unknown>) & {
	withOptimisticUpdate: ReturnType<typeof vi.fn>;
};

function createMutationMock(spy: typeof saveProjectDefinitionFactsMock) {
	const mutation = (async (args: unknown) =>
		spy(args)) as MockBlueprintMutation;
	mutation.withOptimisticUpdate = vi.fn(() => mutation);
	return mutation;
}

const useMutationMock = vi.fn();
const useQueryMock = vi.fn(() => undefined);
const pushMock = vi.fn();
const replaceMock = vi.fn();

vi.mock("@/convex/_generated/api", () => ({
	api: {
		blueprint: {
			getBlueprintWorkspaceState: "getBlueprintWorkspaceState",
			saveProjectDefinitionFacts: "saveProjectDefinitionFacts",
			unlockExecuteShip: "unlockExecuteShip",
		},
	},
}));

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		onNavigate: _onNavigate,
		...props
	}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
		children: React.ReactNode;
		href: string;
		onNavigate?: unknown;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: pushMock,
		replace: replaceMock,
	}),
}));

vi.mock("convex/react", () => ({
	useConvexAuth: () => ({
		isAuthenticated: false,
		isLoading: false,
	}),
	useMutation: (...args: unknown[]) => useMutationMock(...args),
	useQuery: () => useQueryMock(),
}));

vi.mock("@clerk/nextjs", () => ({
	useUser: () => ({
		isLoaded: true,
		user: null,
	}),
}));

vi.mock("@/app/(workspace)/_components/app-shell", () => ({
	AppShell: ({
		title,
		children,
		localNav,
	}: {
		title: string;
		children: React.ReactNode;
		localNav?: { compact?: React.ReactNode; desktop?: React.ReactNode };
	}) => (
		<div>
			<h1>{title}</h1>
			<div data-testid="blueprint-local-nav-compact">{localNav?.compact}</div>
			<div data-testid="blueprint-local-nav-desktop">{localNav?.desktop}</div>
			{children}
		</div>
	),
}));

vi.mock("@/components/ui/collapsible", () => ({
	Collapsible: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	CollapsibleContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	CollapsibleTrigger: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
}));

vi.mock("@/components/ui/alert-dialog", () => ({
	AlertDialog: ({
		children,
		open,
	}: {
		children: React.ReactNode;
		open?: boolean;
	}) => (open ? <div>{children}</div> : null),
	AlertDialogAction: ({
		children,
		onClick,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
	}) => (
		<button type="button" onClick={onClick}>
			{children}
		</button>
	),
	AlertDialogCancel: ({
		children,
		onClick,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
	}) => (
		<button type="button" onClick={onClick}>
			{children}
		</button>
	),
	AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
		<p>{children}</p>
	),
	AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
		<h2>{children}</h2>
	),
}));

vi.mock("@/components/ui/dialog", () => ({
	Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
		open ? <div>{children}</div> : null,
	DialogContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DialogDescription: ({ children }: { children: React.ReactNode }) => (
		<p>{children}</p>
	),
	DialogFooter: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DialogHeader: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DialogTitle: ({ children }: { children: React.ReactNode }) => (
		<h2>{children}</h2>
	),
}));

vi.mock("@/components/ui/progress", () => ({
	Progress: ({
		className,
		value,
	}: {
		className?: string;
		value?: number | null;
	}) => <div className={className} data-slot="progress" data-value={value} />,
}));

vi.mock("@/components/ui/select", () => {
	const SelectContext = React.createContext<
		((nextValue: string) => void) | undefined
	>(undefined);

	return {
		Select: ({
			children,
			onValueChange,
		}: {
			children: React.ReactNode;
			onValueChange?: (nextValue: string) => void;
		}) => (
			<SelectContext.Provider value={onValueChange}>
				{children}
			</SelectContext.Provider>
		),
		SelectContent: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
		SelectGroup: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
		SelectItem: ({
			children,
			className,
			value,
		}: {
			children: React.ReactNode;
			className?: string;
			value: string;
		}) => {
			const onValueChange = React.useContext(SelectContext);
			return (
				<button
					type="button"
					role="option"
					aria-selected="false"
					className={className}
					onClick={() => onValueChange?.(value)}
				>
					{children}
				</button>
			);
		},
		SelectTrigger: ({
			children,
			className,
			...props
		}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
			children: React.ReactNode;
		}) => (
			<button
				type="button"
				role="combobox"
				aria-controls="mock-select-options"
				aria-expanded="true"
				className={className}
				{...props}
			>
				{children}
			</button>
		),
		SelectValue: () => null,
	};
});

vi.mock("@/components/ui/toggle-group", () => {
	const ToggleGroupContext = React.createContext<
		((nextValue: string) => void) | undefined
	>(undefined);

	return {
		ToggleGroup: ({
			children,
			onValueChange,
		}: {
			children: React.ReactNode;
			onValueChange?: (nextValue: string) => void;
		}) => (
			<ToggleGroupContext.Provider value={onValueChange}>
				<div>{children}</div>
			</ToggleGroupContext.Provider>
		),
		ToggleGroupItem: ({
			children,
			value,
		}: {
			children: React.ReactNode;
			value: string;
		}) => {
			const onValueChange = React.useContext(ToggleGroupContext);
			return (
				<button type="button" onClick={() => onValueChange?.(value)}>
					{children}
				</button>
			);
		},
	};
});

vi.mock(
	"@/app/(workspace)/_components/course/lesson/components/lesson-video-player",
	() => ({
		LessonVideoPlayer: ({ title }: { title?: string }) => (
			<div data-testid="blueprint-page-video-player">
				{title ?? "Lesson video"}
			</div>
		),
	}),
);

import { BlueprintPage } from "@/app/(workspace)/_components/blueprint-flow/blueprint-page";

describe("BlueprintPage", () => {
	beforeEach(() => {
		saveProjectDefinitionFactsMock.mockReset();
		unlockExecuteShipMock.mockReset();
		useMutationMock.mockReset();
		useMutationMock.mockImplementation((mutationName) => {
			if (mutationName === "saveProjectDefinitionFacts") {
				return createMutationMock(saveProjectDefinitionFactsMock);
			}
			if (mutationName === "unlockExecuteShip") {
				return createMutationMock(unlockExecuteShipMock);
			}
			throw new Error(`Unexpected mutation: ${String(mutationName)}`);
		});
		useQueryMock.mockReset();
		pushMock.mockReset();
		replaceMock.mockReset();
		Element.prototype.hasPointerCapture ??= () => false;
		Element.prototype.setPointerCapture ??= () => {};
		Element.prototype.releasePointerCapture ??= () => {};
	});

	it("renders the blueprint form with overview, sections, and save bar", () => {
		render(
			<BlueprintPage initialWorkspaceState={createBlueprintWorkspaceState()} />,
		);

		expect(screen.getAllByRole("heading", { name: "Blueprint" })).toHaveLength(
			2,
		);
		expect(
			screen.getByText("All sections complete. Continue to review when ready."),
		).toBeTruthy();
		expect(
			screen.getByText("Name the product clearly and anchor who it is for."),
		).toBeTruthy();
		expect(
			screen.getByRole("button", { name: "Continue to Review" }),
		).toBeTruthy();
	});

	it("saves partial work on continue and reveals the remaining blockers", async () => {
		const user = userEvent.setup();
		render(
			<BlueprintPage
				initialWorkspaceState={createBlueprintWorkspaceState({
					factOverrides: {
						product_name: undefined,
						product_summary: undefined,
						primary_user: undefined,
						pricing: undefined,
					},
				})}
			/>,
		);

		await user.type(
			screen.getByLabelText("What's the name?"),
			"Ship by Sunday Blueprint",
		);
		await user.click(
			screen.getByRole("button", { name: "Continue to Review" }),
		);

		await waitFor(() => {
			expect(saveProjectDefinitionFactsMock).toHaveBeenCalledTimes(1);
		});
		expect(unlockExecuteShipMock).not.toHaveBeenCalled();
		expect(screen.getByText("Draft saved.")).toBeTruthy();
		expect(
			screen.getAllByText("Add an answer here before Review can unlock.")
				.length,
		).toBeGreaterThan(0);
		expect(pushMock).not.toHaveBeenCalled();
		expect(replaceMock).not.toHaveBeenCalled();
	});

	it("unlocks post-review and navigates to review with the auto-download signal", async () => {
		const user = userEvent.setup();
		render(
			<BlueprintPage initialWorkspaceState={createBlueprintWorkspaceState()} />,
		);

		await user.click(
			screen.getByRole("button", { name: "Continue to Review" }),
		);

		await waitFor(() => {
			expect(unlockExecuteShipMock).toHaveBeenCalledWith({});
		});
		expect(pushMock).toHaveBeenCalledWith("/review?download=1");
		expect(replaceMock).not.toHaveBeenCalled();
	});

	it("re-seeds the design fields when a curated preset is selected", async () => {
		const user = userEvent.setup();
		render(
			<BlueprintPage initialWorkspaceState={createBlueprintWorkspaceState()} />,
		);

		await user.click(
			screen.getByRole("combobox", { name: "Choose a design direction" }),
		);
		await user.click(screen.getByRole("option", { name: /Notion/i }));
		await user.click(
			screen.getByRole("button", { name: "Continue to Review" }),
		);

		await waitFor(() => {
			expect(saveProjectDefinitionFactsMock).toHaveBeenCalledTimes(1);
		});
		expect(screen.getAllByText("Notion").length).toBeGreaterThan(0);
		expect(saveProjectDefinitionFactsMock).toHaveBeenCalledWith(
			expect.objectContaining({
				factsPatch: expect.objectContaining({
					design_preset_id: "notion",
					theme_preset: buildDesignPresetFactSeed("notion").theme_preset,
					design_references: ["https://getdesign.md/notion/design-md"],
				}),
			}),
		);
	});
});
