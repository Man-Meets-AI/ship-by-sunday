import { Effect } from "effect";

export function runLocalRunnerEffect<A, E>(effect: Effect.Effect<A, E, never>) {
	return Effect.runPromise(effect);
}
