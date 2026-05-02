import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routeConfig } from "@/config/product";
import { cn } from "@/lib/utils";

import type { CheckoutViewModel } from "../_lib/checkout-success-view-model";

// Mirror the marketing CTA invert pattern from
// `apps/web/app/_components/home-page/sections/home-page-primary-cta.tsx` so
// the primary CTA flips cleanly across themes. The shadcn `--primary` token is
// owned by the generated design system and does not flip across every preset,
// which would otherwise leave a default `bg-primary` button rendering
// dark-on-dark on this surface.
const PRIMARY_CTA_CLASSES =
	"bg-foreground text-background hover:bg-foreground/90 disabled:bg-foreground disabled:text-background";

type CheckoutSuccessCtaRowProps = {
	readonly viewModel: CheckoutViewModel;
};

export function CheckoutSuccessCtaRow({
	viewModel,
}: CheckoutSuccessCtaRowProps) {
	return (
		<div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
			<Button
				asChild
				className={cn(
					"w-full justify-center sm:w-auto sm:min-w-48",
					PRIMARY_CTA_CLASSES,
				)}
				data-testid="checkout-success-cta-primary"
			>
				<Link href={viewModel.primaryActionHref}>
					{viewModel.primaryActionLabel}
				</Link>
			</Button>
			{viewModel.alternateActionHref && viewModel.alternateActionLabel ? (
				<Button
					asChild
					variant="secondary"
					className="w-full justify-center sm:w-auto sm:min-w-44"
					data-testid="checkout-success-cta-alternate"
				>
					<Link href={viewModel.alternateActionHref}>
						{viewModel.alternateActionLabel}
					</Link>
				</Button>
			) : null}
			<Button
				asChild
				variant="ghost"
				className="w-full justify-center text-muted-foreground hover:text-foreground sm:w-auto sm:min-w-32"
				data-testid="checkout-success-cta-tertiary"
			>
				<Link href={routeConfig.home}>Go home</Link>
			</Button>
		</div>
	);
}
