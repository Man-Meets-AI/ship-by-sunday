import Link from "next/link";

import { Button } from "@/components/ui/button";
import { type HomePageCtaTarget } from "@/config/product";
import { CheckoutButton } from "@/features/checkout/components/checkout-button";
import { assertNever } from "@/features/course/lesson/lib/assert";

type HomePagePrimaryCtaProps = {
	readonly target: HomePageCtaTarget;
	readonly label: string;
	readonly className?: string;
	readonly testId?: string;
};

export function HomePagePrimaryCta({
	target,
	label,
	className,
	testId,
}: HomePagePrimaryCtaProps) {
	switch (target.kind) {
		case "checkout":
			return (
				<CheckoutButton label={label} className={className} testId={testId} />
			);
		case "link":
			return (
				<Button className={className} data-testid={testId} asChild>
					<Link href={target.href}>{label}</Link>
				</Button>
			);
		default:
			return assertNever(target, "Unsupported homepage CTA target");
	}
}
