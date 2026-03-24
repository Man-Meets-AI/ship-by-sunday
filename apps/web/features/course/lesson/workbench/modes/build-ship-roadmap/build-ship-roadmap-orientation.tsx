"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { SERVICE_LINKS } from "./build-ship-roadmap-constants";

export function BuildShipRoadmapOrientation() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">How to read this</CardTitle>
				<CardDescription className="space-y-3 pt-1">
					<span className="block text-foreground">
						<span className="font-medium">Web app, not an API product.</span>{" "}
						You are building a web app, not a multi-client API backend.
					</span>
					<span className="block text-foreground">
						<span className="font-medium">Paid access lives on pages.</span>{" "}
						Compared to a browser plugin, protected pages are what let you
						charge for the product behind sign-in.
					</span>
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="flex flex-wrap gap-2">
					{SERVICE_LINKS.map((link) => (
						<Button key={link.href} variant="outline" size="sm" asChild>
							<a href={link.href} target="_blank" rel="noreferrer">
								Open {link.label}
							</a>
						</Button>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
