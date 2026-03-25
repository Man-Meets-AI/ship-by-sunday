export function renderBulletList(values: readonly string[]) {
	return values.map((value) => `- ${value}`).join("\n");
}

export function renderSection(title: string, body: string) {
	return `## ${title}\n\n${body.trim()}`;
}

export function renderTemplateAppendix(templateContent: string) {
	return `## Base Template\n\n${templateContent.trim()}`;
}
