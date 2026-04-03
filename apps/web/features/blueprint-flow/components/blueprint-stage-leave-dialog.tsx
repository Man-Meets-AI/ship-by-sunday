"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function BlueprintStageLeaveDialog({
	isOpen,
	onLeaveWithoutSaving,
	onStay,
}: {
	isOpen: boolean;
	onLeaveWithoutSaving: () => void;
	onStay: () => void;
}) {
	return (
		<AlertDialog open={isOpen}>
			<AlertDialogContent size="sm">
				<AlertDialogHeader>
					<AlertDialogTitle>Leave this blueprint page?</AlertDialogTitle>
					<AlertDialogDescription>
						You have unsaved changes on this page. Continue only if you want to
						leave without saving them.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={onStay}>Stay</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={onLeaveWithoutSaving}
					>
						Leave without saving
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
