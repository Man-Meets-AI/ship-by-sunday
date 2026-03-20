"use client";

import dynamic from "next/dynamic";

import { Card } from "@/components/ui/card";
import type { GlobeConfig } from "@/components/ui/globe";
import { globeArcs } from "@/features/marketing/lib/globe-arcs";

const World = dynamic(
	() => import("@/components/ui/globe").then((m) => m.World),
	{ ssr: false },
);

const globeConfig: GlobeConfig = {
	pointSize: 4,
	globeColor: "#0a0a0a",
	showAtmosphere: true,
	atmosphereColor: "#a3a3a3",
	atmosphereAltitude: 0.1,
	emissive: "#0a0a0a",
	emissiveIntensity: 0.1,
	shininess: 0.9,
	polygonColor: "rgba(255,255,255,0.7)",
	ambientLight: "#a3a3a3",
	directionalLeftLight: "#fafafa",
	directionalTopLight: "#fafafa",
	pointLight: "#fafafa",
	arcTime: 1000,
	arcLength: 0.9,
	rings: 1,
	maxRings: 3,
	initialPosition: { lat: 39.8283, lng: -98.5795 },
	autoRotate: true,
	autoRotateSpeed: 0.5,
};

export function GlobeCard() {
	return (
		<Card className="relative overflow-hidden bg-black py-0">
			<div className="relative aspect-square w-full sm:aspect-video lg:aspect-auto lg:h-112">
				<World data={globeArcs} globeConfig={globeConfig} />
			</div>
		</Card>
	);
}
