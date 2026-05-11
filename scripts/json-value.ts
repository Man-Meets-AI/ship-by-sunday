export type JsonPrimitive = string | number | boolean | null;

export type JsonObject = {
	readonly [key: string]: JsonValue | undefined;
};

export type MutableJsonObject = {
	[key: string]: JsonValue | undefined;
};

export type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[];
