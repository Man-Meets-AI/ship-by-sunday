import { toast } from "sonner";

export async function copySkillsText(label: string, text: string) {
	try {
		await navigator.clipboard.writeText(text);
		toast.success(label);
	} catch {
		toast.error("Could not copy — try selecting the text manually");
	}
}
