"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

const COVER_BEAMS = [
	{ top: "18%", delay: 0 },
	{ top: "38%", delay: 0.08 },
	{ top: "62%", delay: 0.16 },
	{ top: "82%", delay: 0.24 },
] as const;

export const Cover = ({
	children,
	className,
}: {
	children?: React.ReactNode;
	className?: string;
}) => {
	const [hovered, setHovered] = useState(false);

	return (
		<div
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			className="group/cover relative inline-block rounded-sm bg-neutral-100 px-2 py-2 transition duration-200 hover:bg-neutral-900 dark:bg-neutral-900"
		>
			<AnimatePresence>
				{hovered && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{
							opacity: {
								duration: 0.2,
							},
						}}
						className="absolute inset-0 h-full w-full overflow-hidden"
					>
						<motion.div
							animate={{
								translateX: ["-50%", "0%"],
							}}
							transition={{
								translateX: {
									duration: 10,
									ease: "linear",
									repeat: Infinity,
								},
							}}
							className="h-full w-[200%] bg-[linear-gradient(115deg,transparent_0%,rgba(59,130,246,0.14)_22%,rgba(255,255,255,0.22)_45%,rgba(46,185,223,0.16)_68%,transparent_100%)]"
						/>
						{COVER_BEAMS.map((beam) => (
							<motion.span
								key={beam.top}
								className="absolute left-0 h-px w-full bg-gradient-to-r from-transparent via-sky-300 to-transparent"
								style={{ top: beam.top }}
								initial={{ x: "-100%", opacity: 0 }}
								animate={{ x: "100%", opacity: [0, 1, 0] }}
								transition={{
									duration: 0.9,
									delay: beam.delay,
									ease: "easeOut",
									repeat: Infinity,
									repeatDelay: 1.2,
								}}
							/>
						))}
					</motion.div>
				)}
			</AnimatePresence>
			<motion.span
				key={String(hovered)}
				animate={{
					scale: hovered ? 0.8 : 1,
					x: hovered ? [0, -30, 30, -30, 30, 0] : 0,
					y: hovered ? [0, 30, -30, 30, -30, 0] : 0,
				}}
				exit={{
					filter: "none",
					scale: 1,
					x: 0,
					y: 0,
				}}
				transition={{
					duration: 0.2,
					x: {
						duration: 0.2,
						repeat: Infinity,
						repeatType: "loop",
					},
					y: {
						duration: 0.2,
						repeat: Infinity,
						repeatType: "loop",
					},
					scale: {
						duration: 0.2,
					},
					filter: {
						duration: 0.2,
					},
				}}
				className={cn(
					"dark:text-white inline-block text-neutral-900 relative z-20 group-hover/cover:text-white transition duration-200",
					className,
				)}
			>
				{children}
			</motion.span>
			<CircleIcon className="absolute -right-[2px] -top-[2px]" />
			<CircleIcon className="absolute -bottom-[2px] -right-[2px]" delay={0.4} />
			<CircleIcon className="absolute -left-[2px] -top-[2px]" delay={0.8} />
			<CircleIcon className="absolute -bottom-[2px] -left-[2px]" delay={1.6} />
		</div>
	);
};

export const CircleIcon = ({
	className,
	delay: _delay,
}: {
	className?: string;
	delay?: number;
}) => {
	return (
		<div
			className={cn(
				`pointer-events-none animate-pulse group-hover/cover:hidden group-hover/cover:opacity-100 group h-2 w-2 rounded-full bg-neutral-600 dark:bg-white opacity-20 group-hover/cover:bg-white`,
				className,
			)}
		></div>
	);
};
