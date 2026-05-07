"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import type { AdminImpersonationCustomer } from "../_server/admin-impersonation-server";

export function StartImpersonationConfirmDialog({
	open,
	customer,
	reason,
	canStart,
	isPending,
	onOpenChange,
	onConfirm,
}: {
	open: boolean;
	customer: AdminImpersonationCustomer | null;
	reason: string;
	canStart: boolean;
	isPending: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Start impersonating customer?</DialogTitle>
					<DialogDescription>
						Customers are not notified. Actions are recorded in the support
						audit log.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-2 text-sm">
					<div className="font-medium">{customer?.email}</div>
					<p className="line-clamp-4 text-muted-foreground">{reason}</p>
				</div>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={onConfirm}
						disabled={!canStart || isPending}
					>
						Start impersonating customer
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
