import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function CoreUxBuildAlerts() {
	return (
		<div className="space-y-3">
			<Alert>
				<AlertTitle>Prerequisite</AlertTitle>
				<AlertDescription>
					You need a ChatGPT account for this flow. The three setup steps below
					should take under two minutes before ideas and posts unlock.
				</AlertDescription>
			</Alert>
			<Alert variant="destructive">
				<AlertTitle>Required setup</AlertTitle>
				<AlertDescription>
					Without ChatGPT connected, strategy saved, and brand references
					uploaded, the next steps (ideas and generated posts) will not land
					on-strategy or on-brand.
				</AlertDescription>
			</Alert>
		</div>
	);
}
