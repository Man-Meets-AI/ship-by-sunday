import {
	ProtectedRoutePanel,
	ProtectedRoutePanelBody,
	ProtectedRoutePanelDescription,
	ProtectedRoutePanelHeader,
	ProtectedRoutePanelTitle,
} from "@/components/app/protected-route-surface";
import { cn } from "@/lib/utils";
import type { AccessPathModel } from "../../_lib/access-required-view-model";

import { AccessRequiredActions } from "./access-required-actions";

export function AccessRequiredPathPanel({
	path,
	isRetryingAccess,
	refreshHint,
	onRetryAccessCheck,
}: {
	path: AccessPathModel;
	isRetryingAccess: boolean;
	refreshHint: string;
	onRetryAccessCheck: () => void;
}) {
	const hasCheckout = path.actions.some((action) => action.kind === "checkout");
	const purchaseEmphasis = path.tone === "purchase" && hasCheckout;

	return (
		<ProtectedRoutePanel
			className={cn(
				"flex h-full flex-col",
				purchaseEmphasis ? "border-primary/30 bg-primary/5" : null,
			)}
		>
			<ProtectedRoutePanelHeader>
				<ProtectedRoutePanelTitle>{path.title}</ProtectedRoutePanelTitle>
				<ProtectedRoutePanelDescription>
					{path.description}
				</ProtectedRoutePanelDescription>
			</ProtectedRoutePanelHeader>
			<ProtectedRoutePanelBody className="mt-auto">
				<AccessRequiredActions
					actions={path.actions}
					refreshHint={refreshHint}
					isRetryingAccess={isRetryingAccess}
					onRetryAccessCheck={onRetryAccessCheck}
				/>
			</ProtectedRoutePanelBody>
		</ProtectedRoutePanel>
	);
}
