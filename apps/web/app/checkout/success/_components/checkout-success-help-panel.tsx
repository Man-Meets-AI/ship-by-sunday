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
			<CardHeader>
				<CardTitle className="text-base">{viewModel.helpTitle}</CardTitle>
				<CardDescription>{viewModel.helpLeadCopy}</CardDescription>
			</CardHeader>
			<CardContent>
				<ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
					{viewModel.helpItems.map((item) => (
						<li key={item}>{item}</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}
