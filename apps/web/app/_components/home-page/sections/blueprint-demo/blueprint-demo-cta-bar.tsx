"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { HomePagePrimaryCta } from "@/app/_components/home-page/sections/home-page-primary-cta";
import type { HomePageContent } from "@/app/_content/home-page";

type CtaContent = HomePageContent["productPreviewSection"]["cta"];

export function BlueprintDemoCtaBar({
	cta,
	onBeforeCheckout,
}: {
	readonly cta: CtaContent;
	readonly onBeforeCheckout: () => void | Promise<void>;
}) {
	return (
		<div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background p-5 shadow-sm shadow-foreground/5 sm:flex-row sm:items-center sm:justify-between">
			<div className="space-y-1">
				<p className="text-sm font-medium text-foreground">{cta.lockedNote}</p>
			</div>
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
				<HomePagePrimaryCta
					target={{ kind: "checkout" }}
					label={cta.label}
					testId="blueprint-demo-checkout-cta"
					className="h-11 px-5"
					onBeforeCheckout={onBeforeCheckout}
				/>
				<Button asChild variant="outline" className="h-11 px-5">
					<Link
						href={cta.secondaryHref}
						data-testid="blueprint-demo-secondary-cta"
					>
						{cta.secondaryLabel}
					</Link>
				</Button>
			</div>
		</div>
	);
}
