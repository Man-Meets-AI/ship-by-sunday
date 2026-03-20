import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AccessRequiredActions } from "@/features/product-access/components/access-required-actions";
import type { AccessViewModel } from "@/features/product-access/lib/access-required-view-model";

export function AccessRequiredContent({
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
		<Card className="mx-auto w-full max-w-4xl">
			<CardHeader className="space-y-4">
				<div>
					<CardTitle className="text-2xl font-semibold">
						Access Required
					</CardTitle>
					<CardDescription className="text-base">
						{viewModel.shellSubtitle}
					</CardDescription>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Badge variant="secondary">Product access check</Badge>
					<Badge variant="outline">{viewModel.accessStateLabel}</Badge>
				</div>
				<div className="space-y-2 border-t pt-4">
					<p className="text-xl font-semibold">{viewModel.title}</p>
					<p className="text-sm text-muted-foreground">
						{viewModel.helperCopy}
					</p>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-6">
				{viewModel.statusCalloutTitle && viewModel.statusCalloutBody ? (
					<Alert>
						<AlertTitle>{viewModel.statusCalloutTitle}</AlertTitle>
						<AlertDescription>{viewModel.statusCalloutBody}</AlertDescription>
					</Alert>
				) : null}
				<Separator />
				<AccessRequiredActions
					cards={viewModel.cards}
					isRetryingAccess={isRetryingAccess}
					refreshHint={refreshHint}
					onRetryAccessCheck={onRetryAccessCheck}
				/>
				<Alert>
					<AlertTitle>Need help</AlertTitle>
					<AlertDescription>
						<p>{viewModel.helpLeadCopy}</p>
						<ul className="mt-3 list-inside list-disc text-muted-foreground">
							{viewModel.helpItems.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</AlertDescription>
				</Alert>
			</CardContent>
		</Card>
	);
}
