import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { BRAND_KIT_STRIPE_BRANDING_URL } from "./brand-kit-constants";

export function BrandKitReferenceAccordion() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Reference</CardTitle>
				<CardDescription>
					Export, tooling, and Stripe tips—expand any row when you need it.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Accordion type="multiple" className="w-full">
					<AccordionItem value="icon-export">
						<AccordionTrigger>Icon size &amp; export</AccordionTrigger>
						<AccordionContent className="text-muted-foreground">
							Export the app icon at <strong>500×500</strong> pixels as{" "}
							<strong>PNG</strong>. That size keeps Stripe, favicons, and site
							markups aligned.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="figma">
						<AccordionTrigger>Figma quick actions</AccordionTrigger>
						<AccordionContent className="text-muted-foreground">
							Use layout guides for spacing. <strong>Command-click</strong>{" "}
							(Mac) / <strong>Ctrl-click</strong> (Windows) drills into text
							without leaving the frame. <strong>Option-drag</strong> duplicates
							an element. Adjust font size, letter-spacing, and alignment only
							enough to look intentional—do not treat typography as the whole
							lesson.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="stripe-path">
						<AccordionTrigger>Stripe branding path</AccordionTrigger>
						<AccordionContent className="text-muted-foreground">
							Dashboard → <strong>Settings</strong> → <strong>Business</strong>{" "}
							→ <strong>Branding</strong>. Upload the icon/logo and set brand
							colors to match what you ship on the site.{" "}
							<a
								className="font-medium text-foreground underline underline-offset-2"
								href={BRAND_KIT_STRIPE_BRANDING_URL}
								target="_blank"
								rel="noreferrer"
							>
								Open Stripe branding
							</a>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="favicon-pack">
						<AccordionTrigger>Favicon pack</AccordionTrigger>
						<AccordionContent className="text-muted-foreground">
							favicon.io generates multiple sizes (browser tab, PWA, etc.) from
							your source image—grab the bundle and keep it next to your PNG
							exports.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="coolors">
						<AccordionTrigger>Coolors</AccordionTrigger>
						<AccordionContent className="text-muted-foreground">
							Hold <strong>Spacebar</strong> to browse palettes, lock a primary,
							then pick <strong>one accent</strong>. You only need two hex codes
							for this pass.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="codex-later">
						<AccordionTrigger>
							Optional: screenshots for your agent
						</AccordionTrigger>
						<AccordionContent className="text-muted-foreground">
							Sending palette or Stripe screenshots to Codex helps later, but it
							is not required to finish this checklist. Core outputs are the
							files and hex values above.
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</CardContent>
		</Card>
	);
}
