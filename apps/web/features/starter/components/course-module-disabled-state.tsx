import { routeConfig } from "@/config/product";
import { AppShell } from "@/features/course/shared/components/app-shell";
import { StarterModuleDisabledCard } from "@/features/starter/components/starter-module-disabled-card";
import { workspaceDisplayConfig } from "@/features/starter/lib/starter-selectors";

export function CourseModuleDisabledState() {
	return (
		<AppShell
			viewportMode="app"
			showSkillRail={false}
			enableMissionQuery={false}
		>
			<div className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-4 py-10">
				<StarterModuleDisabledCard
					eyebrow="Course module"
					title="Guided course disabled"
					description={`This starter keeps the ${workspaceDisplayConfig.homeNoun} shell available, but the guided course module is turned off. Re-enable the course module in starter config if you want roadmap, lessons, and saved work surfaces back.`}
					actions={[
						{
							href: routeConfig.settings,
							label: "Open settings",
						},
						{
							href: routeConfig.home,
							label: "Go home",
							variant: "outline",
						},
					]}
				/>
			</div>
		</AppShell>
	);
}
