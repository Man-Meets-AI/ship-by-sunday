import convexPlugin from "@convex-dev/eslint-plugin";
import nextVitals from "eslint-config-next/core-web-vitals";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
	...convexPlugin.configs.recommended,
	...nextVitals,
	{
		rules: {
			"@next/next/no-img-element": "off",
			"import/no-anonymous-default-export": "off",
			"jsx-a11y/role-supports-aria-props": "off",
			"react-hooks/set-state-in-effect": "off",
		},
	},
	{
		files: ["tests/**/*.ts"],
		languageOptions: {
			globals: {
				afterEach: "readonly",
				describe: "readonly",
				expect: "readonly",
				it: "readonly",
				vi: "readonly",
			},
		},
	},
	globalIgnores([
		".next/**",
		".next.stale*/**",
		"coverage/**",
		"convex/_generated/**",
		"node_modules/**",
	]),
]);
