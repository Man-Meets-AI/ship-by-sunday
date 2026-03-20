"use client";

import { Button } from "@/components/ui/button";

import { SERVICE_LINKS } from "./build-ship-roadmap-constants";

export function BuildShipRoadmapOrientation() {
	return (
		<div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
			<p>
				<strong className="text-foreground">Web app, not an API product.</strong>{" "}
				You are building a web app, not a multi-client API backend.
			</p>
			<p>
				<strong className="text-foreground">Paid access lives on pages.</strong>{" "}
				Compared to a browser plugin, protected pages are what let you charge
				for the product behind sign-in.
			</p>
			<div className="flex flex-wrap gap-2 pt-1">
				{SERVICE_LINKS.map((link) => (
					<Button key={link.href} variant="outline" size="sm" asChild>
						<a href={link.href} target="_blank" rel="noreferrer">
							Open {link.label}
						</a>
					</Button>
				))}
			</div>
		</div>
	);
}
