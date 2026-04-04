import type { CanonicalProjectFactKey } from "../canonical-project-definition/project-definition";

export type BlueprintStageId = "blueprint" | "review";

export type BlueprintStepDefinition = {
  id: string;
  label: string;
  fieldKeys: readonly CanonicalProjectFactKey[];
  requiredFieldKeys?: readonly CanonicalProjectFactKey[];
};

export type BlueprintStageDefinition = {
  id: BlueprintStageId;
  label: string;
  description: string;
  route: `/${string}`;
  steps: readonly BlueprintStepDefinition[];
};

const blueprintStageSteps = [
  {
    id: "foundation",
    label: "Foundation",
    fieldKeys: ["product_name", "product_summary", "primary_user"],
  },
  {
    id: "problem",
    label: "Problem",
    fieldKeys: ["problem_statement", "problem_trigger", "problem_severity"],
  },
  {
    id: "outcome",
    label: "Outcome",
    fieldKeys: ["success_looks_like", "core_flow"],
  },
  {
    id: "design",
    label: "Design",
    fieldKeys: ["theme_preset", "design_references"],
    requiredFieldKeys: [],
  },
  {
    id: "pricing",
    label: "Pricing",
    fieldKeys: ["pricing_model", "pricing"],
    requiredFieldKeys: ["pricing_model", "pricing"],
  },
  {
    id: "setup",
    label: "Setup",
    fieldKeys: ["scope_in", "scope_out", "domain", "contact_email"],
    requiredFieldKeys: [],
  },
  {
    id: "generated-preview",
    label: "Generated preview",
    fieldKeys: [],
    requiredFieldKeys: [],
  },
] as const satisfies readonly BlueprintStepDefinition[];

export const blueprintStageDefinitions = [
  {
    id: "blueprint",
    label: "Blueprint",
    description:
      "Lock the full reduced blueprint on one page before review and download.",
    route: "/blueprint",
    steps: blueprintStageSteps,
  },
  {
    id: "review",
    label: "Review",
    description: "Review readiness and download the blueprints and repo.",
    route: "/review",
    steps: [],
  },
] as const satisfies readonly BlueprintStageDefinition[];

export const blueprintStageIds = blueprintStageDefinitions.map(
  (stage) => stage.id,
);

const blueprintStageDefinitionById = new Map(
  blueprintStageDefinitions.map((stage) => [stage.id, stage]),
);

export function getBlueprintStageDefinition(
  stageId: BlueprintStageId,
): BlueprintStageDefinition {
  const stage = blueprintStageDefinitionById.get(stageId);
  if (!stage) {
    throw new Error(`Unknown blueprint stage: ${stageId}`);
  }

  return stage;
}
