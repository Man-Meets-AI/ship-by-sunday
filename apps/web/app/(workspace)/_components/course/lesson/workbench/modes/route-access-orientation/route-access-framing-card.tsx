import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function RouteAccessFramingCard() {
	return (
		<Card>
			<CardHeader className="space-y-2 pb-3">
				<CardTitle className="text-base font-semibold leading-snug">
					Orientation, not an auth rewrite
				</CardTitle>
				<CardDescription className="text-sm leading-relaxed">
					This lesson is for understanding how the template separates marketing
					routes from protected product routes and where access is enforced—not
					for redesigning authentication.
				</CardDescription>
				<p className="text-xs leading-relaxed text-muted-foreground">
					Like scanning IKEA boxes before assembly: know what’s in the kit
					first; customize later.
				</p>
			</CardHeader>
		</Card>
	);
}
