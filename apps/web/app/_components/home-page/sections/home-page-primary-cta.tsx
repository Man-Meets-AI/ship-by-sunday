import Link from "next/link";

import { Button } from "@/components/ui/button";
import { type HomePageCtaTarget } from "@/config/product";
import {
	CheckoutButton,
	type CheckoutButtonLoadingLabels,
} from "@/app/checkout/_components/checkout-button";
import { assertNever } from "@/lib/assert";
import { cn } from "@/lib/utils";

// Use foreground/background tokens so the CTA inverts cleanly in dark mode.
// The shadcn `--primary` token is owned by the generated design system and
// does not flip across themes for every preset, which leaves a default
// `bg-primary` button rendering dark-on-dark on the marketing surface.
const HOMEPAGE_PRIMARY_CTA_CLASSES =
	"bg-foreground text-background hover:bg-foreground/90 disabled:bg-foreground disabled:text-background";

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
	const mergedClassName = cn(HOMEPAGE_PRIMARY_CTA_CLASSES, className);

	switch (target.kind) {
		case "checkout":
			return (
				<CheckoutButton
					label={label}
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
