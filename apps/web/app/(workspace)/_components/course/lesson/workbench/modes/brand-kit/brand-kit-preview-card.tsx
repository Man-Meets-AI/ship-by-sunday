"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { isUploadFieldValue } from "@/lib/course/lesson/model/registry";

import {
	BRAND_KIT_ACCENT_HEX_FIELD_ID,
	BRAND_KIT_APP_NAME_FIELD_ID,
	BRAND_KIT_ICON_UPLOAD_FIELD_ID,
	BRAND_KIT_WORDMARK_UPLOAD_FIELD_ID,
} from "@/lib/course/lesson/workbench/modes/brand-kit/brand-kit-constants";

function stringField(value: unknown) {
	return typeof value === "string" ? value.trim() : "";
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
	const accentDisplay = accentOk
		? accent.startsWith("#")
			? accent
			: `#${accent}`
		: "—";
	const iconSrc = previewSrc(fieldValues[BRAND_KIT_ICON_UPLOAD_FIELD_ID]);
	const wordmarkSrc = previewSrc(
		fieldValues[BRAND_KIT_WORDMARK_UPLOAD_FIELD_ID],
	);

	return (
		<Card className={className}>
			<CardHeader className="pb-3">
				<CardTitle>Brand preview</CardTitle>
				<CardDescription>
					How icon, wordmark, and accent can read together on the site and in
					Stripe.
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-0">
				<ItemGroup>
					<Item variant="outline">
						<ItemMedia
							variant="image"
							className="size-[120px] shrink-0 overflow-hidden rounded-lg border border-border bg-muted/40 [&_img]:rounded-lg"
						>
							<AspectRatio ratio={1}>
								{iconSrc ? (
									<img
										src={iconSrc}
										alt=""
										className="size-full object-cover"
									/>
								) : (
									<Skeleton className="size-full rounded-lg" />
								)}
							</AspectRatio>
						</ItemMedia>
						<ItemContent className="min-w-0">
							<ItemTitle className="w-full min-w-0">
								{wordmarkSrc ? (
									<img
										src={wordmarkSrc}
										alt=""
										className="max-h-10 w-auto max-w-full object-contain object-left"
									/>
								) : (
									appName
								)}
							</ItemTitle>
							<ItemDescription>Wordmark / header logo</ItemDescription>
							<ItemActions>
								<Button type="button" size="sm" variant="default">
									Sample CTA
								</Button>
								<Badge variant="outline">{accentDisplay}</Badge>
							</ItemActions>
						</ItemContent>
					</Item>
				</ItemGroup>
			</CardContent>
		</Card>
	);
}
