export function stripPublicContentHeadingFormatting(value: string) {
	return value
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/[`*_~]/g, "")
		.replace(/<[^>]+>/g, "")
		.trim();
}

export function createPublicContentHeadingId(text: string) {
	return stripPublicContentHeadingFormatting(text)
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

export function createUniquePublicContentHeadingId({
	baseId,
	headingCountsById,
}: {
	baseId: string;
	headingCountsById: Map<string, number>;
}) {
	const count = headingCountsById.get(baseId) ?? 0;
	headingCountsById.set(baseId, count + 1);

	return count === 0 ? baseId : `${baseId}-${count + 1}`;
}
