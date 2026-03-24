import type { ReactNode } from "react";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

type AuthPageShellProps = {
	children: ReactNode;
	description?: ReactNode;
	title: string;
};

export function AuthPageShell({
	children,
	description,
	title,
}: AuthPageShellProps) {
	return (
		<Card className="w-full max-w-sm">
			<CardHeader className="items-start text-left">
				<CardTitle>{title}</CardTitle>
				{description ? <CardDescription>{description}</CardDescription> : null}
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}
