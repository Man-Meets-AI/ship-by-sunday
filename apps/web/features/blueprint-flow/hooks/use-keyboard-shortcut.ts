import { useEffect } from "react";

/**
 * Custom hook that listens for a keyboard shortcut and executes a callback.
 *
 * @param key The key to listen for (e.g., 'Enter', 'k', 's')
 * @param callback The function to execute when the shortcut is triggered
 * @param options Configuration for modifier keys (ctrl, meta, alt, shift)
 */
export function useKeyboardShortcut(
	key: string,
	callback: () => void,
	options: {
		ctrlOrMeta?: boolean;
		alt?: boolean;
		shift?: boolean;
		preventDefault?: boolean;
		disabled?: boolean;
	} = {},
) {
	const {
		ctrlOrMeta = false,
		alt = false,
		shift = false,
		preventDefault = true,
		disabled = false,
	} = options;

	useEffect(() => {
		if (disabled) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			// Check if the main key matches
			const keyMatch = event.key.toLowerCase() === key.toLowerCase();
			if (!keyMatch) return;

			// Check modifiers
			const ctrlOrMetaMatch = ctrlOrMeta
				? event.ctrlKey || event.metaKey
				: true;
			const altMatch = alt ? event.altKey : !event.altKey;
			const shiftMatch = shift ? event.shiftKey : !event.shiftKey;

			if (ctrlOrMetaMatch && altMatch && shiftMatch) {
				if (preventDefault) {
					event.preventDefault();
				}
				callback();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [key, callback, ctrlOrMeta, alt, shift, preventDefault, disabled]);
}
