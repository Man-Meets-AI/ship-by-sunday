"use client";

import { AlertTriangleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function BuildSetupLaunchpadDevProdAlert() {
	return (
		<Alert>
			<AlertTriangleIcon />
			<AlertTitle>Do not mix environments</AlertTitle>
			<AlertDescription>
				Keep development values in <code className="text-foreground">.env.local</code> and production
				values in <code className="text-foreground">.env.production</code>. Pushing dev keys into
				production (or the reverse) breaks auth, billing, and Convex deployments.
			</AlertDescription>
		</Alert>
	);
}
