"use client";

import type {
	CanonicalProjectFactKey,
	CanonicalProjectFactsDraft,
} from "@shipbysunday/codebase-compiler";
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
import { useCodebaseSectionDraftAssistant } from "@/app/(app)/_hooks/codebase-flow/use-codebase-section-draft-assistant";
import type {
	CodebaseDraftableSectionId,
	CodebaseSectionDraftValues,
} from "@/lib/codebase-flow/codebase-section-draft-assistant";

export type CodebaseSectionDraftAssistantProps = {
	draftValues: Partial<Record<CanonicalProjectFactKey, string>>;
	facts: CanonicalProjectFactsDraft;
	onApplyDraftValues: (draftValues: CodebaseSectionDraftValues) => void;
	sectionId: CodebaseDraftableSectionId;
	sectionLabel: string;
};

export function CodebaseSectionDraftAssistant({
	draftValues,
	facts,
	onApplyDraftValues,
	sectionId,
	sectionLabel,
}: CodebaseSectionDraftAssistantProps) {
	const {
		closeDialog,
		isBusy,
		isDialogOpen,
		message,
		requestSectionDraft,
		startManagedLogin,
		status,
	} = useCodebaseSectionDraftAssistant({
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
