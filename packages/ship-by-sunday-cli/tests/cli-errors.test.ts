import { normalizeCliError } from "../src/cli-errors";

describe("cli errors", () => {
	it("maps AbortError to a cancelled cli error", () => {
		const error = new Error("The operation was aborted.");
		error.name = "AbortError";

		expect(normalizeCliError(error)).toMatchObject({
			code: "cancelled",
			exitCode: 130,
			message: "Cancelled. Previous answers remain saved.",
		});
	});
});
