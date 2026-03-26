import type { AccessPathModel } from "@/features/product-access/lib/access-required-view-model";

import { AccessRequiredActions } from "./access-required-actions";

const toneStyles = {
	recovery: {
		borderClassName: "border-border/70",
	},
	purchase: {
		borderClassName: "border-foreground/20",
	},
} as const;

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
	const tone = toneStyles[path.tone];

	return (
		<article
			className={`flex h-full flex-col gap-5 border-t pt-5 ${tone.borderClassName}`}
		>
			<div className="grid gap-2">
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
