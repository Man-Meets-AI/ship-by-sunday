"use client";

import type { RefObject } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function listFocusable(section: HTMLElement): HTMLElement[] {
	const nodes = section.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
	return Array.from(nodes).filter(
		(el) =>
			!el.closest("[hidden]") && el.getAttribute("aria-hidden") !== "true",
	);
}

export function useLessonMapFocusTrap({
	sectionRef,
	headingRef,
	onDismiss,
	reducedMotion,
}: {
	sectionRef: RefObject<HTMLElement | null>;
	headingRef: RefObject<HTMLHeadingElement | null>;
	onDismiss?: () => void;
	reducedMotion: boolean;
}) {
	const previousFocusRef = useRef<Element | null>(null);

	useLayoutEffect(() => {
		previousFocusRef.current = document.activeElement;
		const section = sectionRef.current;
		const heading = headingRef.current;
		if (section && typeof section.scrollIntoView === "function") {
			section.scrollIntoView({
				block: "start",
				behavior: reducedMotion ? "auto" : "smooth",
			});
		}
		heading?.focus({ preventScroll: true });

		return () => {
			const previous = previousFocusRef.current;
			if (previous instanceof HTMLElement) {
				requestAnimationFrame(() => previous.focus());
			}
		};
	}, [reducedMotion, sectionRef, headingRef]);

	const handleDismiss = useCallback(() => {
		onDismiss?.();
	}, [onDismiss]);

	useEffect(() => {
		const section = sectionRef.current;
		if (!section) return undefined;

		const onKeyDown = (event: KeyboardEvent) => {
			const heading = headingRef.current;
			const active = document.activeElement as HTMLElement | null;
			const inside = (active && section.contains(active)) || active === heading;
			if (!inside) return;

			if (event.key === "Escape" && onDismiss) {
				event.preventDefault();
				event.stopPropagation();
				onDismiss();
				return;
			}

			if (event.key !== "Tab") return;

			const focusables = listFocusable(section);
			if (focusables.length === 0) return;

			if (event.shiftKey) {
				if (active === heading) {
					event.preventDefault();
					focusables[focusables.length - 1]?.focus();
					return;
				}
				const idx = active ? focusables.indexOf(active) : -1;
				if (idx === 0) {
					event.preventDefault();
					heading?.focus({ preventScroll: true });
				}
				return;
			}

			if (active === heading) {
				event.preventDefault();
				focusables[0]?.focus();
				return;
			}

			const idx = active ? focusables.indexOf(active) : -1;
			if (idx === focusables.length - 1) {
				event.preventDefault();
				focusables[0]?.focus();
			}
		};

		section.addEventListener("keydown", onKeyDown);
		return () => {
			section.removeEventListener("keydown", onKeyDown);
		};
	}, [onDismiss, sectionRef, headingRef]);

	return { handleDismiss };
}
