import Link from "next/link";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { routeConfig } from "@/config/product";

import type {
	CheckoutProgressStep,
	CheckoutViewModel,
} from "./checkout-success-view-model";

function CheckoutSuccessStepRow({ step }: { step: CheckoutProgressStep }) {
	const icon =
		step.state === "complete" ? (
			<CheckCircle2
				className="size-4 shrink-0 text-muted-foreground"
				aria-hidden
			/>
		) : step.state === "active" ? (
			<Loader2
				className="size-4 shrink-0 animate-spin text-foreground"
				aria-hidden
			/>
		) : (
			<Circle className="size-4 shrink-0 text-muted-foreground" aria-hidden />
		);

	return (
		<div
			className={cn(
				"flex gap-3",
				step.state === "active" && "rounded-lg border bg-card p-3",
				step.state === "complete" && "rounded-lg py-1.5",
				step.state === "pending" && "py-1.5",
			)}
		>
			<div className="pt-0.5">{icon}</div>
			<div className="min-w-0 flex-1">
				<p className="font-medium leading-none">{step.label}</p>
				<p className="mt-1.5 text-sm text-muted-foreground">{step.detail}</p>
			</div>
		</div>
	);
}

export function CheckoutSuccessMainPanel({
	viewModel,
	canAutoRedirect,
}: {
	viewModel: CheckoutViewModel;
	canAutoRedirect: boolean;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{viewModel.shellTitle}</CardTitle>
				<CardDescription>{viewModel.shellSubtitle}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
					Checkout status
				</p>
				<div
					className="flex flex-wrap gap-2"
					role="status"
					aria-live="polite"
					aria-atomic="true"
				>
					<Badge variant="secondary" className="gap-2">
						<span
							className={
								canAutoRedirect
									? "inline-block size-2 shrink-0 rounded-full bg-foreground"
									: "inline-block size-2 shrink-0 rounded-full bg-primary motion-safe:animate-pulse"
							}
							aria-hidden="true"
						/>
						{viewModel.statusLabel}
					</Badge>
					<Badge variant="outline">
						{canAutoRedirect ? "Redirect armed" : "Polling access"}
					</Badge>
					<Badge variant="outline">Manual recovery available</Badge>
				</div>
				<Separator />
				<div>
					<CardTitle className="text-xl sm:text-2xl">
						{viewModel.heading}
					</CardTitle>
					<CardDescription className="mt-2 text-base">
						{viewModel.body}
					</CardDescription>
				</div>
				<Separator />
				<div className="flex flex-col gap-2">
					{viewModel.progressSteps.map((step) => (
						<CheckoutSuccessStepRow key={step.label} step={step} />
					))}
				</div>
			</CardContent>
			<Separator />
			<CardFooter className="flex-col items-stretch gap-4">
				<div>
					<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
						Next step
					</p>
					<CardDescription className="mt-2 text-sm text-foreground">
						{viewModel.primaryActionBody}
					</CardDescription>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button asChild className="min-w-48 justify-center">
						<Link href={viewModel.primaryActionHref}>
							{viewModel.primaryActionLabel}
						</Link>
					</Button>
					{viewModel.alternateActionHref && viewModel.alternateActionLabel ? (
						<Button
							asChild
							variant="secondary"
							className="min-w-44 justify-center"
						>
							<Link href={viewModel.alternateActionHref}>
								{viewModel.alternateActionLabel}
							</Link>
						</Button>
					) : null}
					<Button asChild variant="outline" className="min-w-44 justify-center">
						<Link href={routeConfig.home}>Go home</Link>
					</Button>
				</div>
				<CardDescription>{viewModel.secondaryActionBody}</CardDescription>
			</CardFooter>
		</Card>
	);
}
