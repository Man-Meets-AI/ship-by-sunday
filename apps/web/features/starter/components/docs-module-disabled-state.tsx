import { routeConfig } from "@/config/product";
import { StarterModuleDisabledCard } from "@/features/starter/components/starter-module-disabled-card";

export function DocsModuleDisabledState() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
			<StarterModuleDisabledCard
				eyebrow="Docs module"
				title="Docs disabled"
				description="This starter instance has the public docs module turned off. Re-enable it in starter config if you want docs routes and public docs navigation back."
				actions={[
					{
						href: routeConfig.home,
						label: "Go home",
					},
				]}
			/>
		</main>
	);
}
