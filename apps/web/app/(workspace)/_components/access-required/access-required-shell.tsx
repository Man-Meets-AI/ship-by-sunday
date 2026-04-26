import type { AccessViewModel } from "../../_lib/access-required-view-model";
import { AccessRequiredHeader } from "./access-required-header";
import { AccessRequiredHelpPanel } from "./access-required-help-panel";
import { AccessRequiredPathPanel } from "./access-required-path-panel";
import { AccessRequiredStatusPanel } from "./access-required-status-panel";

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
		<section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
			<AccessRequiredHeader />
			<div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:gap-12">
				<div className="grid gap-10">
					<AccessRequiredStatusPanel viewModel={viewModel} />
					<div className="grid gap-8 border-t border-border/60 pt-8 lg:grid-cols-2">
						{viewModel.paths.map((path, index) => (
							<AccessRequiredPathPanel
								key={`${path.title}-${index}`}
								path={path}
								isRetryingAccess={isRetryingAccess}
								refreshHint={refreshHint}
								onRetryAccessCheck={onRetryAccessCheck}
							/>
						))}
					</div>
				</div>
				<AccessRequiredHelpPanel
					helpLeadCopy={viewModel.helpLeadCopy}
					helpItems={viewModel.helpItems}
				/>
			</div>
		</section>
	);
}
