export const EXEC_PLAN_ROOT_DIR = "docs/exec-plans";
export const EXEC_PLAN_CONTRACT_PATH = `${EXEC_PLAN_ROOT_DIR}/PLANS.md`;
export const EXEC_PLAN_ACTIVE_DIR = `${EXEC_PLAN_ROOT_DIR}/active`;
export const EXEC_PLAN_COMPLETED_DIR = `${EXEC_PLAN_ROOT_DIR}/completed`;

export function isCanonicalExecPlanPath(planPath: string): boolean {
	return (
		planPath.endsWith(".md") &&
		(planPath.startsWith(`${EXEC_PLAN_ACTIVE_DIR}/`) ||
			planPath.startsWith(`${EXEC_PLAN_COMPLETED_DIR}/`))
	);
}

export function buildExecPlanMaintenanceSentence(): string {
	return `This ExecPlan must be maintained in accordance with \`${EXEC_PLAN_CONTRACT_PATH}\`.`;
}
