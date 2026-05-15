"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

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
import { reportClientError } from "@/lib/observability/client-error-report";

export function ErrorBoundaryScreen({
	error,
	reset,
	title,
	description,
	code,
}: {
	error: Error & { digest?: string };
	reset: () => void;
	title: string;
	description: string;
	code: string;
}) {
	const pathname = usePathname();

	useEffect(() => {
		reportClientError({
			error,
			code,
			pathname,
			severity: code === "global_error_boundary" ? "critical" : "high",
			details: {
				digest: error.digest ?? null,
			},
		});
	}, [code, error, pathname]);

	return (
		<EdgeRoutePage className="flex items-center py-10">
			<EdgeRouteContainer className="max-w-3xl">
				<EdgeRoutePanel>
					<EdgeRoutePanelBody className="space-y-6 p-5 sm:p-6">
						<EdgeRouteHeader className="border-b-0 pb-0">
							<EdgeRouteEyebrow>
								{title} / {code.replace(/_/g, " ")}
							</EdgeRouteEyebrow>
							<EdgeRouteTitle>Something broke</EdgeRouteTitle>
							<EdgeRouteDescription>{description}</EdgeRouteDescription>
						</EdgeRouteHeader>
						<div className="border-t border-border/60 pt-5">
							<EdgeRoutePanelTitle>Telemetry captured</EdgeRoutePanelTitle>
							<EdgeRoutePanelDescription className="mt-2">
								We recorded the route context and digest for investigation.
							</EdgeRoutePanelDescription>
							<div className="mt-4 space-y-2 border-l border-border/60 pl-3 font-mono text-xs text-muted-foreground">
								<p>Path: {pathname ?? "unknown"}</p>
								<p>Digest: {error.digest ?? "none"}</p>
								<p>Trace: captured in telemetry</p>
							</div>
						</div>
					</EdgeRoutePanelBody>
					<div className="border-t border-border/60 px-5 py-4 sm:px-6">
						<EdgeRouteActionRow>
							<Button
								type="button"
								onClick={reset}
								variant="secondary"
								className="min-w-[10rem] justify-center"
							>
								Try again
							</Button>
							<Button
								asChild
								variant="outline"
								className="min-w-[10rem] justify-center"
							>
								<Link href={routeConfig.home}>Safe exit</Link>
							</Button>
						</EdgeRouteActionRow>
					</div>
				</EdgeRoutePanel>
			</EdgeRouteContainer>
		</EdgeRoutePage>
	);
}
