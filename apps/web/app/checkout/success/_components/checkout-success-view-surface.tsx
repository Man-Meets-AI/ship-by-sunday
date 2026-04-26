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
		<main className="min-h-screen bg-background text-foreground">
			<div className="mx-auto flex w-full max-w-lg flex-col gap-4 p-4 sm:p-6">
				<CheckoutSuccessMainPanel
					viewModel={viewModel}
					canAutoRedirect={canAutoRedirect}
				/>
				<CheckoutSuccessHelpPanel viewModel={viewModel} />
			</div>
		</main>
	);
}
