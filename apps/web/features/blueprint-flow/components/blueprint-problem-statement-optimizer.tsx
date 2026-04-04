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
import type { BlueprintStepDraftValues } from "@/features/blueprint-flow/lib/blueprint-step-save-feedback";
import { useBlueprintProblemStatementOptimizer } from "@/features/blueprint-flow/hooks/use-blueprint-problem-statement-optimizer";

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
						<DialogTitle>Optimize this problem statement</DialogTitle>
						<DialogDescription>
							Use your managed ChatGPT/Codex account to rewrite this field in
							place.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-2 text-sm leading-6 text-muted-foreground">
						<p>
							{message ??
								"We will keep the current field open and update it as soon as the optimized version is ready."}
						</p>
						{status === "polling_login" ? (
							<p>Login is still pending while we check the managed account.</p>
						) : null}
						<p className="text-foreground/80">
							The optimized text will replace the current field value directly.
						</p>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={closeDialog}>
							Close
						</Button>
						{status === "needs_login" ? (
							<Button type="button" onClick={() => void startManagedLogin()}>
								Connect Codex account
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
