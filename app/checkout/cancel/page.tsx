import Link from "next/link";

export default function Page() {
	return (
		<main className="mx-auto flex min-h-screen max-w-[960px] items-center px-4 py-10">
			<section className="w-full border border-line bg-white p-6 shadow-card">
				<p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
					Checkout canceled
				</p>
				<h1 className="mt-3 font-display text-5xl uppercase leading-none tracking-[0.04em] text-ink">
					No charge was completed
				</h1>
				<p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-ink/75">
					You can go back to the pricing section and restart checkout whenever
					you’re ready.
				</p>
				<div className="mt-6 flex flex-wrap gap-3">
					<Link
						href="/#pricing"
						className="inline-flex border border-line bg-ink px-4 py-3 font-display text-2xl uppercase tracking-[0.04em] text-paper"
					>
						Back to pricing
					</Link>
				</div>
			</section>
		</main>
	);
}
