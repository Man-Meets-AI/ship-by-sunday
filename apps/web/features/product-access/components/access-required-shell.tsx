import { AccessRequiredHeader } from "@/features/product-access/components/access-required-header";
import { AccessRequiredHelpPanel } from "@/features/product-access/components/access-required-help-panel";
import { AccessRequiredPathCard } from "@/features/product-access/components/access-required-path-card";
import { AccessRequiredStatusPanel } from "@/features/product-access/components/access-required-status-panel";
import type { AccessViewModel } from "@/features/product-access/lib/access-required-view-model";

export function AccessRequiredShell({
	viewModel,
	isRetryingAccess,
	lastRefreshLabel,
	onRetryAccessCheck,
}: {
	viewModel: AccessViewModel;
	isRetryingAccess: boolean;
	lastRefreshLabel: string | null;
	onRetryAccessCheck: () => void;
}) {
	const refreshHint = isRetryingAccess
		? "Refreshing product access now."
		: lastRefreshLabel
			? `Last checked ${lastRefreshLabel}`
			: "No manual refresh yet.";

	return (
		<section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
			<AccessRequiredHeader />
			<AccessRequiredStatusPanel viewModel={viewModel} />
			<div className="grid gap-4 lg:grid-cols-2">
				{viewModel.cards.map((card, index) => (
					<AccessRequiredPathCard
						key={`${card.title}-${index}`}
						card={card}
						isRetryingAccess={isRetryingAccess}
						refreshHint={refreshHint}
						onRetryAccessCheck={onRetryAccessCheck}
					/>
				))}
			</div>
			<AccessRequiredHelpPanel
				helpLeadCopy={viewModel.helpLeadCopy}
				helpItems={viewModel.helpItems}
			/>
		</section>
	);
}
