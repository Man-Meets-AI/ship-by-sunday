"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import type {
	AdminImpersonationCustomer,
	AdminImpersonationPageData,
} from "../_server/admin-impersonation-server";
import { CustomerPicker } from "./customer-picker";

export function StartImpersonationCard({
	initialCustomers,
	selectedCustomer,
	reason,
	canStart,
	lockedToCurrentSession,
	isPending,
	onSelectCustomer,
	onReasonChange,
	onStartClick,
}: {
	initialCustomers: AdminImpersonationPageData["initialCustomers"];
	selectedCustomer: AdminImpersonationCustomer | null;
	reason: string;
	canStart: boolean;
	lockedToCurrentSession: boolean;
	isPending: boolean;
	onSelectCustomer: (customer: AdminImpersonationCustomer) => void;
	onReasonChange: (reason: string) => void;
	onStartClick: () => void;
}) {
	return (
		<Card className="rounded-lg">
			<CardHeader>
				<CardTitle>Start support mode</CardTitle>
				<CardDescription>
					Select a non-admin Clerk customer and record a support reason.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<CustomerPicker
					initialCustomers={initialCustomers}
					selectedCustomer={selectedCustomer}
					onSelectCustomer={onSelectCustomer}
				/>
				<div className="space-y-2">
					<Textarea
						value={reason}
						onChange={(event) => onReasonChange(event.target.value)}
						placeholder="Reason for support access"
						aria-label="Reason for support access"
						minLength={10}
						maxLength={500}
						disabled={lockedToCurrentSession}
					/>
					<p className="text-xs text-muted-foreground">
						10-500 characters. Do not paste secrets, tokens, private repo
						contents, sensitive stack traces, or unnecessary personal data.
					</p>
				</div>
				<Button
					type="button"
					onClick={onStartClick}
					disabled={!canStart || lockedToCurrentSession || isPending}
				>
					Start impersonating customer
				</Button>
			</CardContent>
		</Card>
	);
}
