import { ProtectedRoutePage } from "@/components/app/protected-route-surface";
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
			? `Last checked at ${lastRefreshLabel}.`
			: "We'll show a timestamp after you retry the access check.";

	return (
		<ProtectedRoutePage className="min-h-screen max-w-6xl gap-6 py-6 sm:py-8 lg:px-8">
			<AccessRequiredHeader />
			<div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
				<div className="grid gap-5">
					<AccessRequiredStatusPanel
						viewModel={viewModel}
						isRetryingAccess={isRetryingAccess}
					/>
					<div className="grid gap-4 lg:grid-cols-2">
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
		</ProtectedRoutePage>
	);
}
