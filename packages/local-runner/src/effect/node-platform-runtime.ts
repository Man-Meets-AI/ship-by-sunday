import * as NodeContext from "@effect/platform-node/NodeContext";
import type { Effect } from "effect";
import { ManagedRuntime } from "effect";

export type LocalRunnerNodePlatform = NodeContext.NodeContext;

export const localRunnerNodePlatformLayer = NodeContext.layer;

export function makeLocalRunnerNodePlatformRuntime() {
	return ManagedRuntime.make(localRunnerNodePlatformLayer);
}

export async function runLocalRunnerNodePlatformEffect<A, E>(
	effect: Effect.Effect<A, E, LocalRunnerNodePlatform>,
) {
	const runtime = makeLocalRunnerNodePlatformRuntime();
	try {
		return await runtime.runPromise(effect);
	} finally {
		await runtime.dispose();
	}
}
