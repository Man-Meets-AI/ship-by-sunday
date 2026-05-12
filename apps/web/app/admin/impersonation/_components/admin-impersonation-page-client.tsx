"use client";

import { useClerk, useSignIn } from "@clerk/nextjs";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
	completeAdminImpersonationHandoffAction,
	failAdminImpersonationHandoffAction,
	startAdminImpersonationAction,
} from "../actions";
import type {
	AdminImpersonationCustomer,
	AdminImpersonationPageData,
} from "../_server/admin-impersonation-server";
import { adminImpersonationReasonIsValid } from "./admin-impersonation-model";
import { ImpersonationHistory } from "./impersonation-history";
import { StartImpersonationCard } from "./start-impersonation-card";
import { StartImpersonationConfirmDialog } from "./start-impersonation-confirm-dialog";

export function AdminImpersonationPageClient({
	data,
}: {
	data: AdminImpersonationPageData;
}) {
	const { push } = useRouter();
	const clerk = useClerk();
	const { signIn } = useSignIn();
	const [selectedCustomer, setSelectedCustomer] =
		useState<AdminImpersonationCustomer | null>(null);
	const [reason, setReason] = useState("");
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const canStart =
		data.status.state === "normal" &&
		selectedCustomer !== null &&
		adminImpersonationReasonIsValid(reason);

	function startImpersonation() {
		if (!selectedCustomer || !canStart || !signIn) {
			return;
		}

		setMessage(null);
		startTransition(async () => {
			const result = await startAdminImpersonationAction({
				subjectClerkUserId: selectedCustomer.clerkUserId,
				subjectEmail: selectedCustomer.email,
				reason,
			});
			if (!result.ok) {
				setMessage(result.message);
				return;
			}

			try {
				const signInResult = (await signIn.create({
					strategy: "ticket",
					ticket: result.token,
				})) as {
					createdSessionId?: string | null;
					error?: object | string | null;
				};
				if (signInResult.error) {
					throw new Error("Clerk rejected the actor-token ticket.");
				}
				const createdSessionId =
					signInResult.createdSessionId ?? signIn.createdSessionId;
				if (!createdSessionId) {
					throw new Error("Clerk did not create an impersonated session.");
				}
				await clerk.setActive({ session: createdSessionId });
				const completeResult = await completeAdminImpersonationHandoffAction();
				if (!completeResult.ok) {
					throw new Error(completeResult.message);
				}
				push(result.destination);
			} catch (error) {
				await failAdminImpersonationHandoffAction(result.sessionId).catch(
					() => null,
				);
				await clerk.signOut().catch(() => null);
				setMessage(
					error instanceof Error
						? error.message
						: "Unable to complete Clerk handoff.",
				);
			}
		});
	}

	const lockedToCurrentSession = data.status.state !== "normal";

	return (
		<div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
			<section className="space-y-4">
				<div className="space-y-1">
					<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
						<ShieldCheck className="size-4" aria-hidden />
						{data.adminEmail}
					</div>
					<h1 className="text-2xl font-semibold tracking-normal">
						Admin impersonation
					</h1>
				</div>

				{lockedToCurrentSession ? (
					<Alert variant="destructive">
						<AlertCircle aria-hidden />
						<AlertTitle>Current support session controls are locked</AlertTitle>
						<AlertDescription>
							Stop the current session before starting another customer session.
						</AlertDescription>
					</Alert>
				) : null}
				{message ? (
					<Alert variant="destructive">
						<AlertCircle aria-hidden />
						<AlertTitle>Unable to start impersonation</AlertTitle>
						<AlertDescription>{message}</AlertDescription>
					</Alert>
				) : null}

				<StartImpersonationCard
					initialCustomers={data.initialCustomers}
					selectedCustomer={selectedCustomer}
					reason={reason}
					canStart={canStart}
					lockedToCurrentSession={lockedToCurrentSession}
					isPending={isPending}
					onSelectCustomer={setSelectedCustomer}
					onReasonChange={setReason}
					onStartClick={() => setConfirmOpen(true)}
				/>
			</section>
			<ImpersonationHistory history={data.history} />

			<StartImpersonationConfirmDialog
				open={confirmOpen}
				customer={selectedCustomer}
				reason={reason}
				canStart={canStart}
				isPending={isPending}
				onOpenChange={setConfirmOpen}
				onConfirm={() => {
					setConfirmOpen(false);
					startImpersonation();
				}}
			/>
		</div>
	);
}
