"use client";

import { AlertTriangleIcon } from "lucide-react";
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

export function CodebaseStageLeaveDialog({
	isOpen,
	onLeaveWithoutSaving,
	onStay,
}: {
	isOpen: boolean;
	onLeaveWithoutSaving: () => void;
	onStay: () => void;
}) {
	return (
		<AlertDialog
			open={isOpen}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) {
					onStay();
				}
			}}
		>
			<AlertDialogContent size="sm" data-testid="codebase-page-leave-dialog">
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-center gap-2">
						<AlertTriangleIcon
							aria-hidden
							className="size-4 text-destructive"
						/>
						Leave with unsaved changes?
					</AlertDialogTitle>
					<AlertDialogDescription>
						You have unsaved edits on this codebase. They will be lost if you
						leave now.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel
						className="min-w-0 whitespace-normal px-4"
						onClick={onStay}
						data-testid="codebase-page-leave-dialog-stay"
					>
						Stay on this page
					</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						className="min-w-0 whitespace-normal bg-destructive px-4 text-white hover:bg-destructive/90 dark:bg-destructive dark:text-white dark:hover:bg-destructive/90"
						onClick={onLeaveWithoutSaving}
						data-testid="codebase-page-leave-dialog-leave"
					>
						Leave without saving
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
