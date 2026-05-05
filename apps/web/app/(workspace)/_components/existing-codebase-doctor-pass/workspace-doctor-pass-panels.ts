export const doctorPassDetailsPanelId = "workspace-doctor-pass-details";
export const doctorPassPreviewPanelId = "workspace-doctor-pass-preview";

export function focusDoctorPassPanel(panelId: string) {
	const panel = document.getElementById(panelId);
	if (!panel) {
		return;
	}

	panel.scrollIntoView({ behavior: "smooth", block: "start" });
	panel.focus({ preventScroll: true });
}
