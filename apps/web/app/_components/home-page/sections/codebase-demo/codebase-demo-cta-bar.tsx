"use client";

import { OctagonAlert, ShieldCheck, X } from "lucide-react";
import { useCallback, useState } from "react";

import { HomePagePrimaryCta } from "@/app/_components/home-page/sections/home-page-primary-cta";
import type { HomePageContent } from "@/app/_content/home-page";
import { cn } from "@/lib/utils";

type CtaContent = HomePageContent["productPreviewSection"]["cta"];

const CTA_LOADING_LABELS = {
	saving: "Saving your draft...",
	redirecting: "Opening checkout...",
} as const;

export function CodebaseDemoCtaBar({
	cta,
	onBeforeCheckout,
}: {
	readonly cta: CtaContent;
	readonly onBeforeCheckout: () => void | Promise<void>;
}) {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleError = useCallback((message: string | null) => {
		setErrorMessage(message);
	}, []);

	const dismissError = useCallback(() => {
		setErrorMessage(null);
	}, []);

	return (
		<div
			className={cn(
				"flex flex-col gap-3 rounded-xl border border-border/60 bg-background p-5 shadow-sm shadow-foreground/5",
				"sm:flex-row sm:items-center sm:justify-between",
				"sticky bottom-2 z-20 mx-[-0.25rem] bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70 pb-[calc(1.25rem+env(safe-area-inset-bottom))]",
				"sm:static sm:mx-0 sm:bottom-auto sm:z-auto sm:bg-background sm:backdrop-blur-0 sm:supports-[backdrop-filter]:bg-background sm:pb-5",
			)}
		>
			<div className="flex min-w-0 flex-1 flex-col gap-2">
				<p className="flex items-start gap-2 text-sm font-medium text-foreground">
					<ShieldCheck
						className="mt-0.5 size-4 shrink-0 text-foreground/70"
						aria-hidden
					/>
					<span>{cta.lockedNote}</span>
				</p>
				{errorMessage ? (
					<div
						role="alert"
						data-testid="codebase-demo-checkout-error"
						className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs leading-5 text-destructive"
					>
						<OctagonAlert
							className="mt-0.5 size-3.5 shrink-0"
							aria-hidden="true"
						/>
						<span className="flex-1 text-destructive-foreground/90">
							{errorMessage}
						</span>
						<button
							type="button"
							onClick={dismissError}
							className="ml-1 inline-flex size-5 items-center justify-center rounded-md text-destructive/80 transition-colors hover:bg-destructive/15 hover:text-destructive"
							aria-label="Dismiss error"
						>
							<X className="size-3.5" aria-hidden="true" />
						</button>
					</div>
				) : null}
			</div>
			<div className="shrink-0">
				<HomePagePrimaryCta
					target={{ kind: "checkout" }}
					label={cta.label}
					testId="codebase-demo-checkout-cta"
					className="h-11 px-5"
					onBeforeCheckout={onBeforeCheckout}
					onError={handleError}
					loadingLabels={CTA_LOADING_LABELS}
				/>
			</div>
		</div>
	);
}
