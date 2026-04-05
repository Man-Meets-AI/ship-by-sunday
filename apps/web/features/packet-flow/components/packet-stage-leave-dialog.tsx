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

export function PacketStageLeaveDialog({
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
					<AlertDialogTitle>Leave this packet page?</AlertDialogTitle>
					<AlertDialogDescription>
						You have unsaved changes on this page. Continue only if you want to
						leave without saving them.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={onStay}>Stay</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						className="bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive dark:text-white dark:hover:bg-destructive/90"
						onClick={onLeaveWithoutSaving}
					>
						Leave without saving
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
