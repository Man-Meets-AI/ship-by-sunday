import { createCanonicalProjectDefinitionDraft } from "@manmeetsai/packet-compiler";
import { saveLocalDraft } from "../src/draft/draft-store";
import { runCli } from "../src/run-cli";
import { createCliIo, createTemporaryRepoRoot } from "./test-helpers";

describe("review command", () => {
	it("prints human-readable readiness details and stable json output", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		await saveLocalDraft(
			repoRootPath,
			createCanonicalProjectDefinitionDraft({
				clerkUserId: "local-cli-user",
				productKey: "ship-by-sunday",
				facts: {
					product_name: "Ship by Sunday OS",
				},
			}),
		);

		const humanIo = createCliIo();
		const humanExitCode = await runCli({
			argv: ["review"],
			io: humanIo.io,
			repoRootPath,
		});
		expect(humanExitCode).toBe(0);
		expect(humanIo.stdout.join("\n")).toContain(
			"First incomplete stage: product",
		);
		expect(humanIo.stdout.join("\n")).toContain("Missing:");

		const jsonIo = createCliIo();
		const jsonExitCode = await runCli({
			argv: ["review", "--json"],
			io: jsonIo.io,
			repoRootPath,
		});
		expect(jsonExitCode).toBe(0);
		expect(JSON.parse(jsonIo.stdout.join("\n"))).toMatchObject({
			firstIncompleteStageId: "product",
		});
	});
});
