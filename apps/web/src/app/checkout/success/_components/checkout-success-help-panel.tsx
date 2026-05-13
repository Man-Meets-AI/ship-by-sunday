import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import type { CheckoutViewModel } from "../_lib/checkout-success-view-model";

export function CheckoutSuccessHelpPanel({
	viewModel,
}: {
	viewModel: CheckoutViewModel;
}) {
	return (
		<Card>
			<CardHeader className="gap-2">
				<p className="text-[0.7rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
					Recovery help
				</p>
				<CardTitle className="text-lg font-semibold tracking-tight">
					{viewModel.helpTitle}
				</CardTitle>
				<CardDescription className="leading-relaxed">
					{viewModel.helpLeadCopy}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ul className="list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-muted-foreground">
					{viewModel.helpItems.map((item) => (
						<li key={item}>{item}</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}
