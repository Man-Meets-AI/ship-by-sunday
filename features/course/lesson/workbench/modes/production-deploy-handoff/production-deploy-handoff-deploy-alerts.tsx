"use client";

import { AlertTriangleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ProductionDeployHandoffDeployAlerts() {
	return (
		<div className="space-y-3">
			<Alert variant="destructive">
				<AlertTriangleIcon />
				<AlertTitle>Protect production secrets</AlertTitle>
				<AlertDescription>
					Never show API tokens or secret keys on screen, in recordings, or in
					chat logs. Do not paste them into the wrong environment or commit them
					to git.
				</AlertDescription>
			</Alert>
			<Alert>
				<AlertTitle>Stripe: product and price in production</AlertTitle>
				<AlertDescription>
					After switching Stripe to <strong>Production</strong>, confirm your live
					product and price match the dev/sandbox setup before you rely on
					checkout or billing.
				</AlertDescription>
			</Alert>
		</div>
	);
}
