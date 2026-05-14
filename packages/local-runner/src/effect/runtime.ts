import { Cause, Effect, Exit } from "effect";

export async function runLocalRunnerEffect<A, E>(
	effect: Effect.Effect<A, E, never>,
) {
	const exit = await Effect.runPromiseExit(effect);
	if (Exit.isSuccess(exit)) {
		return exit.value;
	}

	throw Cause.squash(exit.cause);
}
