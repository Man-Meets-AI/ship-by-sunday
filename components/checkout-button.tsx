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
		<div>
			<button
				type="button"
				onClick={() => void handleCheckout()}
				disabled={isLoading}
				className={`${className} disabled:cursor-not-allowed disabled:opacity-70`}
			>
				{isLoading ? "Redirecting..." : label}
			</button>
			{error ? (
				<p className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#a83232]">
					{error}
				</p>
			) : null}
		</div>
	);
}
