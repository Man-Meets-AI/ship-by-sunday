import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export function WorkbenchCard({
	label,
	children,
}: {
	label?: string;
	children: React.ReactNode;
}) {
	return (
		<Card className="gap-0 py-0">
			{label ? (
				<CardHeader className="border-b border-border/60 pb-4">
					<CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						{label}
					</CardTitle>
				</CardHeader>
			) : null}
			<CardContent className="py-4">{children}</CardContent>
		</Card>
	);
}
