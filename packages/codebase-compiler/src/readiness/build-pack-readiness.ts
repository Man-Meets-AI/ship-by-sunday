import type { CanonicalProjectFacts } from "../canonical-project-definition/project-definition";
import {
	hasStarterRootPackageScript,
	type StarterRootPackageScriptName,
} from "../repo-generation/starter-root-package-json";

export type BuildPackFirstSliceConfidence =
	| "ready"
	| "needs_customer_input"
	| "blocked";

export type BuildPackValidationEntry =
	| {
			type: "runnable";
			sourceStep: string;
			scriptName: StarterRootPackageScriptName;
			command: string;
			evidence: string;
	  }
	| {
			type: "manual";
			sourceStep: string;
			proofInstructions: string;
			evidence: string;
	  }
	| {
			type: "blocked";
			sourceStep: string;
			reason: string;
			customerQuestion: string;
	  };

export type BuildPackCustomerInputItem = {
	fieldLabel: string;
	factKey: string;
	requiredAction: string;
	status: "missing" | "placeholder";
};

export type BuildPackWeakFactWarning = {
	factLabel: string;
	factKey: string;
	issue: string;
	requiredAction: string;
	severity: "warning" | "blocker";
};

export type BuildPackBlocker = {
	source: string;
	reason: string;
	requiredAction: string;
};

export type BuildPackStarterFileReference = {
	path: string;
	reason: string;
};

export type BuildPackFirstSlicePlan = {
	title: string;
	objective: string;
	userVisibleOutcome: string;
	flowFocus: string;
	capabilities: string[];
	scopeIn: string[];
	scopeOut: string[];
	acceptanceCriteria: string[];
	starterFiles: BuildPackStarterFileReference[];
	executionSteps: string[];
	proofRequirements: string[];
	stopBefore: string[];
};

export type BuildPackVerificationPersona = {
	name: string;
	lens: string;
	evidence: string;
};

export type BuildPackEvidenceRow = {
	item: string;
	evidenceSource: string;
	status: "not_started";
};

export type BuildPackReviewPack = {
	reviewPrompt: string;
	verificationPersonas: BuildPackVerificationPersona[];
	expectedDemoProof: string[];
	regressionChecks: string[];
	evidenceRows: BuildPackEvidenceRow[];
};

export type BuildPackReadinessManifest = {
	firstSlice: {
		title: string;
		confidence: BuildPackFirstSliceConfidence;
		confidenceLabel: string;
		rationale: string;
		plan: BuildPackFirstSlicePlan;
	};
	validationEntries: BuildPackValidationEntry[];
	reviewPack: BuildPackReviewPack;
	customerInputItems: BuildPackCustomerInputItem[];
	weakFactWarnings: BuildPackWeakFactWarning[];
	blockers: BuildPackBlocker[];
	questionGates: string[];
	readinessLimits: string[];
};

type PlaceholderFactConfig = {
	factKey: "domain" | "contact_email" | "support_email";
	fieldLabel: string;
	requiredAction: string;
};

type ValidationScriptRule = {
	scriptName: StarterRootPackageScriptName;
	patterns: readonly RegExp[];
};

const placeholderFactConfigs = [
	{
		factKey: "domain",
		fieldLabel: "Domain",
		requiredAction:
			"Provide the real production domain before publishing production URLs, metadata, redirects, or launch claims.",
	},
	{
		factKey: "contact_email",
		fieldLabel: "Contact email",
		requiredAction:
			"Provide the real customer-facing contact email before publishing production support or legal copy.",
	},
	{
		factKey: "support_email",
		fieldLabel: "Support email",
		requiredAction:
			"Provide the real support email before claiming the repo is production-ready for customer support.",
	},
] as const satisfies readonly PlaceholderFactConfig[];

const validationScriptRules = [
	{
		scriptName: "codebase:contract",
		patterns: [/\bcodebase contract\b/i, /\bgenerated repo contract\b/i],
	},
	{
		scriptName: "agentic:check",
		patterns: [
			/\bagentic check\b/i,
			/\bgenerated operating pack\b/i,
			/\bprogram(?:s)? and execplan(?:s)?\b/i,
		],
	},
	{
		scriptName: "test:compiler",
		patterns: [/\bcompiler\b/i, /\bcodebase compiler\b/i],
	},
	{
		scriptName: "typecheck",
		patterns: [/\btypecheck\b/i, /\btype check\b/i],
	},
	{
		scriptName: "lint",
		patterns: [/\blint\b/i],
	},
	{
		scriptName: "format:check",
		patterns: [/\bformat\b/i],
	},
	{
		scriptName: "build",
		patterns: [/\bbuild\b/i],
	},
	{
		scriptName: "test:contracts",
		patterns: [/\bcontract\b/i],
	},
	{
		scriptName: "test:integration",
		patterns: [/\bintegration\b/i, /\bcodebase-flow\b/i],
	},
	{
		scriptName: "test:unit",
		patterns: [/\bunit\b/i],
	},
	{
		scriptName: "test:e2e:sandbox",
		patterns: [/\be2e\b/i, /\bsandbox\b/i],
	},
] as const satisfies readonly ValidationScriptRule[];

const placeholderPatterns = [
	/\bexample\.(?:com|org|net)\b/i,
	/\bplaceholder\b/i,
	/\bfixture\b/i,
	/\bsample\b/i,
	/\btbd\b/i,
	/\btodo\b/i,
	/\blorem\b/i,
	/\[.+\]/,
] as const;

const vagueTextPatterns = [
	/^m\d+$/i,
	/\bmake it work\b/i,
	/\bpolish\b/i,
	/\bimprove\b/i,
	/\bbetter\b/i,
	/\bgood\b/i,
	/\bstuff\b/i,
	/\bthings\b/i,
	/\betc\b/i,
] as const;

const starterFileReferences = [
	{
		path: "START-HERE.md",
		reason: "Buyer-facing setup order before product customization.",
	},
	{
		path: "DESIGN.md",
		reason: "Visual source of truth for any customer-facing UI change.",
	},
	{
		path: "docs/facts/project-definition.json",
		reason:
			"Machine-readable product facts that define the generated contract.",
	},
	{
		path: "docs/build/docs/readiness.md",
		reason:
			"Readiness verdict, typed validation, blockers, and customer-input work.",
	},
	{
		path: "docs/build/docs/plans.md",
		reason: "Active milestone plan and first-slice work breakdown.",
	},
	{
		path: "docs/build/docs/implement.md",
		reason: "Operating procedure for executing the first slice.",
	},
	{
		path: "docs/build/docs/review.md",
		reason:
			"Review prompt, verification lenses, regression checks, and evidence table.",
	},
	{
		path: "docs/testing/run-report.md",
		reason:
			"Repo-local verification report for command, browser, log, or artifact evidence.",
	},
	{
		path: "docs/build/docs/documentation.md",
		reason:
			"Live evidence log for assumptions, changed files, validation, and demo proof.",
	},
	{
		path: "apps/web/config/product.ts",
		reason:
			"Generated product identity, promise, pricing display, and CTA configuration.",
	},
	{
		path: "apps/web/app/_content/home-page.ts",
		reason: "Generated homepage copy and proof framing.",
	},
	{
		path: "apps/web/config/generated-design-system.ts",
		reason: "Machine-readable runtime design system.",
	},
] as const satisfies readonly BuildPackStarterFileReference[];

function trimmedText(value: string | undefined) {
	return value?.trim() ?? "";
}

function textList(values: readonly string[]) {
	return values.map((value) => value.trim()).filter((value) => value !== "");
}

function firstItems(values: readonly string[], count: number) {
	return textList(values).slice(0, count);
}

function wordCount(value: string) {
	return value.trim().split(/\s+/).filter(Boolean).length;
}

function isPlaceholderLike(value: string) {
	const normalizedValue = value.trim();
	if (normalizedValue === "") {
		return false;
	}

	return placeholderPatterns.some((pattern) => pattern.test(normalizedValue));
}

function isVagueText(value: string) {
	const normalizedValue = value.trim();
	if (normalizedValue === "") {
		return true;
	}

	return (
		wordCount(normalizedValue) <= 1 ||
		isPlaceholderLike(normalizedValue) ||
		vagueTextPatterns.some((pattern) => pattern.test(normalizedValue))
	);
}

function isBroadAcceptanceCriterion(value: string) {
	const normalizedValue = value.trim();
	if (normalizedValue.length < 20) {
		return true;
	}

	return isVagueText(normalizedValue);
}

function buildRunnableValidationEntry(
	sourceStep: string,
	scriptName: StarterRootPackageScriptName,
): BuildPackValidationEntry {
	if (!hasStarterRootPackageScript(scriptName)) {
		return {
			type: "blocked",
			sourceStep,
			reason: `The generated root package.json does not define the ${scriptName} script.`,
			customerQuestion:
				"Which generated package.json script should satisfy this validation step?",
		};
	}

	return {
		type: "runnable",
		sourceStep,
		scriptName,
		command: `bun run ${scriptName}`,
		evidence:
			"Paste the command result and pass/fail status into `docs/build/docs/documentation.md`.",
	};
}

function resolveValidationEntry(sourceStep: string): BuildPackValidationEntry {
	const matchingRule = validationScriptRules.find((rule) =>
		rule.patterns.some((pattern) => pattern.test(sourceStep)),
	);

	if (matchingRule) {
		return buildRunnableValidationEntry(sourceStep, matchingRule.scriptName);
	}

	if (/\b(manual|demo|browser|review|inspect)\b/i.test(sourceStep)) {
		return {
			type: "manual",
			sourceStep,
			proofInstructions:
				"Run the smallest observable demo or review path, then record the exact evidence and result.",
			evidence:
				"Manual proof notes in `docs/build/docs/documentation.md` with pass/fail/blocked status.",
		};
	}

	return {
		type: "blocked",
		sourceStep,
		reason:
			"This validation step does not map to a generated package.json script or manual proof type.",
		customerQuestion:
			"Which exact generated package.json script, browser path, or proof artifact should satisfy this validation step?",
	};
}

function buildCustomerInputItems(facts: CanonicalProjectFacts) {
	const customerInputItems: BuildPackCustomerInputItem[] = [];

	for (const config of placeholderFactConfigs) {
		const value = trimmedText(facts[config.factKey]);
		if (value === "") {
			customerInputItems.push({
				fieldLabel: config.fieldLabel,
				factKey: config.factKey,
				requiredAction: config.requiredAction,
				status: "missing",
			});
			continue;
		}

		if (isPlaceholderLike(value)) {
			customerInputItems.push({
				fieldLabel: config.fieldLabel,
				factKey: config.factKey,
				requiredAction: config.requiredAction,
				status: "placeholder",
			});
		}
	}

	return customerInputItems;
}

function buildWeakFactWarnings(
	facts: CanonicalProjectFacts,
): BuildPackWeakFactWarning[] {
	const warnings: BuildPackWeakFactWarning[] = [];
	const listFactConfigs = [
		{
			factKey: "design_references",
			factLabel: "Design references",
			values: facts.design_references,
			severity: "warning",
			requiredAction:
				"Replace fixture-like links with real product, brand, or interface references before relying on visual claims.",
		},
		{
			factKey: "proof_sources",
			factLabel: "Proof sources",
			values: facts.proof_sources,
			severity: "blocker",
			requiredAction:
				"Provide real customer, analytics, interview, demo, or repo evidence before production claims.",
		},
	] as const;
	const textFactConfigs = [
		{
			factKey: "selected_next_slice",
			factLabel: "Selected next slice",
			value: facts.selected_next_slice,
			requiredAction:
				"Rewrite the first slice as a concrete user-visible product change before handing implementation to an agent.",
		},
		{
			factKey: "done_when",
			factLabel: "Done when",
			value: facts.done_when,
			requiredAction:
				"Make the completion condition observable enough that a reviewer can verify it without chat history.",
		},
	] as const;
	const broadDeliverables = textList(facts.deliverables).filter(isVagueText);
	const broadAcceptanceCriteria = textList(facts.acceptance_criteria).filter(
		isBroadAcceptanceCriterion,
	);

	for (const config of listFactConfigs) {
		const values = textList(config.values);
		const placeholderValues = values.filter(isPlaceholderLike);
		if (values.length === 0) {
			warnings.push({
				factLabel: config.factLabel,
				factKey: config.factKey,
				issue: "No concrete values were provided.",
				requiredAction: config.requiredAction,
				severity: config.severity,
			});
			continue;
		}

		if (placeholderValues.length > 0) {
			warnings.push({
				factLabel: config.factLabel,
				factKey: config.factKey,
				issue: `Contains placeholder-like value: ${placeholderValues.join("; ")}`,
				requiredAction: config.requiredAction,
				severity: config.severity,
			});
		}
	}

	for (const config of textFactConfigs) {
		const value = trimmedText(config.value);
		if (isVagueText(value) || value.length < 12) {
			warnings.push({
				factLabel: config.factLabel,
				factKey: config.factKey,
				issue:
					"Value is missing, placeholder-like, or too vague for reliable autonomous execution.",
				requiredAction: config.requiredAction,
				severity: "blocker",
			});
		}
	}

	if (broadDeliverables.length > 0) {
		warnings.push({
			factLabel: "Deliverables",
			factKey: "deliverables",
			issue: `Contains vague deliverable: ${broadDeliverables.join("; ")}`,
			requiredAction:
				"Name deliverables as concrete product, docs, test, or repo artifacts before claiming the first slice is executable.",
			severity: "blocker",
		});
	}

	if (broadAcceptanceCriteria.length > 0) {
		warnings.push({
			factLabel: "Acceptance criteria",
			factKey: "acceptance_criteria",
			issue: `Contains broad acceptance criterion: ${broadAcceptanceCriteria.join("; ")}`,
			requiredAction:
				"Rewrite broad acceptance criteria as observable behavior or artifact checks.",
			severity: "blocker",
		});
	}

	if (textList(facts.core_flow).length < 2) {
		warnings.push({
			factLabel: "Core flow",
			factKey: "core_flow",
			issue: "Core flow has fewer than two concrete steps.",
			requiredAction:
				"Name the first user action and the next observable product state before assigning implementation.",
			severity: "warning",
		});
	}

	if (textList(facts.must_have_capabilities).length < 2) {
		warnings.push({
			factLabel: "Must-have capabilities",
			factKey: "must_have_capabilities",
			issue: "Must-have capabilities have fewer than two concrete entries.",
			requiredAction:
				"Name the product capabilities the first slice must preserve or introduce.",
			severity: "warning",
		});
	}

	return warnings;
}

function buildFirstSlicePlan(
	facts: CanonicalProjectFacts,
	validationEntries: readonly BuildPackValidationEntry[],
): BuildPackFirstSlicePlan {
	const flowSteps = textList(facts.core_flow);
	const capabilities = firstItems(facts.must_have_capabilities, 4);
	const scopeIn = textList(facts.scope_in);
	const scopeOut = [...textList(facts.scope_out), ...textList(facts.non_goals)];
	const acceptanceCriteria = textList(facts.acceptance_criteria);
	const flowFocus = flowSteps[0] ?? facts.user_visible_outcome;
	const runnableCommands = validationEntries.flatMap((entry) =>
		entry.type === "runnable" ? [entry.command] : [],
	);

	return {
		title: facts.selected_next_slice,
		objective: facts.objective,
		userVisibleOutcome: facts.user_visible_outcome,
		flowFocus,
		capabilities,
		scopeIn,
		scopeOut,
		acceptanceCriteria,
		starterFiles: [...starterFileReferences],
		executionSteps: [
			`Start with the first customer-visible flow step: ${flowFocus}.`,
			`Preserve or introduce these must-have capabilities: ${capabilities.join("; ")}.`,
			`Keep the implementation inside scope_in: ${scopeIn.join("; ")}.`,
			`Do not cross these scope boundaries: ${scopeOut.join("; ")}.`,
			"Inspect the starter files listed in this plan before editing production code.",
			"Update `docs/build/docs/documentation.md` with assumptions, changed files, validation output, demo proof, and remaining blockers before handoff.",
		],
		proofRequirements: [
			...acceptanceCriteria.map(
				(criterion) => `Acceptance criterion: ${criterion}`,
			),
			...runnableCommands.map((command) => `Runnable validation: ${command}`),
			`Demo proof: ${facts.demo_flow}`,
			"Review proof: complete `docs/build/docs/review.md` evidence table and attach verification notes in `docs/testing/run-report.md`.",
		],
		stopBefore: [
			"Changing product promise, primary user, pricing, auth, billing, data model, legal/compliance posture, or production credentials.",
			"Treating placeholder domain or email values as production-ready facts.",
			"Adding a new surface, provider, workflow, or role outside scope_in.",
			"Claiming production readiness without typed validation and demo evidence.",
		],
	};
}

function buildReviewPack(
	facts: CanonicalProjectFacts,
	firstSlicePlan: BuildPackFirstSlicePlan,
	validationEntries: readonly BuildPackValidationEntry[],
): BuildPackReviewPack {
	const validationRows = validationEntries.map((entry) => ({
		item: `Validation: ${entry.sourceStep}`,
		evidenceSource:
			entry.type === "runnable"
				? entry.command
				: entry.type === "manual"
					? entry.proofInstructions
					: entry.customerQuestion,
		status: "not_started" as const,
	}));

	return {
		reviewPrompt: [
			`Review the first slice for ${facts.product_name}: ${firstSlicePlan.title}.`,
			"Start with `docs/build/docs/readiness.md`, then inspect the changed files and `docs/build/docs/documentation.md` evidence.",
			"Prioritize real bugs, regressions, missing tests, security issues, scope drift, placeholder facts promoted to production claims, and validation that was skipped or misreported.",
			"Do not spend review effort on style preferences unless they hide a real product, security, or validation risk.",
		].join(" "),
		verificationPersonas: [
			{
				name: facts.primary_user,
				lens: `Can the primary user reach the promised outcome: ${facts.user_visible_outcome}?`,
				evidence: facts.demo_flow,
			},
			{
				name: "Implementation reviewer",
				lens: "Does the diff stay inside the first-slice scope and preserve generated starter boundaries?",
				evidence:
					"`docs/build/docs/documentation.md` changed-files table plus readiness scope.",
			},
			{
				name: "Regression reviewer",
				lens: "Did protected Codebase setup, auth, billing, provider configuration, and unrelated routes remain untouched unless explicitly in scope?",
				evidence: "Diff review plus typed validation results.",
			},
		],
		expectedDemoProof: [
			facts.demo_flow,
			"Attach the corresponding command, browser, log, or artifact evidence to `docs/testing/run-report.md`.",
			"Record the exact command, browser path, screenshot description, or artifact that proves each acceptance criterion.",
			"Record blocked validation with the customer question or missing repo command instead of marking it skipped.",
		],
		regressionChecks: [
			`Scope in still holds: ${firstSlicePlan.scopeIn.join("; ")}`,
			`Scope out and non-goals remain excluded: ${firstSlicePlan.scopeOut.join("; ")}`,
			"Placeholder domain, contact email, support email, proof links, and fixture-like values were not promoted to production claims.",
			"Generated docs, package scripts, and implementation evidence agree on the same validation commands.",
			"Auth, billing, checkout, Convex runtime, provider setup, and unrelated app routes are unchanged unless the customer explicitly approved that scope.",
		],
		evidenceRows: [
			...facts.deliverables.map((deliverable) => ({
				item: `Deliverable: ${deliverable}`,
				evidenceSource: "Changed files plus demo or test proof",
				status: "not_started" as const,
			})),
			...facts.acceptance_criteria.map((criterion) => ({
				item: `Acceptance: ${criterion}`,
				evidenceSource: "Test, browser, or artifact proof",
				status: "not_started" as const,
			})),
			...validationRows,
			{
				item: `Demo flow: ${facts.demo_flow}`,
				evidenceSource: "Reviewer-observable demo notes",
				status: "not_started",
			},
		],
	};
}

function buildValidationBlockers(
	validationEntries: readonly BuildPackValidationEntry[],
) {
	return validationEntries.flatMap((entry) => {
		if (entry.type !== "blocked") {
			return [];
		}

		return [
			{
				source: `Validation step: ${entry.sourceStep}`,
				reason: entry.reason,
				requiredAction: entry.customerQuestion,
			} satisfies BuildPackBlocker,
		];
	});
}

function buildWeakFactBlockers(
	weakFactWarnings: readonly BuildPackWeakFactWarning[],
) {
	return weakFactWarnings.flatMap((warning) => {
		if (warning.severity !== "blocker") {
			return [];
		}

		return [
			{
				source: `Weak fact: ${warning.factLabel}`,
				reason: warning.issue,
				requiredAction: warning.requiredAction,
			} satisfies BuildPackBlocker,
		];
	});
}

function buildOpenQuestionBlockers(facts: CanonicalProjectFacts) {
	return textList(facts.open_questions).map((question) => ({
		source: "Open question",
		reason: question,
		requiredAction:
			"Resolve this customer question before changing product promise, scope, data model, provider behavior, credentials, or production claims.",
	}));
}

function buildFirstSliceConfidence(params: {
	blockerCount: number;
	customerInputCount: number;
	manualValidationCount: number;
	warningCount: number;
}): {
	confidence: BuildPackFirstSliceConfidence;
	confidenceLabel: string;
	rationale: string;
} {
	if (params.blockerCount > 0) {
		return {
			confidence: "blocked",
			confidenceLabel: "Blocked",
			rationale:
				"One or more validation steps, weak facts, or open customer questions must be resolved before a fresh agent can claim the first slice is ready.",
		};
	}

	if (
		params.customerInputCount > 0 ||
		params.manualValidationCount > 0 ||
		params.warningCount > 0
	) {
		return {
			confidence: "needs_customer_input",
			confidenceLabel: "Needs customer input",
			rationale:
				"The generated facts are enough to start scoped work, but customer-input items, manual proof, or weak facts must be resolved before production claims.",
		};
	}

	return {
		confidence: "ready",
		confidenceLabel: "Ready",
		rationale:
			"The first slice has scoped facts and only package-script-backed validation commands in the generated Build Pack.",
	};
}

export function buildBuildPackReadinessManifest(
	facts: CanonicalProjectFacts,
): BuildPackReadinessManifest {
	const validationEntries = textList(facts.validation_plan).map(
		resolveValidationEntry,
	);
	const firstSlicePlan = buildFirstSlicePlan(facts, validationEntries);
	const reviewPack = buildReviewPack(facts, firstSlicePlan, validationEntries);
	const customerInputItems = buildCustomerInputItems(facts);
	const weakFactWarnings = buildWeakFactWarnings(facts);
	const blockers = [
		...buildValidationBlockers(validationEntries),
		...buildWeakFactBlockers(weakFactWarnings),
		...buildOpenQuestionBlockers(facts),
	];
	const manualValidationCount = validationEntries.filter(
		(entry) => entry.type === "manual",
	).length;
	const confidence = buildFirstSliceConfidence({
		blockerCount: blockers.length,
		customerInputCount: customerInputItems.length,
		manualValidationCount,
		warningCount: weakFactWarnings.length,
	});

	return {
		firstSlice: {
			title: facts.selected_next_slice,
			...confidence,
			plan: firstSlicePlan,
		},
		validationEntries,
		reviewPack,
		customerInputItems,
		weakFactWarnings,
		blockers,
		questionGates: [
			"Ask before changing product promise, target user, pricing, auth, billing, data model, legal or compliance posture, production credentials, or placeholder facts.",
			"Ask before widening beyond the selected first slice or adding a surface that scope_out or non_goals excludes.",
			"Ask before treating placeholder-friendly domain or email values as production-ready facts.",
			"Ask before replacing blocked validation with a guessed command or marking manual proof as passed without reviewer-observable evidence.",
		],
		readinessLimits: [
			"Clean-room replay proof must pass before claiming generated-repo autonomy.",
			"Manual validation entries require reviewer-observable evidence before completion can be claimed.",
			"Blocked validation entries require a customer answer or repo-specific command before they become runnable proof.",
			"Production readiness still depends on the customer's real credentials, domain, support channels, deployment, and live product verification.",
		],
	};
}
