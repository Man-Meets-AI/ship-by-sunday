"use client";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useRef, useEffect, useState, useCallback } from "react";

function measureTightTextWidth(node: HTMLElement): number {
	const range = document.createRange();
	range.selectNodeContents(node);
	const rects = range.getClientRects();
	if (rects.length <= 1) return node.getBoundingClientRect().width;

	const containerLeft = node.getBoundingClientRect().left;
	let maxRight = 0;
	for (const rect of rects) {
		maxRight = Math.max(maxRight, rect.right - containerLeft);
	}
	return maxRight;
}

export function PointerHighlight({
	children,
	rectangleClassName,
	pointerClassName,
	containerClassName,
}: {
	children: React.ReactNode;
	rectangleClassName?: string;
	pointerClassName?: string;
	containerClassName?: string;
}) {
	const containerRef = useRef<HTMLSpanElement>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	const measure = useCallback(() => {
		const node = containerRef.current;
		if (!node) return;
		const width = measureTightTextWidth(node);
		const { height } = node.getBoundingClientRect();
		setDimensions({ width, height });
	}, []);

	useEffect(() => {
		const observedNode = containerRef.current;
		if (!observedNode) return;

		measure();

		const resizeObserver = new ResizeObserver(() => measure());
		resizeObserver.observe(observedNode);

		return () => resizeObserver.unobserve(observedNode);
	}, [measure]);

	return (
		<span
			className={cn("relative inline-block w-fit", containerClassName)}
			ref={containerRef}
		>
			{children}
			{dimensions.width > 0 && dimensions.height > 0 && (
				<motion.span
					className="pointer-events-none absolute inset-0 z-0"
					initial={{ opacity: 0, scale: 0.95, originX: 0, originY: 0 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				>
					<motion.span
						className={cn(
							"absolute inset-0 border border-neutral-800 dark:border-neutral-200",
							rectangleClassName,
						)}
						initial={{
							width: 0,
							height: 0,
						}}
						whileInView={{
							width: dimensions.width,
							height: dimensions.height,
						}}
						transition={{
							duration: 1,
							ease: "easeInOut",
						}}
					/>
					<motion.span
						className="pointer-events-none absolute"
						initial={{ opacity: 0 }}
						whileInView={{
							opacity: 1,
							x: dimensions.width + 4,
							y: dimensions.height + 4,
						}}
						style={{
							rotate: -90,
						}}
						transition={{
							opacity: { duration: 0.1, ease: "easeInOut" },
							duration: 1,
							ease: "easeInOut",
						}}
					>
						<Pointer
							className={cn("h-5 w-5 text-blue-500", pointerClassName)}
						/>
					</motion.span>
				</motion.span>
			)}
		</span>
	);
}

const Pointer = ({ ...props }: React.SVGProps<SVGSVGElement>) => {
	return (
		<svg
			stroke="currentColor"
			fill="currentColor"
			strokeWidth="1"
			strokeLinecap="round"
			strokeLinejoin="round"
			viewBox="0 0 16 16"
			height="1em"
			width="1em"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z"></path>
		</svg>
	);
};
