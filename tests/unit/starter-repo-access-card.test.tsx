import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

let starterRepoRecord:
	| {
			githubUsername: string;
			status: "requested" | "invited" | "accepted" | "failed";
			requestedAt: number;
			updatedAt: number;
			invitedAt?: number;
			acceptedAt?: number;
			lastError?: string;
	  }
	| null
	| undefined = null;

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

vi.mock("convex/react", () => ({
	useConvexAuth: () => ({
		isAuthenticated: true,
		isLoading: false,
	}),
	useMutation: () => vi.fn(),
	useQuery: () => starterRepoRecord,
}));

globalThis.React = React;

import { StarterRepoAccessCard } from "@/features/starter-repo/components/starter-repo-access-card";

describe("StarterRepoAccessCard", () => {
	it("shows the input form before a GitHub username is saved", () => {
		starterRepoRecord = null;

		const markup = renderToStaticMarkup(
			<StarterRepoAccessCard surface="mission" />,
		);

		expect(markup).toContain("Unlock the private starter repo before Build");
		expect(markup).toContain("Save GitHub username");
	});

	it("shows the requested state with the saved username", () => {
		starterRepoRecord = {
			githubUsername: "ShipBySunday",
			status: "requested",
			requestedAt: 1,
			updatedAt: 1,
		};

		const markup = renderToStaticMarkup(
			<StarterRepoAccessCard surface="mission" />,
		);

		expect(markup).toContain("Starter repo request saved");
		expect(markup).toContain("@ShipBySunday");
		expect(markup).toContain("Edit username");
	});

	it("shows the invited state with the repo link", () => {
		starterRepoRecord = {
			githubUsername: "ShipBySunday",
			status: "invited",
			requestedAt: 1,
			updatedAt: 1,
			invitedAt: 2,
		};

		const markup = renderToStaticMarkup(
			<StarterRepoAccessCard surface="mission" />,
		);

		expect(markup).toContain("Accept your GitHub repo invite");
		expect(markup).toContain("Open starter repo");
	});

	it("shows the accepted state in settings", () => {
		starterRepoRecord = {
			githubUsername: "ShipBySunday",
			status: "accepted",
			requestedAt: 1,
			updatedAt: 1,
			invitedAt: 2,
			acceptedAt: 3,
		};

		const markup = renderToStaticMarkup(
			<StarterRepoAccessCard surface="settings" />,
		);

		expect(markup).toContain("Starter repo access confirmed");
		expect(markup).toContain("Open starter repo");
	});

	it("shows the failed state with the last error and retry form", () => {
		starterRepoRecord = {
			githubUsername: "BadName",
			status: "failed",
			requestedAt: 1,
			updatedAt: 1,
			lastError: "GitHub user BadName was not found.",
		};

		const markup = renderToStaticMarkup(
			<StarterRepoAccessCard surface="settings" />,
		);

		expect(markup).toContain("Starter repo access needs attention");
		expect(markup).toContain("Last error: GitHub user BadName was not found.");
		expect(markup).toContain("Save GitHub username");
	});
});
