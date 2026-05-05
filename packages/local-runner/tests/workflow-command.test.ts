import { getWorkflowCommandExitCode } from "../src/commands/workflow";

describe("workflow command", () => {
	it("returns a failing exit code when proof fails", () => {
		expect(
			getWorkflowCommandExitCode({
				status: "proof_completed",
				proofStatus: "failed",
			}),
		).toBe(1);
	});

	it("returns success only for passed proof", () => {
		expect(
			getWorkflowCommandExitCode({
				status: "proof_completed",
				proofStatus: "passed",
			}),
		).toBe(0);
	});
});
