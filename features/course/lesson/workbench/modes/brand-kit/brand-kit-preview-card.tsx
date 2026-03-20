import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { isUploadFieldValue } from "@/features/course/lesson/model/registry";

import {
	BRAND_KIT_ACCENT_HEX_FIELD_ID,
	BRAND_KIT_APP_NAME_FIELD_ID,
	BRAND_KIT_ICON_UPLOAD_FIELD_ID,
	BRAND_KIT_WORDMARK_UPLOAD_FIELD_ID,
} from "./brand-kit-constants";

function stringField(value: unknown) {
	return typeof value === "string" ? value.trim() : "";
}

function contrastTextForHex(hex: string): "#000000" | "#ffffff" {
	const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
	if (!m) return "#ffffff";
	const n = Number.parseInt(m[1], 16);
	const r = (n >> 16) & 255;
	const g = (n >> 8) & 255;
	const b = n & 255;
	const yiq = (r * 299 + g * 587 + b * 114) / 1000;
	return yiq >= 186 ? "#000000" : "#ffffff";
}

function previewSrc(value: unknown): string | null {
	if (!isUploadFieldValue(value)) return null;
	return value.previewUrl ?? value.url ?? null;
}

type BrandKitPreviewCardProps = {
	fieldValues: Record<string, unknown>;
	className?: string;
};

export function BrandKitPreviewCard({
	fieldValues,
	className,
}: BrandKitPreviewCardProps) {
	const appName =
		stringField(fieldValues[BRAND_KIT_APP_NAME_FIELD_ID]) || "App name";
	const accent = stringField(fieldValues[BRAND_KIT_ACCENT_HEX_FIELD_ID]);
	const accentOk = /^#?[0-9a-f]{6}$/i.test(accent);
	const accentCss = accentOk
		? accent.startsWith("#")
			? accent
			: `#${accent}`
		: "hsl(var(--primary))";
	const iconSrc = previewSrc(fieldValues[BRAND_KIT_ICON_UPLOAD_FIELD_ID]);
	const wordmarkSrc = previewSrc(fieldValues[BRAND_KIT_WORDMARK_UPLOAD_FIELD_ID]);

	return (
		<Card className={className}>
			<CardHeader className="space-y-1 pb-3">
				<CardTitle className="text-base font-semibold">Brand preview</CardTitle>
				<CardDescription className="text-sm">
					How icon, wordmark, and accent can read together on the site and in
					Stripe.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4 pt-0">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
					<div className="flex shrink-0 flex-col items-center gap-2">
						<div className="flex size-[120px] items-center justify-center rounded-lg border border-border bg-muted/40">
							{iconSrc ? (
								<img
									src={iconSrc}
									alt=""
									className="size-full rounded-lg object-cover"
								/>
							) : (
								<span className="px-2 text-center text-[11px] text-muted-foreground">
									500×500 icon
								</span>
							)}
						</div>
					</div>
					<div className="min-w-0 flex-1 space-y-3">
						<div className="rounded-lg border border-border border-dashed bg-background px-3 py-2">
							{wordmarkSrc ? (
								<img
									src={wordmarkSrc}
									alt=""
									className="max-h-10 w-auto object-contain object-left"
								/>
							) : (
								<p className="truncate font-semibold text-foreground">
									{appName}
								</p>
							)}
							<p className="text-[11px] text-muted-foreground">
								Wordmark / header logo
							</p>
						</div>
						<Button
							type="button"
							size="sm"
							style={{
								backgroundColor: accentCss,
								color: contrastTextForHex(accentCss),
							}}
						>
							Accent button
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
