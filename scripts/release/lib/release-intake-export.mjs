import {
	buildCanonicalNotes,
	buildCanonicalTitle,
	buildReleaseIntakeFeed,
	buildReleaseIntakeIdentity,
} from "./engineering-intake-contract.mjs";

function slugify(value) {
	return value
		.toLowerCase()
		.replaceAll(/[^a-z0-9]+/g, "_")
		replace(/^_+|_+$/g, "")
		.slice(0, 80);
}

function dedupeByUrl(items) {
	const seenUrls = new Set();
	const deduped = [];

	for (const item of items) {
		if (!item?.url || seenUrls.has(item.url)) {
			continue;
		}

		seenUrls.add(item.url);
		deduped.push(item);
	}

	return deduped;
}

function buildCheckRunMap(summary) {
	return new Map(
		Object.entries(summary.proof.latestCheckRunsByName ?? {}).map(([name, checkRun]) => [
			name,
			checkRun,
		]),
	);
}

function classifyReleaseBlocker(blocker) {
	const missingCheckMatch = blocker.match(/Missing required GitHub check run '([^']+)'/);
	if (missingCheckMatch?.[1]) {
		return {
			blockerKind: "github_check",
			blockerKey: missingCheckMatch[1],
		};
	}

	const checkMatch = blocker.match(/GitHub check run '([^']+)'/);
	if (checkMatch?.[1]) {
		return {
			blockerKind: "github_check",
			blockerKey: checkMatch[1],
		};
	}

	if (blocker.startsWith("No READY")) {
		return {
			blockerKind: "deployment",
			blockerKey: "vercel_ready_deployment",
		};
	}

	if (
		blocker.startsWith("Vercel deployment metadata unavailable") ||
		blocker.startsWith("GitHub release metadata unavailable")
	) {
		return {
			blockerKind: "metadata",
			blockerKey: slugify(blocker),
		};
	}

	return {
		blockerKind: "release_path",
		blockerKey: slugify(blocker),
	};
}

function buildBlockerEvidenceRefs({
	blocker,
	blockerInfo,
	checkRunsByName,
	summary,
}) {
	const evidenceRefs = [];

	const checkRun = checkRunsByName.get(blockerInfo.blockerKey);
	if (blockerInfo.blockerKind === "github_check" && checkRun) {
		if (checkRun.details_url) {
			evidenceRefs.push({
				kind: "github_check",
				label: `${blockerInfo.blockerKey} details`,
				url: checkRun.details_url,
			});
		} else if (checkRun.html_url) {
			evidenceRefs.push({
				kind: "github_check",
				label: `${blockerInfo.blockerKey} run`,
				url: checkRun.html_url,
			});
		}
	}

	if (summary.releasePullRequest?.url) {
		evidenceRefs.push({
			kind: "github_pr",
			label: `Release PR #${summary.releasePullRequest.number}`,
			url: summary.releasePullRequest.url,
		});
	}

	if (summary.proof.deployment?.url) {
		evidenceRefs.push({
			kind: "vercel_deployment",
			label: "Matched Vercel deployment",
			url: summary.proof.deployment.url,
		});
	}

	if (summary.proof.aliasDomain) {
		evidenceRefs.push({
			kind: "vercel_alias",
			label: "Expected staging alias",
			url: `https://${summary.proof.aliasDomain}`,
		});
	}

	evidenceRefs.push({
		kind: "runbook",
		label: "Release workflow runbook",
		url: "https://github.com/parkerrex/ship-by-sunday/blob/dev/docs/release-workflow.md",
	});

	return dedupeByUrl(evidenceRefs);
}

function buildSourceRecordRefs({
	blockerInfo,
	summary,
	checkRunsByName,
}) {
	const sourceRecordRefs = [
		{
			kind: "release_candidate",
			value: `${summary.candidate.ref}@${summary.candidate.sha}`,
			label: "Release candidate ref",
		},
	];

	if (summary.releasePullRequest?.number) {
		sourceRecordRefs.push({
			kind: "github_pr",
			value: String(summary.releasePullRequest.number),
			label: "dev -> main release PR",
		});
	}

	const checkRun = checkRunsByName.get(blockerInfo.blockerKey);
	if (blockerInfo.blockerKind === "github_check") {
		sourceRecordRefs.push({
			kind: "github_check",
			value: blockerInfo.blockerKey,
			label: "Blocking check run",
		});

		if (checkRun?.id) {
			sourceRecordRefs.push({
				kind: "github_check",
				value: `${blockerInfo.blockerKey}:${checkRun.id}`,
				label: "Blocking check run id",
			});
		}
	}

	if (summary.proof.deployment?.uid) {
		sourceRecordRefs.push({
			kind: "vercel_deployment",
			value: String(summary.proof.deployment.uid),
			label: "Matched Vercel deployment",
		});
	}

	return sourceRecordRefs;
}

function buildReleaseItem({
	blocker,
	checkRunsByName,
	generatedAt,
	summary,
}) {
	const blockerInfo = classifyReleaseBlocker(blocker);
	const { dedupeKey, externalId } = buildReleaseIntakeIdentity({
		blockerKey: blockerInfo.blockerKey,
		blockerKind: blockerInfo.blockerKind,
		candidateRef: summary.candidate.ref,
		candidateSha: summary.candidate.sha,
	});

	const canonicalTitle =
		blockerInfo.blockerKind === "github_check"
			? `${blockerInfo.blockerKey} is blocking the ${summary.candidate.ref} release candidate`
			: blocker;
	const canonicalNotes = buildCanonicalNotes(
		[
			`Release blocker kind: ${blockerInfo.blockerKind}.`,
			`Release path state: ${summary.releasePath.state}.`,
			summary.releaseScope.billingSensitive
				? "Billing-sensitive files are present in the release scope."
				: "No billing-sensitive files are present in the release scope.",
			"Lifecycle remains SBS-owned and changes only when release candidate, proof, or deployment facts change upstream.",
		].join(" "),
	);

	return {
		externalId,
		dedupeKey,
		severity: blockerInfo.blockerKind === "metadata" ? "critical" : "high",
		status:
			blockerInfo.blockerKind === "metadata" ? "blocked_metadata" : "active",
		blockerKind: blockerInfo.blockerKind,
		blockerKey: blockerInfo.blockerKey,
		summary: blocker,
		canonicalTitle: buildCanonicalTitle(canonicalTitle),
		canonicalNotes,
		rawTags: [
			slugify(summary.candidate.ref),
			"release",
			"release_candidate",
			blockerInfo.blockerKey,
		].filter(Boolean),
		capturedAt: generatedAt,
		candidate: {
			ref: summary.candidate.ref,
			sha: summary.candidate.sha,
			baseRef: summary.candidate.baseRef,
			baseSha: summary.candidate.baseSha ?? null,
		},
		releaseState: {
			pathState: summary.releasePath.state,
			snapshotRequired: summary.releasePath.snapshotRequired,
		},
		sourceContext: {
			sourceSystem: "ship_by_sunday",
			sourceLabel: "release/triage",
			sourceRecordRefs: buildSourceRecordRefs({
				blockerInfo,
				summary,
				checkRunsByName,
			}),
			projectTitle: "Ship by Sunday",
			areaTitle: "Release Control",
			locationLabel: "Release Control / Ship by Sunday",
		},
		evidenceRefs: buildBlockerEvidenceRefs({
			blocker,
			blockerInfo,
			checkRunsByName,
			summary,
		}),
	};
}

export function buildReleaseIntakeItems(summary, generatedAt = new Date().toISOString()) {
	const checkRunsByName = buildCheckRunMap(summary);

	return [...new Set(summary.readiness.blockers ?? [])].map((blocker) =>
		buildReleaseItem({
			blocker,
			checkRunsByName,
			generatedAt,
			summary,
		}),
	);
}

export function buildReleaseIntakeExport({
	generatedAt,
	summary,
}) {
	const checkRunsByName = buildCheckRunMap(summary);
	return buildReleaseIntakeFeed({
		generatedAt,
		items: buildReleaseIntakeItems(summary, generatedAt),
	});
}
