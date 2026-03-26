import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { AccessCardModel } from "@/features/product-access/lib/access-required-view-model";

import { AccessRequiredActions } from "./access-required-actions";

const toneStyles = {
	recovery: {
		label: "Recover access",
		cardClassName: "border-border/70 bg-card",
		labelClassName: "border-border/70 bg-background/80 text-foreground/80",
	},
	purchase: {
		label: "Need access",
		cardClassName: "border-border/60 bg-muted/40",
		labelClassName: "border-border/60 bg-background/70 text-muted-foreground",
	},
} as const;

export function AccessRequiredPathCard({
	card,
	isRetryingAccess,
	refreshHint,
	onRetryAccessCheck,
}: {
	card: AccessCardModel;
	isRetryingAccess: boolean;
	refreshHint: string;
	onRetryAccessCheck: () => void;
}) {
	const tone = toneStyles[card.tone];

	return (
		<Card
			className={`h-full gap-0 rounded-[24px] border py-0 shadow-none ${tone.cardClassName}`}
		>
			<CardHeader className="gap-4 px-5 py-5">
				<span
					className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-[0.72rem] font-medium uppercase tracking-[0.22em] ${tone.labelClassName}`}
				>
					{tone.label}
				</span>
				<div className="space-y-2">
					<CardTitle className="text-xl font-semibold tracking-tight">
						{card.title}
					</CardTitle>
					<CardDescription className="text-sm leading-6 text-muted-foreground">
						{card.description}
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="px-5 pb-5">
				<AccessRequiredActions
					actions={card.actions}
					refreshHint={refreshHint}
					isRetryingAccess={isRetryingAccess}
					onRetryAccessCheck={onRetryAccessCheck}
				/>
			</CardContent>
		</Card>
	);
}
