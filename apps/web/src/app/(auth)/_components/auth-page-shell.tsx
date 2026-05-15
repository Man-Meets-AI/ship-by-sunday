import type { ReactNode } from "react";

import {
	EdgeRouteDescription,
	EdgeRouteEyebrow,
	EdgeRouteHeader,
	EdgeRoutePanel,
	EdgeRoutePanelBody,
	EdgeRouteTitle,
} from "@/components/layout/edge-route-surface";
import { cn } from "@/lib/utils";

import {
	AuthPageSupportPanel,
	type AuthPageSupportPanelContent,
} from "./auth-page-support-panel";

type AuthPageShellProps = {
	children: ReactNode;
	description?: ReactNode;
	supportPanel?: AuthPageSupportPanelContent;
	title: string;
};

export function AuthPageShell({
	children,
	description,
	supportPanel,
	title,
}: AuthPageShellProps) {
	return (
		<section
			className="relative w-full max-w-6xl"
			data-slot="identity-route-shell"
		>
			<div
				className={cn(
					"grid gap-5",
					supportPanel
						? "lg:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)] lg:items-start"
						: "mx-auto w-full max-w-xl grid-cols-1",
				)}
			>
				<EdgeRoutePanel>
					<EdgeRoutePanelBody className="flex min-w-0 flex-col gap-7 p-5 sm:p-6 lg:p-8">
						<EdgeRouteHeader className="border-b-0 pb-0">
							<EdgeRouteEyebrow>Account access</EdgeRouteEyebrow>
							<EdgeRouteTitle>{title}</EdgeRouteTitle>
							{description ? (
								<EdgeRouteDescription className="text-base leading-7">
									{description}
								</EdgeRouteDescription>
							) : null}
						</EdgeRouteHeader>
						<div className="max-w-xl">{children}</div>
					</EdgeRoutePanelBody>
				</EdgeRoutePanel>
				{supportPanel ? <AuthPageSupportPanel content={supportPanel} /> : null}
			</div>
		</section>
	);
}
