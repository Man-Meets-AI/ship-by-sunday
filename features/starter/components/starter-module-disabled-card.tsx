import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

type StarterModuleDisabledAction = {
	href: string;
	label: string;
	variant?: "default" | "secondary" | "outline";
};

export function StarterModuleDisabledCard({
	eyebrow,
	title,
	description,
	actions,
}: {
	eyebrow: string;
	title: string;
	description: string;
	actions: readonly StarterModuleDisabledAction[];
}) {
	return (
		<Card className="w-full max-w-2xl">
			<CardHeader>
				<CardDescription>{eyebrow}</CardDescription>
				<CardTitle className="text-2xl">{title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="text-sm text-muted-foreground">{description}</p>
			</CardContent>
			<CardFooter className="flex flex-wrap gap-3">
				{actions.map((action) => (
					<Button
						key={`${action.href}:${action.label}`}
						asChild
						variant={action.variant ?? "default"}
					>
						<Link href={action.href}>{action.label}</Link>
					</Button>
				))}
			</CardFooter>
		</Card>
	);
}
