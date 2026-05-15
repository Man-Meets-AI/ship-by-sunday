"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { JsonObject, JsonValue } from "@/lib/json-value";

export type SupportRealtimeCapabilityState =
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
const supportRealtimeCapabilityRefreshLeewayMs = 5 * 60 * 1_000;
const unavailableSupportRealtimeCapability = {
	status: "unavailable",
	capabilityToken: null,
} satisfies SupportRealtimeCapabilityState;

export function useSupportRealtimeCapability(): {
	readonly capabilityState: SupportRealtimeCapabilityState;
	readonly requestCapability: () => void;
} {
	const [capabilityState, setCapabilityState] =
		useState<SupportRealtimeCapabilityState>(
			unavailableSupportRealtimeCapability,
		);
	const capabilityStateRef = useRef(capabilityState);
	const currentRequestIdRef = useRef(0);

	useEffect(() => {
		capabilityStateRef.current = capabilityState;
	}, [capabilityState]);

	useEffect(
		() => () => {
			currentRequestIdRef.current += 1;
		},
		[],
	);

	const requestCapability = useCallback(() => {
		const currentCapabilityState = capabilityStateRef.current;
		if (
			currentCapabilityState.status === "ready" &&
			currentCapabilityState.expiresAt >
				Date.now() + supportRealtimeCapabilityRefreshLeewayMs
		) {
			return;
		}

		const requestId = currentRequestIdRef.current + 1;
		currentRequestIdRef.current = requestId;
		setCapabilityState({
			status: "loading",
			capabilityToken: null,
		});

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
				if (currentRequestIdRef.current !== requestId) {
					return;
				}
				setCapabilityState(
					response.ok && capability
						? capability
						: unavailableSupportRealtimeCapability,
				);
			} catch {
				if (currentRequestIdRef.current === requestId) {
					setCapabilityState(unavailableSupportRealtimeCapability);
				}
			}
		}

		void loadCapability();
	}, []);

	return { capabilityState, requestCapability };
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
