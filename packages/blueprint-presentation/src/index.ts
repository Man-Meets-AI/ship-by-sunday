import {
  blueprintFieldPromptKind,
  type CanonicalProjectFactsDraft,
  type CanonicalProjectFactKey,
  type BlueprintStageId,
} from "@shipbysunday/blueprint-compiler";

export type BlueprintFieldScaleOption = {
  value: string;
  label: string;
  ariaLabel: string;
};

export type BlueprintFieldScaleDefinition = {
  leftLabel?: string;
  centerLabel?: string;
  rightLabel?: string;
  options: readonly BlueprintFieldScaleOption[];
};

export type BlueprintFieldInputKind = "input" | "number" | "textarea";

type BlueprintFieldPresentationCopy =
  | string
  | ((facts: CanonicalProjectFactsDraft) => string);

type BlueprintFieldPresentation = {
  label: BlueprintFieldPresentationCopy;
  helperText?: BlueprintFieldPresentationCopy;
  placeholder?: BlueprintFieldPresentationCopy;
};

const problemSeverityScaleValues = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
] as const;

const problemUrgencyValues = [
  "Can schedule",
  "Needs attention soon",
  "Needs action now",
] as const;

const blueprintFieldScaleDefinitions: Partial<
  Record<CanonicalProjectFactKey, BlueprintFieldScaleDefinition>
> = {
  problem_severity: {
    leftLabel: "Minor annoyance",
    centerLabel: "Real friction",
    rightLabel: "Critical blocker",
    options: problemSeverityScaleValues.map((value) => ({
      value,
      label: value,
      ariaLabel: `Pain ${value} out of 10`,
    })),
  },
  problem_urgency: {
    leftLabel: "Can wait",
    centerLabel: "Needs planning",
    rightLabel: "Immediate",
    options: [
      {
        value: problemUrgencyValues[0],
        label: "Can schedule",
        ariaLabel: "Urgency can schedule",
      },
      {
        value: problemUrgencyValues[1],
        label: "Needs attention soon",
        ariaLabel: "Urgency needs attention soon",
      },
      {
        value: problemUrgencyValues[2],
        label: "Needs action now",
        ariaLabel: "Urgency needs action now",
      },
    ],
  },
  pricing_model: {
    options: [
      {
        value: "one_time",
        label: "One-time",
        ariaLabel: "One-time purchase",
      },
      {
        value: "monthly",
        label: "Monthly",
        ariaLabel: "Monthly subscription",
      },
      {
        value: "yearly",
        label: "Yearly",
        ariaLabel: "Yearly subscription",
      },
    ],
  },
};

const blueprintFieldPresentations: Partial<
  Record<CanonicalProjectFactKey, BlueprintFieldPresentation>
> = {
  product_name: {
    label: "What's the name?",
    helperText: "Enter the public-facing product name.",
    placeholder: "Ship by Sunday",
  },
  product_summary: {
    label: "What's the one-liner?",
    helperText: "Describe the offer in one clear sentence.",
    placeholder: "Go from idea to a shippable product in one weekend.",
  },
  primary_user: {
    label: "Who wants this? Who benefits from this?",
    helperText: "Identify the person who most wants the outcome.",
    placeholder: "Solo founders who want to launch fast",
  },
  problem_statement: {
    label: (facts) =>
      facts.product_name?.trim()
        ? `What does ${facts.product_name.trim()} solve?`
        : "What does this solve?",
    helperText: "Describe the problem in plain, specific language.",
    placeholder:
      "Founders spend weeks planning instead of shipping. They cycle through tools, templates, and tutorials but never launch.",
  },
  problem_trigger: {
    label: "When does this problem hit?",
    helperText:
      "Describe the moment the pain shows up. Include what they are trying to do, where they are, and what causes the friction.",
    placeholder:
      "When they sit down to build but get stuck choosing a stack, writing copy, and wiring payments.",
  },
  problem_severity: {
    label: "How painful is this problem?",
  },
  pricing_model: {
    label: "How will customers pay?",
  },
  success_looks_like: {
    label: "What does success look like?",
    placeholder:
      "A founder goes from idea to a live, paying product in one weekend — landing page, checkout, and deploy pipeline ready.",
  },
  core_flow: {
    label: "What happens, step by step?",
    helperText:
      "One step per line in the order the user moves through the flow.",
  },
  scope_in: {
    label: "What absolutely has to get built?",
    helperText:
      "Optional. Leave blank to use the generated default from your core flow.",
  },
  scope_out: {
    label: "What can we cut if we had to?",
    helperText:
      "Optional. Leave blank to use the generated default from your core flow.",
  },
  design_references: {
    label: "What should this feel like?",
    helperText: "Add links only, one per line.",
  },
  theme_preset: {
    label: "Choose a theme",
    helperText:
      "Pick a color and style. The preset code feeds directly into your generated repo.",
  },
  pricing: {
    label: (facts) => {
      const model = facts.pricing_model?.trim();
      if (model === "monthly") return "What's the monthly price in USD?";
      if (model === "yearly") return "What's the yearly price in USD?";
      return "What's the one-time price in USD?";
    },
    helperText: "Enter just the numeric dollar amount, like 29 or 99.",
    placeholder: "500",
  },
  domain: {
    label: "What domain should this live on?",
    placeholder: "shipbysunday.com",
  },
  contact_email: {
    label: "What email should people use if they need help?",
    helperText:
      "Optional. On web this starts with your signed-in email, and you can change it.",
    placeholder: "hello@shipbysunday.com",
  },
};

const blueprintListFieldPlaceholders: Partial<
  Record<CanonicalProjectFactKey, readonly string[]>
> = {
  core_flow: [
    "Fill out the blueprint",
    "Review generated artifacts",
    "Download the starter repo",
    "Customize and deploy",
    "Start collecting payments",
  ],
  scope_in: [
    "Blueprint intake form",
    "AI-generated starter repo",
    "Stripe checkout",
    "Vercel deploy pipeline",
  ],
  scope_out: ["Custom backend logic", "Mobile apps", "Multi-language support"],
  design_references: ["https://vercel.com", "https://linear.app"],
};

export function blueprintListFieldItemPlaceholders(
  fieldKey: CanonicalProjectFactKey,
): readonly string[] {
  return blueprintListFieldPlaceholders[fieldKey] ?? [];
}

const blueprintStepLabelOverrides: Partial<
  Record<`${BlueprintStageId}/${string}`, string>
> = {
  "blueprint/outcome": "What success looks like",
  "blueprint/setup": "Optional setup details",
};

function resolveBlueprintPresentationCopy(
  value: BlueprintFieldPresentationCopy | undefined,
  facts: CanonicalProjectFactsDraft,
) {
  if (!value) {
    return null;
  }
  return typeof value === "function" ? value(facts) : value;
}

export function getBlueprintFieldScaleDefinition(
  fieldKey: CanonicalProjectFactKey,
) {
  return blueprintFieldScaleDefinitions[fieldKey] ?? null;
}

export function getBlueprintStepLabel(
  stageId: BlueprintStageId,
  stepId: string,
) {
  return blueprintStepLabelOverrides[`${stageId}/${stepId}`] ?? null;
}

export function blueprintFieldLabel(
  fieldKey: CanonicalProjectFactKey | string,
  facts: CanonicalProjectFactsDraft = {},
) {
  if (fieldKey in blueprintFieldPresentations) {
    const presentation =
      blueprintFieldPresentations[fieldKey as CanonicalProjectFactKey];
    const label = resolveBlueprintPresentationCopy(presentation?.label, facts);
    if (label) {
      return label;
    }
  }

  return fieldKey
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function blueprintFieldHelperText(
  fieldKey: CanonicalProjectFactKey,
  facts: CanonicalProjectFactsDraft = {},
) {
  const presentation = blueprintFieldPresentations[fieldKey];
  return resolveBlueprintPresentationCopy(presentation?.helperText, facts);
}

export function blueprintFieldPlaceholder(
  fieldKey: CanonicalProjectFactKey,
  facts: CanonicalProjectFactsDraft = {},
) {
  const presentation = blueprintFieldPresentations[fieldKey];
  return resolveBlueprintPresentationCopy(presentation?.placeholder, facts);
}

export function blueprintFieldInputKind(
  fieldKey: CanonicalProjectFactKey,
): BlueprintFieldInputKind {
  const promptKind = blueprintFieldPromptKind(fieldKey);

  if (promptKind === "number") {
    return "number";
  }
  if (promptKind === "list" || promptKind === "long_text") {
    return "textarea";
  }
  return "input";
}
