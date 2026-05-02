import { cn } from "@/lib/utils";
import type { AccessPathModel } from "../../_lib/access-required-view-model";

import { AccessRequiredActions } from "./access-required-actions";

export function AccessRequiredPathPanel({
	path,
	pathIndex,
	isRetryingAccess,
	refreshHint,
	onRetryAccessCheck,
}: {
	path: AccessPathModel;
	pathIndex: number;
	isRetryingAccess: boolean;
	refreshHint: string;
	onRetryAccessCheck: () => void;
}) {
	const hasCheckout = path.actions.some((action) => action.kind === "checkout");
	const purchaseEmphasis = path.tone === "purchase" && hasCheckout;

	return (
		<article
			className={cn(
				"flex h-full flex-col gap-5",
				pathIndex > 0 &&
					"border-t border-border/60 pt-8 lg:border-t-0 lg:border-l lg:border-border/60 lg:pt-0 lg:pl-10",
				purchaseEmphasis &&
					"rounded-xl bg-muted/25 p-5 ring-1 ring-foreground/10 dark:bg-muted/10 sm:p-6",
			)}
		>
			<div className="grid gap-1.5">
				<h2 className="text-xl font-semibold tracking-tight text-foreground">
					{path.title}
				</h2>
				<p className="text-sm leading-6 text-muted-foreground">
					{path.description}
				</p>
			</div>
			<AccessRequiredActions
				actions={path.actions}
				refreshHint={refreshHint}
				isRetryingAccess={isRetryingAccess}
				onRetryAccessCheck={onRetryAccessCheck}
			/>
		</article>
	);
}
