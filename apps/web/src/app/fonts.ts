import localFont from "next/font/local";
import { Bebas_Neue, Instrument_Serif, Inter } from "next/font/google";

export const bebasNeue = Bebas_Neue({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-bebas-neue",
});

export const instrumentSerif = Instrument_Serif({
	subsets: ["latin"],
	weight: "400",
	style: ["normal", "italic"],
	display: "swap",
	variable: "--font-instrument-serif",
});

export const inter = Inter({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	display: "swap",
	variable: "--font-inter",
});

export const berkeleyMono = localFont({
	src: [
		{
			path: "./_fonts/BerkeleyMono-Regular.otf",
			weight: "400",
			style: "normal",
		},
		{
			path: "./_fonts/BerkeleyMono-Oblique.otf",
			weight: "400",
			style: "italic",
		},
		{
			path: "./_fonts/BerkeleyMono-Bold.otf",
			weight: "700",
			style: "normal",
		},
		{
			path: "./_fonts/BerkeleyMono-Bold-Oblique.otf",
			weight: "700",
			style: "italic",
		},
	],
	display: "swap",
	preload: true,
	adjustFontFallback: false,
	variable: "--font-berkeley-mono",
});

export const projectFontVariables = [
	bebasNeue.variable,
	instrumentSerif.variable,
	inter.variable,
	berkeleyMono.variable,
].join(" ");
