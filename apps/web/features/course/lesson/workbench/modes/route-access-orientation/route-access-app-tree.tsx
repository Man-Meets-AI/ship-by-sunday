import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { ROUTE_ACCESS_APP_ROUTE_FOLDERS } from "./route-access-orientation-constants";

export function RouteAccessAppTree() {
	return (
		<Card>
			<CardHeader className="space-y-3 pb-3">
				<CardTitle className="text-base font-semibold">
					Compact route map
				</CardTitle>
				<CardDescription>
					Next.js App Router: folders under{" "}
					<code className="rounded bg-muted px-1 py-0.5 text-xs">app/</code>{" "}
					become URL segments; each{" "}
					<code className="rounded bg-muted px-1 py-0.5 text-xs">page.tsx</code>{" "}
					is a page.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="rounded-md border border-border bg-muted/40 p-3 font-mono text-xs leading-6">
					<div className="font-semibold text-foreground">app/</div>
					<div className="pl-3 text-foreground">
						page.tsx — home (marketing)
					</div>
					<div className="mt-2 pl-3 text-muted-foreground">
						Named route folders:
					</div>
					<div className="flex flex-wrap gap-1.5 pl-3 pt-1">
						{ROUTE_ACCESS_APP_ROUTE_FOLDERS.map((name) => (
							<Badge
								key={name}
								variant="outline"
								className="font-mono text-[11px] font-normal"
							>
								{name}
							</Badge>
						))}
					</div>
					<p className="mt-2 pl-3 text-[11px] text-muted-foreground">
						Your fork may add more (e.g. docs)—treat this map as the template
						core.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
