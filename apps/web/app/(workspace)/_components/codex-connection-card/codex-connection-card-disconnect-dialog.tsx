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
import { Spinner } from "@/components/ui/spinner";
import type { RequestState } from "@/app/(workspace)/_components/codex-connection-card/codex-connection-card-model";

const dialogMotionClassName =
	"motion-reduce:animate-none motion-reduce:data-[state=closed]:animate-none motion-reduce:transition-none motion-reduce:duration-0";

export function CodexConnectionDisconnectDialog({
	open,
	onOpenChange,
	requestState,
	onConfirmDisconnect,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	requestState: RequestState;
	onConfirmDisconnect: () => void;
}) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className={dialogMotionClassName}>
				<AlertDialogHeader>
					<AlertDialogTitle>Disconnect Codex account?</AlertDialogTitle>
					<AlertDialogDescription>
						In-lesson generation will stop using your subscription until you
						connect again.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel type="button">Cancel</AlertDialogCancel>
					<AlertDialogAction
						type="button"
						variant="destructive"
						disabled={requestState === "disconnecting"}
						onClick={onConfirmDisconnect}
						data-testid="codex-connection-disconnect-confirm"
					>
						{requestState === "disconnecting" ? (
							<>
								<Spinner className="size-3.5" />
								Disconnect
							</>
						) : (
							"Disconnect"
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
