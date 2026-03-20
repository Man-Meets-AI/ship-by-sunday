import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
	ROUTE_ACCESS_PROTECTED_PAGE_LABELS,
	ROUTE_ACCESS_PUBLIC_PAGE_LABELS,
} from "./route-access-orientation-constants";

export function RouteAccessPagesTabs() {
	return (
		<Card>
			<CardHeader className="space-y-3 pb-3">
				<CardTitle className="text-base font-semibold">
					Public vs protected surfaces
				</CardTitle>
				<CardDescription>
					Starter convention: marketing stays public; product and account areas
					lean protected—confirm in your repo.
				</CardDescription>
				<Tabs defaultValue="public">
					<TabsList className="w-full justify-start">
						<TabsTrigger value="public">Public pages</TabsTrigger>
						<TabsTrigger value="protected">Protected pages</TabsTrigger>
					</TabsList>
					<TabsContent value="public" className="pt-3">
						<ul className="list-inside list-disc space-y-1 text-sm text-foreground">
							{ROUTE_ACCESS_PUBLIC_PAGE_LABELS.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</TabsContent>
					<TabsContent value="protected" className="pt-3">
						<ul className="list-inside list-disc space-y-1 text-sm text-foreground">
							{ROUTE_ACCESS_PROTECTED_PAGE_LABELS.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</TabsContent>
				</Tabs>
			</CardHeader>
		</Card>
	);
}
