import { AlertCircleIcon, InfoIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function BrandKitAlerts() {
	return (
		<div className="space-y-3">
			<Alert>
				<InfoIcon className="size-4" />
				<AlertTitle>Keep branding simple</AlertTitle>
				<AlertDescription>
					One square icon, one wordmark for the header, and no more than one
					primary plus one accent color. You can always refine later.
				</AlertDescription>
			</Alert>
			<Alert variant="destructive">
				<AlertCircleIcon className="size-4" />
				<AlertTitle>Pick a durable name</AlertTitle>
				<AlertDescription>
					Avoid names that only make sense on one platform—naming after
					Instagram or another app you do not control will not hold up for a
					real product.
				</AlertDescription>
			</Alert>
		</div>
	);
}
