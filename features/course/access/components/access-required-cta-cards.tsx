import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { CheckoutButton } from "@/features/checkout/components/checkout-button";
import type { AccessViewModel } from "@/features/course/access/lib/access-required-view-model";

export type AccessRequiredCtaCardsProps = {
	viewModel: AccessViewModel;
	isCheckingAccess: boolean;
	isSignedOut: boolean;
	signInHref: string;
	homeHref: string;
	isRetryingAccess: boolean;
	refreshHint: string;
	onRetryAccessCheck: () => void;
};

export function AccessRequiredCtaCards({
	viewModel,
	isCheckingAccess,
	isSignedOut,
	signInHref,
	homeHref,
	isRetryingAccess,
	refreshHint,
	onRetryAccessCheck,
}: AccessRequiredCtaCardsProps) {
	return (
		<div className="grid gap-4 sm:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Already paid</CardTitle>
					<CardDescription>
						{viewModel.alreadyPaidDescription}
					</CardDescription>
				</CardHeader>
				{!isSignedOut ? (
					<CardContent className="text-xs text-muted-foreground">
						<p aria-live="polite">{refreshHint}</p>
					</CardContent>
				) : null}
				<CardFooter className="flex flex-wrap gap-2">
					{isSignedOut ? (
						<>
							<Button asChild className="min-w-44 justify-center">
								<Link href={signInHref}>Sign in</Link>
							</Button>
							<Button
								asChild
								variant="secondary"
								className="min-w-44 justify-center"
							>
								<Link href={homeHref}>Back home</Link>
							</Button>
						</>
					) : (
						<>
							<Button
								type="button"
								onClick={onRetryAccessCheck}
								disabled={isRetryingAccess}
								aria-busy={isRetryingAccess}
								className="min-w-44 justify-center"
							>
								{isRetryingAccess ? (
									<>
										<Spinner data-icon="inline-start" />
										Refreshing…
									</>
								) : (
									"Retry access check"
								)}
							</Button>
							<Button
								asChild
								variant="secondary"
								className="min-w-44 justify-center"
							>
								<Link href={homeHref}>Back home</Link>
							</Button>
						</>
					)}
				</CardFooter>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Need to buy access</CardTitle>
					<CardDescription>
						{viewModel.purchaseDecisionDescription}
					</CardDescription>
				</CardHeader>
				<CardFooter className="flex flex-wrap gap-2">
					{!isCheckingAccess && !isSignedOut ? (
						<CheckoutButton
							label="Buy access now"
							className="min-w-48 justify-center"
						/>
					) : null}
					{isSignedOut ? (
						<Button asChild className="min-w-48 justify-center">
							<Link href={signInHref}>Sign in first</Link>
						</Button>
					) : null}
					<Button
						asChild
						variant="outline"
						className="min-w-44 justify-center"
					>
						<Link href={homeHref}>See offer</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
