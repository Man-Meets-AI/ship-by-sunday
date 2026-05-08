import type { HomePageRenderModel } from "@/app/_lib/home-page-render-model";
import { SupportWidget } from "@/app/_components/support/support-widget";

export function HomePageSupportWidget({
	supportWidget,
}: {
	readonly supportWidget: HomePageRenderModel["supportWidget"];
}) {
	return (
		<SupportWidget
			analyticsSurface="homepage"
			content={supportWidget.content}
			entrySurface="homepage_support_widget"
			fallbackHref={supportWidget.fallbackHref}
			launcherMotion="squishy"
		/>
	);
}
