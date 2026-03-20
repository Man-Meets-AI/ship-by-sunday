import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { BRAND_KIT_RESOURCE_LINKS } from "./brand-kit-constants";

export function BrandKitResourcesCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Resources</CardTitle>
				<CardDescription>
					Links open in a new tab—the tools from the lesson.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-wrap gap-2">
				{BRAND_KIT_RESOURCE_LINKS.map((link) => (
					<Button key={link.id} variant="outline" size="sm" asChild>
						<a href={link.href} target="_blank" rel="noreferrer">
							{link.label}
						</a>
					</Button>
				))}
			</CardContent>
		</Card>
	);
}
