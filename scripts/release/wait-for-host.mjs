import process from "node:process";

function parseArgs(argv) {
	const options = {};

	for (const argument of argv) {
		if (!argument.startsWith("--")) {
			continue;
		}

		const [key, value = ""] = argument.slice(2).split("=");
		if (key === "path") {
			options.path = [...(options.path ?? []), value];
			continue;
		}

		options[key] = value;
	}

	return options;
}

function sleep(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchPath(url) {
	const response = await fetch(url, {
		redirect: "follow",
		headers: {
			"user-agent": "ship-by-sunday-release-proof",
		},
	});

	return {
		status: response.status,
		url: response.url,
	};
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	const baseUrl = options.url?.trim();

	if (!baseUrl) {
		throw new Error("wait-for-host requires --url=<absolute-url>.");
	}

	const targetPaths = (options.path?.length ? options.path : ["/"]).map((pathValue) =>
		pathValue.startsWith("/") ? pathValue : `/${pathValue}`,
	);
	const timeoutMilliseconds = Number.parseInt(options.timeout_ms || "300000", 10);
	const intervalMilliseconds = Number.parseInt(options.interval_ms || "5000", 10);
	const deadline = Date.now() + timeoutMilliseconds;
	let lastError = "No attempts were made.";

	while (Date.now() < deadline) {
		try {
			const results = [];
			let hasFailure = false;

			for (const targetPath of targetPaths) {
				const requestUrl = new URL(targetPath, baseUrl);
				const result = await fetchPath(requestUrl);
				results.push({ path: targetPath, ...result });
				if (result.status >= 400) {
					hasFailure = true;
				}
			}

			if (!hasFailure) {
				process.stdout.write(
					`${JSON.stringify({ ready: true, baseUrl, results }, null, 2)}\n`,
				);
				process.exit(0);
			}

			lastError = JSON.stringify({ ready: false, baseUrl, results });
		} catch (error) {
			lastError =
				error instanceof Error ? error.message : "Unknown error while polling host.";
		}

		await sleep(intervalMilliseconds);
	}

	throw new Error(
		`Timed out waiting for ${baseUrl} after ${timeoutMilliseconds}ms. Last observation: ${lastError}`,
	);
}

await main();
