"use client";

import type { CanonicalProjectFactsDraft } from "@shipbysunday/blueprint-compiler";
import { SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import type { BlueprintStepDraftValues } from "@/lib/blueprint-flow/blueprint-step-save-feedback";
import { useBlueprintProblemStatementOptimizer } from "@/app/(workspace)/_hooks/blueprint-flow/use-blueprint-problem-statement-optimizer";

export function BlueprintProblemStatementOptimizer({
	draftValues,
	facts,
	onApplyOptimizedValue,
	stepId,
}: {
	draftValues: BlueprintStepDraftValues;
	facts: CanonicalProjectFactsDraft;
	onApplyOptimizedValue: (nextValue: string) => void;
	stepId: string;
}) {
	const {
		closeDialog,
		isBusy,
		isDialogOpen,
		message,
		requestOptimization,
		startManagedLogin,
		status,
	} = useBlueprintProblemStatementOptimizer({
		draftValues,
		facts,
		onApplyOptimizedValue,
		stepId,
	});

	return (
		<>
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={isBusy}
				onClick={() => void requestOptimization()}
			>
				{isBusy ? (
					<>
						<Spinner className="size-3.5" />
						Optimizing
					</>
				) : (
					<>
						<SparklesIcon className="size-3.5" />
						Optimize
					</>
				)}
			</Button>
			<Dialog
				open={isDialogOpen}
				onOpenChange={(nextOpen) => {
					if (!nextOpen) {
						closeDialog();
					}
				}}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Optimize problem statement</DialogTitle>
						<DialogDescription>
							AI will sharpen this into a clearer, more specific problem
							statement and update the field for you.
						</DialogDescription>
					</DialogHeader>
					{message ? (
						<p className="text-sm leading-6 text-muted-foreground">{message}</p>
					) : null}
					{status === "polling_login" ? (
						<p className="text-sm leading-6 text-muted-foreground">
							Waiting for account connection...
						</p>
					) : null}
					<DialogFooter>
						<Button type="button" variant="outline" onClick={closeDialog}>
							Close
						</Button>
						{status === "needs_login" ? (
							<Button type="button" onClick={() => void startManagedLogin()}>
								Connect account
							</Button>
						) : status === "error" ? (
							<Button type="button" onClick={() => void requestOptimization()}>
								Try again
							</Button>
						) : null}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
