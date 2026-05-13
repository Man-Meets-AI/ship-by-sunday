"use client";

import { useEffect, useState } from "react";

type BunnyVideoAvailability =
	| { kind: "checking" }
	| { kind: "ready" }
	| { kind: "unavailable" };

const bunnyVideoAvailabilityCache = new Map<string, BunnyVideoAvailability>();

export function useBunnyVideoAvailability(
	url: string | null,
	provider?: string,
): BunnyVideoAvailability {
	const [availability, setAvailability] = useState<BunnyVideoAvailability>(
		() => {
			if (!url || provider !== "bunny") {
				return { kind: "ready" };
			}

			return bunnyVideoAvailabilityCache.get(url) ?? { kind: "checking" };
		},
	);

	useEffect(() => {
		if (!url || provider !== "bunny") {
			setAvailability({ kind: "ready" });
			return;
		}

		const cachedAvailability = bunnyVideoAvailabilityCache.get(url);
		if (cachedAvailability) {
			setAvailability(cachedAvailability);
			return;
		}

		const controller = new AbortController();

		setAvailability({ kind: "checking" });

		void fetch(`/api/video/verify?url=${encodeURIComponent(url)}`, {
			cache: "no-store",
			signal: controller.signal,
		})
			.then(async (response) => {
				const payload = (await response.json().catch(() => null)) as {
					kind?: string;
				} | null;

				if (controller.signal.aborted) {
					return;
				}

				if (payload?.kind === "unavailable") {
					const unavailableState = { kind: "unavailable" } as const;
					bunnyVideoAvailabilityCache.set(url, unavailableState);
					setAvailability(unavailableState);
					return;
				}

				const readyState = { kind: "ready" } as const;
				bunnyVideoAvailabilityCache.set(url, readyState);
				setAvailability(readyState);
			})
			.catch(() => {
				if (controller.signal.aborted) {
					return;
				}

				const readyState = { kind: "ready" } as const;
				bunnyVideoAvailabilityCache.set(url, readyState);
				setAvailability(readyState);
			});

		return () => controller.abort();
	}, [provider, url]);

	return availability;
}
