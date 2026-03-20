import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function FreshTemplatePlanPlanFirstAlert() {
	return (
		<Alert>
			<AlertTitle>Plan first</AlertTitle>
			<AlertDescription>
				This lesson&apos;s output is a reviewed plan—not application code. Don&apos;t
				implement until you approve the plan with your agent.
			</AlertDescription>
		</Alert>
	);
}
