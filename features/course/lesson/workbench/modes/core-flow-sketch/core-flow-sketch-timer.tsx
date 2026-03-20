"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const SKETCH_SECONDS = 120;

function formatMmSs(totalSeconds: number) {
	const m = Math.floor(totalSeconds / 60);
	const s = totalSeconds % 60;
	return `${m}:${s.toString().padStart(2, "0")}`;
}

export function CoreFlowSketchTimer() {
	const [running, setRunning] = useState(false);
	const [remaining, setRemaining] = useState(SKETCH_SECONDS);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	const start = useCallback(() => {
		setRemaining(SKETCH_SECONDS);
		setRunning(true);
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}
		intervalRef.current = setInterval(() => {
			setRemaining((prev) => {
				if (prev <= 1) {
					if (intervalRef.current) {
						clearInterval(intervalRef.current);
						intervalRef.current = null;
					}
					setRunning(false);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	}, []);

	const label = running
		? `Sketching — ${formatMmSs(remaining)} left`
		: remaining === 0
			? "2 minutes up — pick one idea next"
			: "Pause here and sketch for 2 minutes";

	return (
		<Alert>
			<AlertTitle>{label}</AlertTitle>
			<AlertDescription className="mt-2 flex flex-wrap items-center gap-2">
				<Button
					type="button"
					size="sm"
					onClick={start}
					disabled={running && remaining > 0}
				>
					{running ? "Timer running" : "Start 2-minute timer"}
				</Button>
				<span className="text-muted-foreground">
					Stay low-fidelity: boxes and arrows, not pixels.
				</span>
			</AlertDescription>
		</Alert>
	);
}
