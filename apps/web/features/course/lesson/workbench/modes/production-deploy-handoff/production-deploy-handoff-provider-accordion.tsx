"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export function ProductionDeployHandoffProviderAccordion() {
	return (
		<Accordion
			type="multiple"
			defaultValue={["cloudflare", "stripe", "clerk"]}
			className="w-full"
		>
			<AccordionItem value="cloudflare">
				<AccordionTrigger className="text-left text-sm font-medium">
					Cloudflare — API token
				</AccordionTrigger>
				<AccordionContent className="space-y-3 text-sm text-muted-foreground">
					<p>
						<strong className="text-foreground">Path:</strong> Manage Account →
						Account API Tokens → Create new token
					</p>
					<div className="flex flex-wrap gap-2">
						<span className="text-foreground">Token permissions:</span>
						<Badge variant="secondary">Zone DNS Edit</Badge>
						<Badge variant="secondary">Zone Zone Read</Badge>
					</div>
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="stripe">
				<AccordionTrigger className="text-left text-sm font-medium">
					Stripe — production secret key
				</AccordionTrigger>
				<AccordionContent className="space-y-2 text-sm text-muted-foreground">
					<p>
						Switch to <strong className="text-foreground">Production</strong>,
						then open <strong className="text-foreground">Developers</strong> →{" "}
						<strong className="text-foreground">API keys</strong> (Keys) and
						copy the <strong className="text-foreground">Secret key</strong>.
					</p>
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="clerk">
				<AccordionTrigger className="text-left text-sm font-medium">
					Clerk — production keys
				</AccordionTrigger>
				<AccordionContent className="text-sm text-muted-foreground">
					<p>
						Use your <strong className="text-foreground">production</strong>{" "}
						Clerk instance. Copy the publishable and secret keys your README /
						env template expects—do not reuse dev-only keys for production
						deploy.
					</p>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
