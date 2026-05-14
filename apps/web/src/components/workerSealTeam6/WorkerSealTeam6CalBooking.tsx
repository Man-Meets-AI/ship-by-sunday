"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, CalendarCheck2, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";

type CalEmbedValue =
	| string
	| number
	| boolean
	| null
	| HTMLElement
	| CalEmbedValue[]
	| {
			[key: string]: CalEmbedValue | undefined;
	  };

type CalEmbedCall = CalEmbedValue[];

type CalEmbedNamespace = ((...args: CalEmbedCall) => void) & {
	q?: CalEmbedCall[];
};

type CalEmbedApi = ((...args: CalEmbedCall) => void) & {
	loaded?: boolean;
	ns?: Record<string, CalEmbedNamespace>;
	q?: CalEmbedCall[];
};

declare global {
	interface Window {
		Cal?: CalEmbedApi;
	}
}

export type WorkerSealTeam6CalBookingProps = {
	calLink: string | null;
	calOrigin: string;
	hostedBookingUrl: string | null;
	directSchedulingHref: string;
};

const calNamespace = "worker-seal-team-6";

export function WorkerSealTeam6CalBooking({
	calLink,
	calOrigin,
	hostedBookingUrl,
	directSchedulingHref,
}: WorkerSealTeam6CalBookingProps) {
	const embedElementRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!calLink || !embedElementRef.current) {
			return;
		}

		const cal = ensureCalEmbedLoader(calOrigin);
		cal("init", calNamespace, { origin: calOrigin });
		cal.ns?.[calNamespace]?.("inline", {
			elementOrSelector: embedElementRef.current,
			calLink,
			config: {
				layout: "month_view",
			},
		});
		cal.ns?.[calNamespace]?.("ui", {
			styles: {
				branding: {
					brandColor: "#111111",
				},
			},
		});
	}, [calLink, calOrigin]);

	if (!calLink) {
		return (
			<div className="grid content-start gap-4 rounded-md border border-border/70 bg-background p-5">
				<CalendarCheck2 className="size-5 text-muted-foreground" aria-hidden />
				<h3 className="font-semibold text-foreground">Direct scheduling</h3>
				<p className="text-sm leading-6 text-muted-foreground">
					Use the direct line for fit, timing, and payment while the public
					booking page is being opened for this offer.
				</p>
				<Button asChild>
					<a href={directSchedulingHref} target="_blank" rel="noreferrer">
						Start direct scheduling
						<ArrowRight data-icon="inline-end" aria-hidden />
					</a>
				</Button>
			</div>
		);
	}

	return (
		<div className="grid content-start gap-4">
			<div
				ref={embedElementRef}
				data-testid="worker-seal-team-6-cal-embed"
				className="min-h-[680px] w-full overflow-hidden rounded-md border border-border/70 bg-background"
				aria-label="Worker Seal Team 6 booking calendar"
			/>
			<div className="flex flex-col gap-3 sm:flex-row">
				{hostedBookingUrl ? (
					<Button asChild>
						<a href={hostedBookingUrl} target="_blank" rel="noreferrer">
							Open hosted booking page
							<ExternalLink data-icon="inline-end" aria-hidden />
						</a>
					</Button>
				) : null}
				<Button asChild variant="outline">
					<a href={directSchedulingHref} target="_blank" rel="noreferrer">
						Direct backup
						<ArrowRight data-icon="inline-end" aria-hidden />
					</a>
				</Button>
			</div>
		</div>
	);
}

function ensureCalEmbedLoader(calOrigin: string) {
	if (window.Cal) {
		return window.Cal;
	}

	const documentRef = window.document;
	const cal = ((...args: CalEmbedCall) => {
		if (!cal.loaded) {
			cal.ns = {};
			cal.q = cal.q ?? [];
			appendCalEmbedScript(documentRef, calOrigin);
			cal.loaded = true;
		}

		if (args[0] === "init" && typeof args[1] === "string") {
			const namespace = args[1];
			cal.ns = cal.ns ?? {};
			cal.ns[namespace] = cal.ns[namespace] ?? createCalNamespace();
			queueCalCall(cal.ns[namespace], args);
			queueCalCall(cal, ["initNamespace", namespace]);
			return;
		}

		queueCalCall(cal, args);
	}) as CalEmbedApi;

	window.Cal = cal;
	return cal;
}

function createCalNamespace() {
	const namespaceApi = ((...args: CalEmbedCall) => {
		queueCalCall(namespaceApi, args);
	}) as CalEmbedNamespace;
	namespaceApi.q = [];
	return namespaceApi;
}

function queueCalCall(
	api: CalEmbedApi | CalEmbedNamespace,
	args: CalEmbedCall,
) {
	api.q = api.q ?? [];
	api.q.push(args);
}

function appendCalEmbedScript(documentRef: Document, calOrigin: string) {
	if (documentRef.querySelector("[data-worker-seal-team-6-cal-embed-script]")) {
		return;
	}

	const script = documentRef.createElement("script");
	script.async = true;
	script.src = new URL("/embed/embed.js", calOrigin).toString();
	script.setAttribute("data-worker-seal-team-6-cal-embed-script", "true");
	script.dataset.calEmbedOrigin = calOrigin;
	documentRef.head.appendChild(script);
}
