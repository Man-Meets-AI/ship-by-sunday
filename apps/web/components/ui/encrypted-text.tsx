"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";

type EncryptedTextProps = {
	text: string;
	className?: string;
	revealDelayMs?: number;
	charset?: string;
	flipDelayMs?: number;
	encryptedClassName?: string;
	revealedClassName?: string;
};

const DEFAULT_CHARSET =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?";

function generateRandomCharacter(charset: string): string {
	const index = Math.floor(Math.random() * charset.length);
	return charset.charAt(index);
}

function generateDeterministicCharacter(
	original: string,
	position: number,
	charset: string,
): string {
	const characterCode = original.charCodeAt(position) || 0;
	const charsetIndex =
		(characterCode + original.length * 31 + position * 17) % charset.length;
	return charset.charAt(charsetIndex);
}

function generateScrambleTextPreservingSpaces(
	original: string,
	charset: string,
): string {
	if (!original) return "";
	let result = "";
	for (let i = 0; i < original.length; i += 1) {
		const ch = original[i];
		result +=
			ch === " " ? " " : generateDeterministicCharacter(original, i, charset);
	}
	return result;
}

export const EncryptedText: React.FC<EncryptedTextProps> = ({
	text,
	className,
	revealDelayMs = 50,
	charset = DEFAULT_CHARSET,
	flipDelayMs = 50,
	encryptedClassName,
	revealedClassName,
}) => {
	const ref = useRef<HTMLSpanElement>(null);
	const isInView = useInView(ref, { once: true });

	const [revealCount, setRevealCount] = useState(0);
	const animationFrameRef = useRef<number | null>(null);
	const startTimeRef = useRef(0);
	const lastFlipTimeRef = useRef(0);
	const scrambleCharsRef = useRef<string[]>(
		text ? generateScrambleTextPreservingSpaces(text, charset).split("") : [],
	);

	useEffect(() => {
		if (!isInView) return;

		const initial = text
			? generateScrambleTextPreservingSpaces(text, charset)
			: "";
		scrambleCharsRef.current = initial.split("");
		startTimeRef.current = performance.now();
		lastFlipTimeRef.current = startTimeRef.current;
		setRevealCount(0);

		let isCancelled = false;

		const update = (now: number) => {
			if (isCancelled) return;

			const elapsedMs = now - startTimeRef.current;
			const totalLength = text.length;
			const currentRevealCount = Math.min(
				totalLength,
				Math.floor(elapsedMs / Math.max(1, revealDelayMs)),
			);

			setRevealCount(currentRevealCount);

			if (currentRevealCount >= totalLength) {
				return;
			}

			const timeSinceLastFlip = now - lastFlipTimeRef.current;
			if (timeSinceLastFlip >= Math.max(0, flipDelayMs)) {
				for (let index = 0; index < totalLength; index += 1) {
					if (index >= currentRevealCount) {
						if (text[index] !== " ") {
							scrambleCharsRef.current[index] =
								generateRandomCharacter(charset);
						} else {
							scrambleCharsRef.current[index] = " ";
						}
					}
				}
				lastFlipTimeRef.current = now;
			}

			animationFrameRef.current = requestAnimationFrame(update);
		};

		animationFrameRef.current = requestAnimationFrame(update);

		return () => {
			isCancelled = true;
			if (animationFrameRef.current !== null) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [isInView, text, revealDelayMs, charset, flipDelayMs]);

	if (!text) return null;

	return (
		<motion.span
			ref={ref}
			className={cn("inline", className)}
			style={isInView ? undefined : { visibility: "hidden" }}
		>
			{text.split("").map((char, index) => {
				const isRevealed = index < revealCount;
				const displayChar = isRevealed
					? char
					: char === " "
						? "\u00A0"
						: (scrambleCharsRef.current[index] ??
							generateRandomCharacter(charset));

				return (
					<span
						key={`${index}-${isRevealed}`}
						className={cn(isRevealed ? revealedClassName : encryptedClassName)}
					>
						{displayChar}
					</span>
				);
			})}
		</motion.span>
	);
};
