export type JsonPrimitive = string | number | boolean | null;

export type JsonObject = {
	[key: string]: JsonValue | undefined;
};

export type MutableJsonObject = JsonObject;

export type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[];
