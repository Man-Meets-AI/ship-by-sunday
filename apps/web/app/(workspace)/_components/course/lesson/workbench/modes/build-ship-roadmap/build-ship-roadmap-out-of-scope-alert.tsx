"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function BuildShipRoadmapOutOfScopeAlert() {
	return (
		<Alert>
			<AlertTitle>Out of scope</AlertTitle>
			<AlertDescription>
				<ul className="list-inside list-disc text-sm leading-relaxed">
					<li>No iOS apps</li>
					<li>No complex public APIs</li>
				</ul>
			</AlertDescription>
		</Alert>
	);
}
