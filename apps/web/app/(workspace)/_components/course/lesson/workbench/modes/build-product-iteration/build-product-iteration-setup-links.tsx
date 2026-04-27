"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { routeConfig } from "@/config/product";
import {
	getStarterRepoStatusLabel,
	type StarterRepoAccessStatus,
} from "@/config/starter-repo-access-copy";

type Props = {
	templateRepoUrl: string | null;
	templateLockedReason: string | null;
	starterRepoStatus: StarterRepoAccessStatus;
	chatgptConnected: boolean;
};

export function BuildProductIterationSetupLinks({
	templateRepoUrl,
	templateLockedReason,
	starterRepoStatus,
	chatgptConnected,
}: Props) {
	return (
		<>
			<div className="flex flex-wrap gap-2">
				<Button variant="outline" size="sm" asChild>
					<Link href={routeConfig.settings}>
						Open settings (starter access)
					</Link>
				</Button>
				<Button variant="outline" size="sm" asChild>
					<Link href={`${routeConfig.settings}#codex-connection`}>
						Connect ChatGPT
					</Link>
				</Button>
				{templateRepoUrl ? (
					<Button variant="secondary" size="sm" asChild>
						<a href={templateRepoUrl} target="_blank" rel="noopener noreferrer">
							Open template on GitHub
						</a>
					</Button>
				) : null}
			</div>

			{templateLockedReason ? (
				<p className="text-xs text-muted-foreground">{templateLockedReason}</p>
			) : null}

			<Separator />

			<div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
				<span>
					Starter:{" "}
					<strong className="text-foreground">
						{getStarterRepoStatusLabel(starterRepoStatus)}
					</strong>
				</span>
				<span className="hidden sm:inline">·</span>
				<span>
					ChatGPT:{" "}
					<strong className="text-foreground">
						{chatgptConnected ? "Connected" : "Not connected"}
					</strong>
				</span>
			</div>
		</>
	);
}
