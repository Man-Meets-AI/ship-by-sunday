"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
	CHECKOUT_QA_SCENARIO_EXISTING,
	CHECKOUT_QA_SCENARIO_FRESH,
} from "@/lib/course/lesson/workbench/modes/checkout-qa-loop/checkout-qa-loop-constants";

export function CheckoutQaLoopScenarioToggle({
	value,
	onChange,
}: {
	value: unknown;
	onChange: (value: unknown) => void;
}) {
	const raw = typeof value === "string" ? value : "";
	const selected =
		raw === CHECKOUT_QA_SCENARIO_EXISTING
			? CHECKOUT_QA_SCENARIO_EXISTING
			: CHECKOUT_QA_SCENARIO_FRESH;

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Test scenario</CardTitle>
				<CardDescription>
					Choose which path the prompt should emphasize. Fresh account is the
					default for this lesson.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<RadioGroup
					value={selected}
					onValueChange={(next) => {
						onChange(next);
					}}
				>
					<div className="flex items-center gap-3">
						<RadioGroupItem
							value={CHECKOUT_QA_SCENARIO_FRESH}
							id="checkout-qa-scenario-fresh"
						/>
						<Label htmlFor="checkout-qa-scenario-fresh" className="font-normal">
							Fresh account
						</Label>
					</div>
					<div className="flex items-center gap-3">
						<RadioGroupItem
							value={CHECKOUT_QA_SCENARIO_EXISTING}
							id="checkout-qa-scenario-existing"
						/>
						<Label
							htmlFor="checkout-qa-scenario-existing"
							className="font-normal"
						>
							Existing account
						</Label>
					</div>
				</RadioGroup>
			</CardContent>
		</Card>
	);
}
