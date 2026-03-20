import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AccessRequiredCtaCards } from "@/features/course/access/components/access-required-cta-cards";
import type { AccessViewModel } from "@/features/course/access/lib/access-required-view-model";

export type AccessRequiredContentProps = {
	viewModel: AccessViewModel;
	isCheckingAccess: boolean;
	isSignedOut: boolean;
	signInHref: string;
	homeHref: string;
	isRetryingAccess: boolean;
	lastRefreshLabel: string | null;
	onRetryAccessCheck: () => void;
};

export function AccessRequiredContent({
	viewModel,
	isCheckingAccess,
	isSignedOut,
	signInHref,
	homeHref,
	isRetryingAccess,
	lastRefreshLabel,
	onRetryAccessCheck,
}: AccessRequiredContentProps) {
	const refreshHint = isRetryingAccess
		? "Refreshing entitlement status now."
		: lastRefreshLabel
			? `Last checked ${lastRefreshLabel}`
			: "No manual refresh yet.";

	return (
		<Card className="mx-auto w-full max-w-4xl">
			<CardHeader>
				<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
					Account access
				</p>
				<div
					className="flex flex-wrap items-center gap-2"
					role="status"
					aria-live="polite"
					aria-atomic="true"
				>
					<Badge variant={isCheckingAccess ? "default" : "secondary"}>
						{isCheckingAccess
							? "Checking course access"
							: "No course access found"}
					</Badge>
					<Badge variant="outline">Auto refresh enabled</Badge>
					<Badge variant="outline">{viewModel.accessStateLabel}</Badge>
				</div>
				<CardTitle className="pt-2 text-2xl font-semibold sm:text-3xl">
					{viewModel.title}
				</CardTitle>
				<CardDescription className="text-base">
					{viewModel.helperCopy}
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-6">
				{isCheckingAccess ? (
					<Alert>
						<AlertTitle>Purchase sync in progress</AlertTitle>
						<AlertDescription>
							Keep this page open while we confirm your entitlement.
						</AlertDescription>
					</Alert>
				) : null}
				<Separator />
				<AccessRequiredCtaCards
					viewModel={viewModel}
					isCheckingAccess={isCheckingAccess}
					isSignedOut={isSignedOut}
					signInHref={signInHref}
					homeHref={homeHref}
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
