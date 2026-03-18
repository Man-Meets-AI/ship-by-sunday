import { SignUp } from "@clerk/nextjs";
import { authViewConfig, routeConfig } from "@/config/product";
import { ProductBrand } from "@/shared/branding/product-brand";
import { PublicPageFrame, PublicSurfaceCard } from "@/shared/ui/public-surface";

export default function Page() {
	return (
		<PublicPageFrame
			maxWidthClassName="max-w-[520px]"
			centerContent
			contentClassName="px-4 py-10"
		>
			<div className="w-full space-y-6">
				<PublicSurfaceCard as="div" className="p-6 sm:p-7">
					<div className="space-y-2 text-center">
						<ProductBrand
							href="/"
							priority
							imageSize={64}
							className="justify-center"
							imageClassName="rounded-xl"
							labelClassName="font-display text-2xl uppercase tracking-[0.06em] text-product-text"
						/>
						<h1 className="font-display text-4xl uppercase leading-none tracking-[0.08em] text-product-text">
							Create your account
						</h1>
						<p className="text-sm leading-relaxed text-product-muted">
							Create your account to open the workspace and start the sprint.
						</p>
					</div>
					<div className="mt-6">
						<SignUp
							appearance={{
								elements: {
									card: authViewConfig.clerkCardClassName,
									headerTitle: "hidden",
									headerSubtitle: "hidden",
								},
							}}
							path={routeConfig.signUp}
							signInUrl={routeConfig.signIn}
							fallbackRedirectUrl={authViewConfig.fallbackRedirectUrl}
						/>
					</div>
				</PublicSurfaceCard>
			</div>
		</PublicPageFrame>
	);
}
