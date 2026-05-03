import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { CheckoutSuccessCtaRow } from "./checkout-success-cta-row";
import { CheckoutSuccessHeading } from "./checkout-success-heading";
import { CheckoutSuccessProgressStep } from "./checkout-success-progress-step";
import { CheckoutSuccessRedirectAffordance } from "./checkout-success-redirect-affordance";
import { CheckoutSuccessStatusPulse } from "./checkout-success-status-pulse";
import type { CheckoutViewModel } from "../_lib/checkout-success-view-model";

export function CheckoutSuccessMainPanel({
	viewModel,
	canAutoRedirect,
}: {
	viewModel: CheckoutViewModel;
	canAutoRedirect: boolean;
}) {
	return (
		<Card>
			<CardHeader className="gap-2">
				<CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
					{viewModel.shellTitle}
				</CardTitle>
				<CardDescription className="text-base">
					{viewModel.shellSubtitle}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-5">
				<p className="text-[0.7rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
					Checkout status
				</p>
				<div
					className="flex flex-wrap items-center gap-2"
					role="status"
					aria-live="polite"
					aria-atomic="true"
				>
					<Badge variant="secondary" className="gap-2">
						<CheckoutSuccessStatusPulse
							isPolling={!canAutoRedirect}
							triggerArmedTransition={canAutoRedirect}
						/>
						{viewModel.statusLabel}
					</Badge>
					<Badge variant="outline">
						{canAutoRedirect ? "Redirect armed" : "Polling access"}
					</Badge>
				</div>
				<Separator />
				<div>
					<CardTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
						<CheckoutSuccessHeading heading={viewModel.heading} />
					</CardTitle>
					<CardDescription className="mt-2 text-base leading-relaxed">
						{viewModel.body}
					</CardDescription>
				</div>
				<Separator />
				<div className="flex flex-col gap-2">
					{viewModel.progressSteps.map((step) => (
						<CheckoutSuccessProgressStep key={step.label} step={step} />
					))}
				</div>
			</CardContent>
			<Separator />
			<CardFooter className="flex-col items-stretch gap-4">
				<div>
					<p className="text-[0.7rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
						Next step
					</p>
					<CardDescription className="mt-2 text-sm text-foreground">
						{viewModel.primaryActionBody}
					</CardDescription>
				</div>
				<CheckoutSuccessCtaRow viewModel={viewModel} />
				<CheckoutSuccessRedirectAffordance canAutoRedirect={canAutoRedirect} />
				<CardDescription>{viewModel.secondaryActionBody}</CardDescription>
			</CardFooter>
		</Card>
	);
}
