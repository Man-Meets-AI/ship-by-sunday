import { SignUp } from "@clerk/nextjs";

export default function Page() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
			<div className="w-full max-w-[440px] space-y-6">
				<div className="space-y-2 text-center">
					<p className="font-sans text-xs font-bold uppercase tracking-[0.24em] text-ink/70">
						Ship by Sunday
					</p>
					<h1 className="font-display text-4xl uppercase leading-none tracking-[0.04em] text-ink">
						Create your account
					</h1>
					<p className="text-sm font-medium leading-relaxed text-ink/75">
						Create your account to open the workspace and start the sprint.
					</p>
				</div>
				<SignUp
					appearance={{
						elements: {
							card: "shadow-none border border-[#111111]",
							headerTitle: "hidden",
							headerSubtitle: "hidden",
						},
					}}
					path="/sign-up"
					signInUrl="/sign-in"
					fallbackRedirectUrl="/mission"
				/>
			</div>
		</main>
	);
}
