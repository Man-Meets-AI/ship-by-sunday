import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export type ReadlineStageAnswer =
	| { kind: "answer"; value: string }
	| { kind: "cancelled" }
	| { kind: "closed" };

function isAbortError(error: unknown) {
	return (
		error instanceof Error &&
		(error.name === "AbortError" ||
			("code" in error &&
				typeof error.code === "string" &&
				error.code === "ABORT_ERR"))
	);
}

export function createReadlineStageSession() {
	const rl = createInterface({ input, output });

	async function ask(question: string): Promise<ReadlineStageAnswer> {
		let settled = false;
		let interruptedBySignal = false;

		return await new Promise<ReadlineStageAnswer>((resolve) => {
			const finish = (answer: ReadlineStageAnswer) => {
				if (settled) {
					return;
				}
				settled = true;
				process.removeListener("SIGINT", handleSigint);
				resolve(answer);
			};

			const handleSigint = () => {
				interruptedBySignal = true;
				rl.close();
				finish({ kind: "cancelled" });
			};

			process.once("SIGINT", handleSigint);

			rl.question(question).then(
				(answer) => {
					finish({ kind: "answer", value: answer });
				},
				(error) => {
					if (interruptedBySignal) {
						finish({ kind: "cancelled" });
						return;
					}

					if (isAbortError(error)) {
						finish({ kind: "closed" });
						return;
					}

					finish({ kind: "closed" });
				},
			);
		});
	}

	function close() {
		rl.close();
	}

	return {
		ask,
		close,
	};
}
