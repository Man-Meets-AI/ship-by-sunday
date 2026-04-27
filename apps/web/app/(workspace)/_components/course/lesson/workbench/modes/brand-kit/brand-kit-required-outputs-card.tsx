import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
			<CardHeader>
				<CardTitle>Required outputs</CardTitle>
				<CardDescription>
					What you should finish this lesson with—a starter brand kit, not a
					full workshop.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<CardTitle className="text-sm">Required</CardTitle>
					<ul className="list-disc space-y-1 pl-4 text-sm leading-relaxed">
						{REQUIRED_OUTPUTS.map((line) => (
							<li key={line}>{line}</li>
						))}
					</ul>
				</div>
				<Separator />
				<div className="space-y-2">
					<CardTitle className="text-sm text-muted-foreground">
						Optional
					</CardTitle>
					<ul className="list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted-foreground">
						{OPTIONAL_OUTPUTS.map((line) => (
							<li key={line}>{line}</li>
						))}
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}
