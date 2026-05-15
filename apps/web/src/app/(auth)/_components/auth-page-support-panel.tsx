import Link from "next/link";

import {
	edgeRoutePanelClassName,
	EdgeRoutePanelBody,
	EdgeRoutePanelDescription,
	EdgeRoutePanelHeader,
	EdgeRoutePanelTitle,
	EdgeRouteStatusItem,
	EdgeRouteStatusList,
} from "@/components/layout/edge-route-surface";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AuthPageSupportPanelAction = {
	href: string;
	label: string;
};

export type AuthPageSupportPanelContent = {
	action?: AuthPageSupportPanelAction;
	bullets: readonly string[];
	description: string;
	title: string;
};

export function AuthPageSupportPanel({
	content,
}: {
	content: AuthPageSupportPanelContent;
}) {
	return (
		<aside
			data-slot="edge-route-panel"
			className={cn(edgeRoutePanelClassName, "flex min-w-0 flex-col")}
		>
			<EdgeRoutePanelHeader>
				<EdgeRoutePanelTitle>{content.title}</EdgeRoutePanelTitle>
				<EdgeRoutePanelDescription>
					{content.description}
				</EdgeRoutePanelDescription>
			</EdgeRoutePanelHeader>
			{content.bullets.length > 0 ? (
				<EdgeRoutePanelBody>
					<EdgeRouteStatusList aria-label="Sign-in guidance">
						{content.bullets.map((bullet) => (
							<EdgeRouteStatusItem key={bullet}>
								<span
									aria-hidden
									className="mt-2 size-1.5 rounded-full bg-foreground/50"
								/>
								<span>{bullet}</span>
							</EdgeRouteStatusItem>
						))}
					</EdgeRouteStatusList>
				</EdgeRoutePanelBody>
			) : null}
			{content.action ? (
				<div className="mt-auto border-t border-border/60 px-4 py-3.5 sm:px-5">
					<Button asChild variant="outline" size="sm">
						<Link href={content.action.href}>{content.action.label}</Link>
					</Button>
				</div>
			) : null}
		</aside>
	);
}
