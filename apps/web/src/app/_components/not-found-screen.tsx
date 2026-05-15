"use client";

import Link from "next/link";

import {
	EdgeRouteActionRow,
	EdgeRouteContainer,
	EdgeRouteDescription,
	EdgeRouteEyebrow,
	EdgeRouteHeader,
	EdgeRoutePage,
	EdgeRoutePanel,
	EdgeRoutePanelBody,
	EdgeRoutePanelDescription,
	EdgeRoutePanelTitle,
	EdgeRouteTitle,
} from "@/components/layout/edge-route-surface";
import { Button } from "@/components/ui/button";
import { routeConfig } from "@/config/product";
import { workspaceDisplayConfig } from "@/config/starter-selectors";

export function NotFoundScreen() {
	return (
		<EdgeRoutePage className="flex items-center py-10">
			<EdgeRouteContainer className="max-w-3xl">
				<EdgeRoutePanel>
					<EdgeRoutePanelBody className="space-y-6 p-5 sm:p-6">
						<EdgeRouteHeader className="border-b-0 pb-0">
							<EdgeRouteEyebrow>Error 404 / Missing path</EdgeRouteEyebrow>
							<EdgeRouteTitle>Page not found</EdgeRouteTitle>
							<EdgeRouteDescription>
								The route you requested is not available. It may have moved, or
								the app may no longer publish that path.
							</EdgeRouteDescription>
						</EdgeRouteHeader>
						<div className="border-t border-border/60 pt-5">
							<EdgeRoutePanelTitle>Recovery options</EdgeRoutePanelTitle>
							<EdgeRoutePanelDescription className="mt-2">
								Open the product home if you were trying to continue app work,
								or return to the public site.
							</EdgeRoutePanelDescription>
						</div>
					</EdgeRoutePanelBody>
					<div className="border-t border-border/60 px-5 py-4 sm:px-6">
						<EdgeRouteActionRow>
							<Button
								asChild
								variant="secondary"
								className="min-w-[11rem] justify-center"
							>
								<Link href={routeConfig.appHome}>
									{workspaceDisplayConfig.openHomeActionLabel}
								</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								className="min-w-[11rem] justify-center"
							>
								<Link href={routeConfig.home}>Exit to safety</Link>
							</Button>
						</EdgeRouteActionRow>
					</div>
				</EdgeRoutePanel>
			</EdgeRouteContainer>
		</EdgeRoutePage>
	);
}
