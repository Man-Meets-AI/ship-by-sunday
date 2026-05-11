"use client";

import { useEffect, useState } from "react";

import type { JsonObject, JsonValue } from "@/lib/json-value";

type SupportRealtimeCapabilityState =
	| {
			readonly status: "loading";
			readonly capabilityToken: null;
	  }
	| {
			readonly status: "ready";
			readonly capabilityToken: string;
			readonly expiresAt: number;
	  }
	| {
			readonly status: "unavailable";
			readonly capabilityToken: null;
	  };

const supportSessionEndpoint = "/api/support/session";

export function useSupportRealtimeCapability(): SupportRealtimeCapabilityState {
	const [capabilityState, setCapabilityState] =
		useState<SupportRealtimeCapabilityState>({
			status: "loading",
			capabilityToken: null,
		});

	useEffect(() => {
		let isCurrentRequest = true;

		async function loadCapability() {
			try {
				const response = await fetch(supportSessionEndpoint, {
					method: "GET",
					headers: {
						Accept: "application/json",
					},
					cache: "no-store",
				});
				const body = (await response.json().catch(() => null)) as JsonValue;
				const capability = readSupportRealtimeCapability(body);
				if (!isCurrentRequest) {
					return;
				}
				setCapabilityState(
					response.ok && capability
						? capability
						: { status: "unavailable", capabilityToken: null },
				);
			} catch {
				if (isCurrentRequest) {
					setCapabilityState({
						status: "unavailable",
						capabilityToken: null,
					});
				}
			}
		}

		void loadCapability();

		return () => {
			isCurrentRequest = false;
		};
	}, []);

	return capabilityState;
}

export function readSupportRealtimeCapability(
	value: JsonValue,
): SupportRealtimeCapabilityState | null {
	if (!isJsonObject(value)) {
		return null;
	}

	const realtime = value.realtime;
	if (!isJsonObject(realtime)) {
		return null;
	}

	if (realtime.kind === "unavailable") {
		return { status: "unavailable", capabilityToken: null };
	}

	if (
		realtime.kind !== "convex" ||
		typeof realtime.capabilityToken !== "string" ||
		realtime.capabilityToken.length < 32 ||
		typeof realtime.expiresAt !== "number"
	) {
		return null;
	}

	return {
		status: "ready",
		capabilityToken: realtime.capabilityToken,
		expiresAt: realtime.expiresAt,
	};
}

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
