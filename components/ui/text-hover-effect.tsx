"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

/** Aceternity [Text Hover Effect](https://ui.aceternity.com/components/text-hover-effect); ids scoped for multiple instances. */
export function TextHoverEffect({
	text,
	duration,
	className,
}: {
	text: string;
	duration?: number;
	className?: string;
}) {
	const rawId = useId().replace(/:/g, "");
	const textGradientId = `textGradient-${rawId}`;
	const revealMaskId = `revealMask-${rawId}`;
	const textMaskId = `textMask-${rawId}`;
	const svgRef = useRef<SVGSVGElement>(null);
	const [cursor, setCursor] = useState({ x: 0, y: 0 });
	const [hovered, setHovered] = useState(false);
	const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });

	useEffect(() => {
		if (svgRef.current && cursor.x !== null && cursor.y !== null) {
			const svgRect = svgRef.current.getBoundingClientRect();
			const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
			const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
			setMaskPosition({
				cx: `${cxPercentage}%`,
				cy: `${cyPercentage}%`,
			});
		}
	}, [cursor]);

	const fontClass =
		"font-[helvetica] text-7xl font-bold [text-rendering:geometricPrecision]";

	return (
		<svg
			ref={svgRef}
			width="100%"
			height="100%"
			viewBox="0 0 400 100"
			xmlns="http://www.w3.org/2000/svg"
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
			className={cn("text-foreground select-none", className)}
			aria-hidden="true"
		>
			<defs>
				<linearGradient id={textGradientId} gradientUnits="userSpaceOnUse">
					{hovered && (
						<>
							<stop offset="0%" stopColor="#eab308" />
							<stop offset="25%" stopColor="#ef4444" />
							<stop offset="50%" stopColor="#3b82f6" />
							<stop offset="75%" stopColor="#06b6d4" />
							<stop offset="100%" stopColor="#8b5cf6" />
						</>
					)}
				</linearGradient>

				<motion.radialGradient
					id={revealMaskId}
					gradientUnits="userSpaceOnUse"
					r="30%"
					initial={{ cx: "50%", cy: "50%" }}
					animate={maskPosition}
					transition={{ duration: duration ?? 0, ease: "easeOut" }}
				>
					<stop offset="0%" stopColor="white" />
					<stop offset="100%" stopColor="black" />
				</motion.radialGradient>
				<mask id={textMaskId}>
					<rect
						x="0"
						y="0"
						width="100%"
						height="100%"
						fill={`url(#${revealMaskId})`}
					/>
				</mask>
			</defs>
			<text
				x="50%"
				y="50%"
				textAnchor="middle"
				dominantBaseline="middle"
				className={`fill-current text-foreground ${fontClass}`}
			>
				{text}
			</text>
			<text
				x="50%"
				y="50%"
				textAnchor="middle"
				dominantBaseline="middle"
				fill={`url(#${textGradientId})`}
				mask={`url(#${textMaskId})`}
				className={fontClass}
			>
				{text}
			</text>
		</svg>
	);
}
