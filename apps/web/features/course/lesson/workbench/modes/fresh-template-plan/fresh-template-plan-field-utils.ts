export function readString(value: unknown): string {
	return typeof value === "string" ? value : "";
}

export function readBool(value: unknown): boolean {
	return value === true;
}
