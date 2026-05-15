export const productSurfaceCapabilities = [
	"generate_codebase",
	"tutorials",
	"worker",
] as const;

export type ProductSurfaceCapability =
	(typeof productSurfaceCapabilities)[number];

const productSurfaceCapabilitySet = new Set<string>(productSurfaceCapabilities);

export function isProductSurfaceCapability(
	value: string,
): value is ProductSurfaceCapability {
	return productSurfaceCapabilitySet.has(value);
}

export function resolveProductSurfaceCapabilities(
	capabilities: readonly string[] | null | undefined,
): ProductSurfaceCapability[] {
	if (!capabilities) {
		return [];
	}

	return productSurfaceCapabilities.filter((capability) =>
		capabilities.includes(capability),
	);
}

export function hasProductSurfaceCapability(
	access: {
		hasAccess: boolean;
		capabilities?: readonly string[];
	},
	capability: ProductSurfaceCapability,
): boolean {
	return (
		access.hasAccess &&
		resolveProductSurfaceCapabilities(access.capabilities).includes(capability)
	);
}
