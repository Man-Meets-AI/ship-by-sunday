type StartThemeTransitionInput = {
	apply: () => void;
	allowAnimation: boolean;
};

type DocumentWithViewTransition = Document & {
	startViewTransition?: (callback: () => void) => void;
};

export function startThemeTransition({
	apply,
	allowAnimation,
}: StartThemeTransitionInput) {
	if (typeof document === "undefined" || !allowAnimation) {
		apply();
		return;
	}

	const candidate = document as DocumentWithViewTransition;
	if (typeof candidate.startViewTransition !== "function") {
		apply();
		return;
	}

	candidate.startViewTransition(apply);
}
