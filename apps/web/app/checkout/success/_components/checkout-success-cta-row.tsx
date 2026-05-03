"use client";

import { useClerk } from "@clerk/nextjs";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routeConfig } from "@/config/product";
import { PRIMARY_CTA_INVERT_CLASSES } from "@/lib/styling/primary-cta-invert-classes";
import { cn } from "@/lib/utils";

import type { CheckoutViewModel } from "../_lib/checkout-success-view-model";

type CheckoutSuccessCtaRowProps = {
	readonly viewModel: CheckoutViewModel;
};

export function CheckoutSuccessCtaRow({
	viewModel,
}: CheckoutSuccessCtaRowProps) {
	const clerk = useClerk();
	const isSignOutAction = viewModel.primaryActionKind === "sign_out";

	return (
		<div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
			{isSignOutAction ? (
				<Button
					type="button"
					className={cn(
						"w-full justify-center sm:w-auto sm:min-w-48",
						PRIMARY_CTA_INVERT_CLASSES,
					)}
					data-testid="checkout-success-cta-primary"
					onClick={() => {
						void clerk.signOut({
							redirectUrl: viewModel.primaryActionHref,
						});
					}}
				>
					{viewModel.primaryActionLabel}
				</Button>
			) : (
				<Button
					asChild
					className={cn(
						"w-full justify-center sm:w-auto sm:min-w-48",
						PRIMARY_CTA_INVERT_CLASSES,
					)}
					data-testid="checkout-success-cta-primary"
				>
					<Link href={viewModel.primaryActionHref}>
						{viewModel.primaryActionLabel}
					</Link>
				</Button>
			)}
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
