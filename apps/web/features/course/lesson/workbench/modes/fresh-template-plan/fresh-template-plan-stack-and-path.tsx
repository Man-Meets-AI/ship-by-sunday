"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FRESH_TEMPLATE_PLAN_FIELD_IDS } from "./fresh-template-plan-constants";

type FreshTemplatePlanStackAndPathProps = {
	referencePath: string;
	stackOther: string;
	includeConvex: boolean;
	includeNextjs: boolean;
	includeClerk: boolean;
	includeStripe: boolean;
	onFieldChange: (fieldId: string, value: unknown) => void;
};

export function FreshTemplatePlanStackAndPath({
	referencePath,
	stackOther,
	includeConvex,
	includeNextjs,
	includeClerk,
	includeStripe,
	onFieldChange,
}: FreshTemplatePlanStackAndPathProps) {
	const ids = FRESH_TEMPLATE_PLAN_FIELD_IDS;

	return (
		<>
			<div className="space-y-2">
				<Label htmlFor={ids.referencePath} className="text-xs font-medium">
					Reference codebase path{" "}
					<span className="font-normal text-muted-foreground">(optional)</span>
				</Label>
				<Input
					id={ids.referencePath}
					placeholder="/Users/you/Projects/reference-app"
					value={referencePath}
					onChange={(e) => onFieldChange(ids.referencePath, e.target.value)}
					className="font-mono text-xs"
				/>
			</div>

			<div className="space-y-2">
				<Label className="text-xs font-medium">Include in prompt</Label>
				<div className="grid gap-3 sm:grid-cols-2">
					{(
						[
							[includeConvex, "Convex", ids.includeConvex],
							[includeNextjs, "Next.js", ids.includeNextjs],
							[includeClerk, "Clerk", ids.includeClerk],
							[includeStripe, "Stripe", ids.includeStripe],
						] as const
					).map(([checked, label, fieldId]) => (
						<div key={fieldId} className="flex items-center gap-2">
							<Checkbox
								id={fieldId}
								checked={checked}
								onCheckedChange={(v) => onFieldChange(fieldId, v === true)}
							/>
							<Label htmlFor={fieldId} className="text-sm font-normal">
								{label}
							</Label>
						</div>
					))}
				</div>
				<div className="space-y-2 pt-1">
					<Label htmlFor={ids.stackOther} className="text-xs font-medium">
						Other pieces{" "}
						<span className="font-normal text-muted-foreground">
							(optional)
						</span>
					</Label>
					<Input
						id={ids.stackOther}
						placeholder="e.g. Bunny Stream, Resend"
						value={stackOther}
						onChange={(e) => onFieldChange(ids.stackOther, e.target.value)}
					/>
				</div>
			</div>
		</>
	);
}
