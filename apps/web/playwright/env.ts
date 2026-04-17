import * as z from "zod";

const playwrightEnvSchema = z.object({
	PLAYWRIGHT_CHECKOUT_SMOKE: z.enum(["0", "1"]).optional(),
	PLAYWRIGHT_SKIP_BUILD: z.enum(["0", "1"]).optional(),
});

const playwrightEnv = playwrightEnvSchema.parse(process.env);

export const shouldVerifyCheckoutRoute =
	playwrightEnv.PLAYWRIGHT_CHECKOUT_SMOKE === "1";

export const shouldSkipLocalBuild = playwrightEnv.PLAYWRIGHT_SKIP_BUILD === "1";
