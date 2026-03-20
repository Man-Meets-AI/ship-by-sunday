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

	const textClass =
		"fill-transparent font-[helvetica] text-7xl font-bold [text-rendering:geometricPrecision]";
	const strokeClass = "stroke-neutral-950 dark:stroke-neutral-200";
	const fillClass =
		"fill-current font-[helvetica] text-7xl font-bold text-foreground [text-rendering:geometricPrecision]";

	return (
		<svg
			ref={svgRef}
			width="100%"
			height="100%"
			viewBox="0 0 300 100"
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
					r="20%"
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
				className={fillClass}
			>
				{text}
			</text>
			<text
				x="50%"
				y="50%"
				textAnchor="middle"
				dominantBaseline="middle"
				strokeWidth="0.3"
				className={`${textClass} ${strokeClass}`}
				style={{ opacity: hovered ? 0.7 : 0 }}
			>
				{text}
			</text>
			<motion.text
				x="50%"
				y="50%"
				textAnchor="middle"
				dominantBaseline="middle"
				strokeWidth="0.3"
				className={`${textClass} ${strokeClass}`}
				initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
				animate={{
					strokeDashoffset: 0,
					strokeDasharray: 1000,
				}}
				transition={{
					duration: 4,
					ease: "easeInOut",
				}}
			>
				{text}
			</motion.text>
			<text
				x="50%"
				y="50%"
				textAnchor="middle"
				dominantBaseline="middle"
				stroke={`url(#${textGradientId})`}
				strokeWidth="0.3"
				mask={`url(#${textMaskId})`}
				className={textClass}
			>
				{text}
			</text>
		</svg>
	);
}
