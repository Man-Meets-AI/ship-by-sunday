import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function RouteAccessLightweightAlert() {
	return (
		<Alert>
			<AlertTitle>Inspect before you rebuild</AlertTitle>
			<AlertDescription className="text-sm leading-relaxed">
				The template already wires most access patterns. Use this lesson to see
				how it works and decide what you might change later—not to rip out
				guards or rewrite auth in one sitting.
			</AlertDescription>
		</Alert>
	);
}
