import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const REQUIRED_OUTPUTS = [
	"Working app name",
	"Square app icon (500×500 PNG from Figma)",
	"Wordmark / logo for site header",
	"Favicon pack from favicon.io",
	"Primary + accent colors (hex)",
	"Stripe branding updated (icon + colors)",
	"Domain purchased (e.g. via Cloudflare)",
];

const OPTIONAL_OUTPUTS = [
	"Palette screenshots for your agent (Codex) to apply colors in the product",
];

export function BrandKitRequiredOutputsCard() {
	return (
		<Card>
			<CardHeader className="space-y-1 pb-3">
				<CardTitle className="text-base font-semibold">
					Required outputs
				</CardTitle>
				<CardDescription className="text-sm">
					What you should finish this lesson with—a starter brand kit, not a
					full workshop.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4 pt-0">
				<ul className="space-y-2 text-sm leading-relaxed">
					{REQUIRED_OUTPUTS.map((line) => (
						<li key={line} className="flex flex-wrap items-start gap-2">
							<Badge
								variant="secondary"
								className="mt-0.5 shrink-0 text-[10px] uppercase tracking-wide"
							>
								Required
							</Badge>
							<span>{line}</span>
						</li>
					))}
				</ul>
				<ul className="space-y-2 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
					{OPTIONAL_OUTPUTS.map((line) => (
						<li key={line} className="flex flex-wrap items-start gap-2">
							<Badge
								variant="outline"
								className="mt-0.5 shrink-0 text-[10px] uppercase tracking-wide"
							>
								Optional
							</Badge>
							<span>{line}</span>
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}
