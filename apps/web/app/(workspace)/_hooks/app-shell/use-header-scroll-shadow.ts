"use client";

import { useEffect, useState } from "react";

const SCROLL_THRESHOLD = 4;

type UseHeaderScrollShadowInput = {
	mainId: string;
};

export function useHeaderScrollShadow({
	mainId,
}: UseHeaderScrollShadowInput): boolean {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const mainElement = document.getElementById(mainId);
		let rafId: number | null = null;

		const computeScrolled = () => {
			rafId = null;
			const windowTop = window.scrollY;
			const innerTop = mainElement?.scrollTop ?? 0;
			setScrolled(windowTop > SCROLL_THRESHOLD || innerTop > SCROLL_THRESHOLD);
		};

		const onScroll = () => {
			if (rafId !== null) {
				return;
			}
			rafId = window.requestAnimationFrame(computeScrolled);
		};

		computeScrolled();
		window.addEventListener("scroll", onScroll, { passive: true });
		mainElement?.addEventListener("scroll", onScroll, { passive: true });

		return () => {
			if (rafId !== null) {
				window.cancelAnimationFrame(rafId);
			}
			window.removeEventListener("scroll", onScroll);
			mainElement?.removeEventListener("scroll", onScroll);
		};
	}, [mainId]);

	return scrolled;
}
