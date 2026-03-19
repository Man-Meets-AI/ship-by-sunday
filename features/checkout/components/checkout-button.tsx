"use client";

import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import {
	apiRouteConfig,
	getSignInRedirectHref,
	routeConfig,
} from "@/config/product";
import { Button } from "@/components/ui/button";
import { assert } from "@/features/course/lesson/lib/assert";

export function CheckoutButton({
	label,
	className,
}: {
	label: string;
	className?: string;
}) {
	const { userId } = useAuth();
	const pathname = usePathname();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const loadingLabel = "Redirecting...";
	const reserveLabel =
		loadingLabel.length > label.length ? loadingLabel : label;
	const signInHref = getSignInRedirectHref(
		`${pathname}${routeConfig.pricingHash}`,
	);

	async function handleCheckout() {
		setError(null);

		if (!userId) {
			router.push(signInHref);
			return;
		}

		setIsLoading(true);
		const response = await fetch(apiRouteConfig.stripeCheckout, {
			method: "POST",
		});

		if (response.status === 401) {
			router.push(signInHref);
			return;
		}

		const data = (await response.json()) as { url: string } | { error: string };

		if (!response.ok) {
			assert("error" in data, "Missing checkout error message.");
			setError(data.error);
			setIsLoading(false);
			return;
		}

		assert("url" in data, "Missing checkout redirect URL.");
		window.location.assign(data.url);
	}

	return (
		<div className="flex flex-col items-stretch">
			<Button
				type="button"
				onClick={() => void handleCheckout()}
				disabled={isLoading}
				aria-busy={isLoading}
				className={className}
			>
				<span className="relative inline-grid place-items-center">
					<span className="invisible inline-flex items-center justify-center gap-2">
						<Loader2 className="size-4" aria-hidden="true" />
						{reserveLabel}
					</span>
					<span
						className={`absolute inset-0 inline-flex items-center justify-center transition-all duration-150 ease-out motion-reduce:transition-none ${
							isLoading
								? "translate-y-[-4px] opacity-0"
								: "translate-y-0 opacity-100"
						}`}
					>
						{label}
					</span>
					<span
						className={`absolute inset-0 inline-flex items-center justify-center gap-2 transition-all duration-150 ease-out motion-reduce:transition-none ${
							isLoading
								? "translate-y-0 opacity-100"
								: "translate-y-[4px] opacity-0"
						}`}
						aria-hidden={!isLoading}
					>
						<Loader2 className="size-4 animate-spin" aria-hidden="true" />
						{loadingLabel}
					</span>
				</span>
			</Button>
			<div className="min-h-6" aria-live="polite" aria-atomic="true">
				<p
					aria-hidden={!error}
					className={`mt-2 text-sm font-medium text-destructive transition-all duration-150 ease-out motion-reduce:transition-none ${
						error
							? "translate-y-0 opacity-100"
							: "pointer-events-none translate-y-[-4px] opacity-0"
					}`}
				>
					{error ?? "\u00a0"}
				</p>
			</div>
		</div>
	);
}
