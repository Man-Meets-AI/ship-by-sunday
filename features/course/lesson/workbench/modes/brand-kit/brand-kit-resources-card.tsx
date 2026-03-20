import { ExternalLinkIcon } from "lucide-react";

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
			<CardHeader className="space-y-1 pb-3">
				<CardTitle className="text-base font-semibold">Resources</CardTitle>
				<CardDescription className="text-sm">
					Open the exact tools from the lesson in new tabs.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-wrap gap-2 pt-0">
				{BRAND_KIT_RESOURCE_LINKS.map((link) => (
					<Button
						key={link.id}
						variant="outline"
						size="sm"
						asChild
					>
						<a href={link.href} target="_blank" rel="noreferrer">
							{link.label}
							<ExternalLinkIcon
								className="ml-1.5 size-3.5 opacity-70"
								aria-hidden
							/>
						</a>
					</Button>
				))}
			</CardContent>
		</Card>
	);
}
