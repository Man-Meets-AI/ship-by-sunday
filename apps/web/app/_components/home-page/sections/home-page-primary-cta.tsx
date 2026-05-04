import Link from "next/link";

import { Button } from "@/components/ui/button";
import { type HomePageCtaTarget } from "@/config/product";
import { type CheckoutButtonLoadingLabels } from "@/app/checkout/_components/checkout-button";
import { assertNever } from "@/lib/assert";
import { PRIMARY_CTA_INVERT_CLASSES } from "@/lib/styling/primary-cta-invert-classes";
import { cn } from "@/lib/utils";
import { HomePageCheckoutCta } from "./home-page-checkout-cta";

type HomePagePrimaryCtaProps = {
	readonly target: HomePageCtaTarget;
	readonly label: string;
	readonly className?: string;
	readonly testId?: string;
	readonly onBeforeCheckout?: () => void | Promise<void>;
	readonly onError?: (message: string | null) => void;
	readonly loadingLabels?: CheckoutButtonLoadingLabels;
};

export function HomePagePrimaryCta({
	target,
	label,
	className,
	testId,
	onBeforeCheckout,
	onError,
	loadingLabels,
}: HomePagePrimaryCtaProps) {
	const mergedClassName = cn(PRIMARY_CTA_INVERT_CLASSES, className);

	switch (target.kind) {
		case "checkout":
			return (
				<HomePageCheckoutCta
					label={label}
					checkoutIntent={target.checkoutIntent}
					className={mergedClassName}
					testId={testId}
					onBeforeCheckout={onBeforeCheckout}
					onError={onError}
					loadingLabels={loadingLabels}
				/>
			);
		case "link":
			return (
				<Button className={mergedClassName} data-testid={testId} asChild>
					<Link href={target.href}>{label}</Link>
				</Button>
			);
		default:
			return assertNever(target, "Unsupported homepage CTA target");
	}
}
