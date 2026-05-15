export const billingManagementRoles = new Set(["owner", "admin"]);

export function canManageBillingRole(role: string) {
  return billingManagementRoles.has(role);
}
