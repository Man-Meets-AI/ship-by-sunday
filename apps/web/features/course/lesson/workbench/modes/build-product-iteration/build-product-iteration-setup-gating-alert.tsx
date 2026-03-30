"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export function BuildProductIterationSetupGatingAlert() {
	return (
		<Alert variant="default">
			<AlertTitle className="flex flex-wrap items-center gap-2">
				Product access is gated
				<Badge variant="secondary">Required</Badge>
				<Badge variant="outline">Blocked until linked</Badge>
			</AlertTitle>
			<AlertDescription className="mt-2 text-sm">
				The paid product account (private starter / template on GitHub) is{" "}
				<strong>separate</strong> from your website login. Until that access is
				linked, template links stay locked—complete it from Settings,
				then check the box when it is true.
			</AlertDescription>
		</Alert>
	);
}
