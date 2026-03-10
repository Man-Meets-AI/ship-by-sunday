import { Suspense } from "react";

import { CheckoutSuccessView } from "@/components/checkout-success-view";

export default function Page() {
	return (
		<Suspense
			fallback={
				<main className="mx-auto flex min-h-screen max-w-[960px] items-center px-4 py-10">
					<section className="w-full border border-line bg-white p-6 shadow-card">
						<p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
							Checkout status
						</p>
						<p className="mt-3 font-display text-4xl uppercase leading-none tracking-[0.04em] text-ink">
							Loading payment status
						</p>
					</section>
				</main>
			}
		>
			<CheckoutSuccessView />
		</Suspense>
	);
}
