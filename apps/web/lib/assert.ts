type AssertionCondition = boolean | number | string | object | null | undefined;

export function assert(
	condition: AssertionCondition,
	message: string,
): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}

export function assertNever(value: never, message: string): never {
	throw new Error(`${message}: ${String(value)}`);
}
