import { CheckoutSuccessHelpPanel } from "./checkout-success-help-panel";
import { CheckoutSuccessMainPanel } from "./checkout-success-main-panel";
import type { CheckoutViewModel } from "../_lib/checkout-success-view-model";

export function CheckoutSuccessSurface({
	viewModel,
	canAutoRedirect,
}: {
	viewModel: CheckoutViewModel;
	canAutoRedirect: boolean;
}) {
	return (
		<main className="flex min-h-dvh items-start justify-center bg-background px-4 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-foreground sm:items-center sm:px-6 sm:py-10">
			<div className="flex w-full max-w-xl flex-col gap-4">
				<CheckoutSuccessMainPanel
					viewModel={viewModel}
					canAutoRedirect={canAutoRedirect}
				/>
				<CheckoutSuccessHelpPanel viewModel={viewModel} />
			</div>
		</main>
	);
}
