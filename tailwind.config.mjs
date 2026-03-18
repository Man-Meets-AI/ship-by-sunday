const config = {
	content: [
		"./app/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./config/**/*.{ts,tsx}",
		"./lib/**/*.{ts,tsx}",
	],
	theme: {
		extend: {
			colors: {
				// Deprecated migration bridge. New runtime surfaces should use product-* tokens directly.
				ink: "rgb(var(--brand-ink) / <alpha-value>)",
				paper: "rgb(var(--brand-paper) / <alpha-value>)",
				line: "rgb(var(--brand-line) / <alpha-value>)",
				muted: "rgb(var(--brand-muted) / <alpha-value>)",
				accent: "rgb(var(--brand-accent) / <alpha-value>)",
				danger: "rgb(var(--brand-danger) / <alpha-value>)",
				"danger-soft": "rgb(var(--brand-danger-soft) / <alpha-value>)",
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
				card: "8px 8px 0 0 rgb(var(--brand-ink) / 0.96)",
				panel: "0 24px 80px rgba(var(--product-shadow) / 0.28)",
			},
		},
	},
	plugins: [],
};

export default config;
