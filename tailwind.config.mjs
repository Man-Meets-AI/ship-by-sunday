const config = {
	content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				ink: "#111111",
				paper: "#f5f1ea",
				line: "#1a1a1a",
				muted: "#ece7de",
				accent: "#262626",
				"product-bg": "rgb(var(--product-bg) / <alpha-value>)",
				"product-surface": "rgb(var(--product-surface) / <alpha-value>)",
				"product-surface-strong":
					"rgb(var(--product-surface-strong) / <alpha-value>)",
				"product-surface-alt":
					"rgb(var(--product-surface-alt) / <alpha-value>)",
				"product-border": "rgb(var(--product-border) / <alpha-value>)",
				"product-text": "rgb(var(--product-text) / <alpha-value>)",
				"product-muted": "rgb(var(--product-muted) / <alpha-value>)",
				"product-accent": "rgb(var(--product-accent) / <alpha-value>)",
				"product-accent-soft":
					"rgb(var(--product-accent-soft) / <alpha-value>)",
				"product-chip": "rgb(var(--product-chip) / <alpha-value>)",
				"product-shadow": "rgb(var(--product-shadow) / <alpha-value>)",
			},
			fontFamily: {
				display: ["var(--font-display)"],
				sans: ["var(--font-sans)"],
				mono: [
					"ui-monospace",
					"SFMono-Regular",
					"Menlo",
					"Monaco",
					"Consolas",
					"Liberation Mono",
					"Courier New",
					"monospace",
				],
			},
			boxShadow: {
				card: "8px 8px 0 0 rgba(17,17,17,0.96)",
				panel: "0 24px 80px rgba(var(--product-shadow) / 0.28)",
			},
		},
	},
	plugins: [],
};

export default config;
