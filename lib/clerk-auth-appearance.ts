/**
 * Clerk prebuilt auth/task appearance aligned with shadcn primitives
 * (`components/ui/input`, `button`, `label`) and semantic tokens.
 */
const input =
	"h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 font-sans text-base shadow-none transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40";

const label =
	"font-sans text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50";

const buttonBase =
	"group/button inline-flex shrink-0 items-center justify-center rounded-lg border bg-clip-padding font-sans text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

const primaryButton = `${buttonBase} h-8 w-full gap-1.5 border-transparent bg-primary px-2.5 text-primary-foreground hover:bg-primary/80`;

const outlineButton = `${buttonBase} h-8 w-full gap-1.5 border-border bg-background px-2.5 text-foreground hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50`;

const ghostIconButton = `${buttonBase} size-8 border-transparent bg-transparent text-foreground hover:bg-muted dark:hover:bg-muted/50`;

const linkText =
	"font-sans text-sm font-medium text-primary underline-offset-4 hover:underline";

export const clerkAuthAppearance = {
	elements: {
		rootBox: "w-full font-sans antialiased",
		card: "shadow-none border-0 bg-transparent p-0",
		headerTitle: "hidden",
		headerSubtitle: "hidden",
		main: "gap-6",
		socialButtons: "flex w-full flex-col gap-3",
		socialButtonsBlockButton: outlineButton,
		socialButtonsIconButton: outlineButton,
		dividerRow: "gap-3 py-2",
		dividerLine: "bg-border",
		dividerText: "text-muted-foreground text-sm font-sans",
		formFieldRow: "gap-4",
		formFieldLabelRow: "gap-2",
		formFieldLabel: label,
		formFieldInput: input,
		formFieldInputShowPasswordButton: ghostIconButton,
		formFieldHintText: "text-muted-foreground text-sm font-sans",
		formFieldErrorText: "text-destructive text-sm font-sans",
		formFieldSuccessText: "text-sm font-sans text-foreground",
		formButtonPrimary: primaryButton,
		formButtonSecondary: outlineButton,
		footer: "mt-6 gap-2",
		footerAction: "gap-2",
		footerActionText: "text-muted-foreground text-sm font-sans",
		footerActionLink: linkText,
		identityPreviewText: "text-sm font-sans text-foreground",
		identityPreviewEditButton: linkText,
		formHeaderTitle: "text-base font-medium font-sans text-foreground",
		formHeaderSubtitle: "text-muted-foreground text-sm font-sans",
		alertText: "text-sm font-sans text-foreground",
		formResendCodeLink: linkText,
		otpCodeFieldInput: `${input} text-center`,
		backLink: `${linkText} w-fit`,
		alternativeMethodsBlockButton: outlineButton,
	},
};
