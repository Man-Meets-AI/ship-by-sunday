import Link from "next/link";
import type { ExecuteShipTrack } from "@/features/execute-ship/lib/execute-ship-tracks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ExecuteShipTrackDetail({ track }: { track: ExecuteShipTrack }) {
	return (
		<Card>
			<CardHeader className="gap-3">
				<div className="space-y-1">
					<p className="text-sm font-medium text-muted-foreground">
						Track objective
					</p>
					<CardTitle>{track.objective}</CardTitle>
				</div>
				<p className="text-sm text-muted-foreground">{track.summary}</p>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-3">
					<p className="text-sm font-medium">Next steps</p>
					<ol className="space-y-2 pl-5 text-sm text-muted-foreground">
						{track.steps.map((step) => (
							<li key={step} className="list-decimal">
								{step}
							</li>
						))}
					</ol>
				</div>
				<div className="flex flex-wrap gap-3">
					{track.links.map((link) => (
						<Button key={link.href} asChild variant="outline">
							<Link href={link.href}>{link.label}</Link>
						</Button>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
