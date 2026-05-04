import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { buildWorkspaceSetupReadinessModel } from "@/app/(workspace)/_lib/workspace-setup-readiness-model";

type DoctorPassActionModel = ReturnType<
	typeof buildWorkspaceSetupReadinessModel
>["doctorPassAction"];

export function SetupDoctorPassAction({
	action,
	pending,
	onRunDoctorPass,
}: {
	action: DoctorPassActionModel;
	pending: boolean;
	onRunDoctorPass: () => void;
}) {
	return (
		<section className="rounded-xl border border-border/60 bg-background p-4">
			<div className="space-y-1">
				<h2 className="text-sm font-semibold text-foreground">Doctor Pass</h2>
				<p className="text-sm leading-6 text-muted-foreground">
					{action.helperText}
				</p>
			</div>
			<Button
				type="button"
				size="lg"
				className="mt-4 w-full"
				disabled={action.disabled || pending}
				onClick={onRunDoctorPass}
				data-testid="workspace-setup-run-doctor-pass"
			>
				{pending ? "Starting doctor pass" : action.label}
				<ArrowRight className="size-4" aria-hidden />
			</Button>
			{action.disabledReason ? (
				<p className="mt-3 text-sm leading-6 text-muted-foreground">
					{action.disabledReason}
				</p>
			) : (
				<p className="mt-3 text-sm leading-6 text-muted-foreground">
					The browser does not run probes directly. The paired runner owns local
					execution and sync preview.
				</p>
			)}
		</section>
	);
}
