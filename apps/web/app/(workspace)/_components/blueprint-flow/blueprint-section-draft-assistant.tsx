"use client";

import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@shipbysunday/blueprint-compiler";
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
import { useBlueprintSectionDraftAssistant } from "@/app/(workspace)/_hooks/blueprint-flow/use-blueprint-section-draft-assistant";
import type {
	BlueprintDraftableSectionId,
	BlueprintSectionDraftValues,
} from "@/lib/blueprint-flow/blueprint-section-draft-assistant";

export type BlueprintSectionDraftAssistantProps = {
	draftValues: Partial<Record<CanonicalProjectFactKey, string>>;
	facts: CanonicalProjectFactsDraft;
	onApplyDraftValues: (draftValues: BlueprintSectionDraftValues) => void;
	sectionId: BlueprintDraftableSectionId;
	sectionLabel: string;
};

export function BlueprintSectionDraftAssistant({
	draftValues,
	facts,
	onApplyDraftValues,
	sectionId,
	sectionLabel,
}: BlueprintSectionDraftAssistantProps) {
	const {
		closeDialog,
		isBusy,
		isDialogOpen,
		message,
		requestSectionDraft,
		startManagedLogin,
		status,
	} = useBlueprintSectionDraftAssistant({
		draftValues,
		facts,
		onApplyDraftValues,
		sectionId,
	});

	return (
		<>
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={isBusy}
				aria-label={`Draft ${sectionLabel} with AI`}
				onClick={() => void requestSectionDraft()}
			>
				{isBusy ? (
					<>
						<Spinner className="size-3.5" />
						Drafting
					</>
				) : (
					<>
						<SparklesIcon className="size-3.5" />
						Draft with AI
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
						<DialogTitle>Draft {sectionLabel}</DialogTitle>
						<DialogDescription>
							Codex will turn rough notes in this section into editable first
							draft fields.
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
							<Button type="button" onClick={() => void requestSectionDraft()}>
								Try again
							</Button>
						) : null}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
