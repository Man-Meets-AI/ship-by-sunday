"use client";

import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function CheckoutButton({
	label,
	className,
}: {
	label: string;
	className: string;
}) {
	const { userId } = useAuth();
	const pathname = usePathname();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const loadingLabel = "Redirecting...";
	const reserveLabel =
		loadingLabel.length > label.length ? loadingLabel : label;

	async function handleCheckout() {
		setError(null);

		if (!userId) {
			router.push(
				`/sign-in?redirect_url=${encodeURIComponent(`${pathname}#pricing`)}`,
			);
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch("/api/stripe/checkout", {
				method: "POST",
			});
			const data = (await response.json().catch(() => null)) as {
				error?: string;
				url?: string;
			} | null;

			if (response.status === 401) {
				router.push(
					`/sign-in?redirect_url=${encodeURIComponent(`${pathname}#pricing`)}`,
				);
				return;
			}

			if (!response.ok || !data?.url) {
				setError(data?.error ?? "Unable to start checkout.");
				setIsLoading(false);
				return;
			}

			window.location.assign(data.url);
		} catch {
			setError("Unable to start checkout.");
			setIsLoading(false);
		}
	}

	return (
		<div className="flex flex-col items-stretch">
			<button
				type="button"
				onClick={() => void handleCheckout()}
				disabled={isLoading}
				aria-busy={isLoading}
				className={`${className} sbs-press-feedback disabled:cursor-not-allowed disabled:opacity-70`}
			>
				<span className="relative inline-grid place-items-center">
					<span className="invisible inline-flex items-center justify-center gap-2">
						<span className="size-4" aria-hidden="true" />
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
						<span
							className="relative flex size-4 items-center justify-center"
							aria-hidden="true"
						>
							<span className="absolute inset-0 rounded-full border border-current/25" />
							<span className="absolute inset-[2px] rounded-full border border-transparent border-t-current motion-safe:animate-spin" />
						</span>
						{loadingLabel}
					</span>
				</span>
			</button>
			<div className="min-h-6" aria-live="polite" aria-atomic="true">
				<p
					aria-hidden={!error}
					className={`mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#a83232] transition-all duration-150 ease-out motion-reduce:transition-none ${
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
