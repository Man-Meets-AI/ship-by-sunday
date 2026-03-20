"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import {
	CHECKOUT_QA_SCENARIO_EXISTING,
	CHECKOUT_QA_SCENARIO_FRESH,
} from "./checkout-qa-loop-constants";

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
			<CardHeader className="space-y-1 pb-3">
				<CardTitle className="text-base">Test scenario</CardTitle>
				<CardDescription>
					Choose which path the prompt should emphasize. Fresh account is the
					default for this lesson.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ToggleGroup
					type="single"
					value={selected}
					onValueChange={(next) => {
						if (next) {
							onChange(next);
						}
					}}
					variant="outline"
					spacing={0}
					className="w-full sm:w-auto"
				>
					<ToggleGroupItem
						value={CHECKOUT_QA_SCENARIO_FRESH}
						aria-label="Fresh account"
						className="flex-1 px-4 sm:flex-initial"
					>
						Fresh account
					</ToggleGroupItem>
					<ToggleGroupItem
						value={CHECKOUT_QA_SCENARIO_EXISTING}
						aria-label="Existing account"
						className="flex-1 px-4 sm:flex-initial"
					>
						Existing account
					</ToggleGroupItem>
				</ToggleGroup>
			</CardContent>
		</Card>
	);
}
