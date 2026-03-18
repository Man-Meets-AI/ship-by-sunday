import { SignIn } from "@clerk/nextjs";

import { ProductBrand } from "@/shared/branding/product-brand";
import { authViewConfig, routeConfig } from "@/config/product";

export default function Page() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
			<div className="w-full max-w-[440px] space-y-6">
				<div className="space-y-2 text-center">
					<ProductBrand
						href="/"
						priority
						imageSize={64}
						className="justify-center"
						imageClassName="rounded-xl"
						labelClassName="font-display text-2xl uppercase tracking-[0.06em] text-ink"
					/>
					<h1 className="font-display text-4xl uppercase leading-none tracking-[0.04em] text-ink">
						Sign in
					</h1>
					<p className="text-sm font-medium leading-relaxed text-ink/75">
						Sign in to open your workspace and continue the sprint.
					</p>
				</div>
				<SignIn
					appearance={{
						elements: {
							card: authViewConfig.clerkCardClassName,
							headerTitle: "hidden",
							headerSubtitle: "hidden",
						},
					}}
					path={routeConfig.signIn}
					signUpUrl={routeConfig.signUp}
					fallbackRedirectUrl={authViewConfig.fallbackRedirectUrl}
				/>
			</div>
		</main>
	);
}
