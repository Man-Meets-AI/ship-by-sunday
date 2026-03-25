import { courseResourceConfig } from "@/config/product";

/** Persisted field ids for lesson 3.9 (must match `build.ts` workbenchFields). */
export const BRAND_KIT_APP_NAME_FIELD_ID = "brand_kit_app_name";
export const BRAND_KIT_INITIALS_FIELD_ID = "brand_kit_initials";
export const BRAND_KIT_DOMAIN_FIELD_ID = "brand_kit_domain";
export const BRAND_KIT_PRIMARY_HEX_FIELD_ID = "brand_kit_primary_hex";
export const BRAND_KIT_ACCENT_HEX_FIELD_ID = "brand_kit_accent_hex";
export const BRAND_KIT_NAMING_FIELD_ID = "brand_kit_naming_exercise";
export const BRAND_KIT_ARTIFACT_CHECKLIST_FIELD_ID =
	"brand_kit_artifact_checklist";
export const BRAND_KIT_ICON_UPLOAD_FIELD_ID = "brand_kit_icon_upload";
export const BRAND_KIT_WORDMARK_UPLOAD_FIELD_ID = "brand_kit_wordmark_upload";

export const BRAND_KIT_STRIPE_BRANDING_URL =
	"https://dashboard.stripe.com/settings/branding";
export const BRAND_KIT_FAVICON_IO_URL = "https://favicon.io";
export const BRAND_KIT_COOLORS_URL = "https://coolors.co";
export const BRAND_KIT_CLOUDFLARE_URL = "https://www.cloudflare.com";

export const BRAND_KIT_FIGMA_WHITEBOARD_URL =
	courseResourceConfig.figjam.workspace;
/** Logo/mark work often lives in a separate Figma file—instructor can swap this URL in config later. */
export const BRAND_KIT_FIGMA_DESIGN_FILE_URL =
	courseResourceConfig.figjam.storyboard;

export const BRAND_KIT_ARTIFACT_CHECKLIST_OPTIONS = [
	"Update logo text in the Figma template",
	"Export square app icon as 500×500 PNG",
	"Generate favicon set from the logo (favicon.io)",
	"Upload icon/logo and colors in Stripe → Settings → Business → Branding",
	"Choose primary brand color and one accent (hex)",
	"Buy/register domain (e.g. Cloudflare)",
	"Rename and file exports on Desktop/Downloads so filenames are clear",
] as const;

export const BRAND_KIT_RESOURCE_LINKS = [
	{
		id: "figma-whiteboard",
		label: "Figma whiteboard template",
		href: BRAND_KIT_FIGMA_WHITEBOARD_URL,
	},
	{
		id: "figma-design",
		label: "Figma design file",
		href: BRAND_KIT_FIGMA_DESIGN_FILE_URL,
	},
	{
		id: "stripe-branding",
		label: "Stripe → Branding",
		href: BRAND_KIT_STRIPE_BRANDING_URL,
	},
	{ id: "favicon", label: "favicon.io", href: BRAND_KIT_FAVICON_IO_URL },
	{ id: "coolors", label: "coolors.co", href: BRAND_KIT_COOLORS_URL },
	{
		id: "cloudflare",
		label: "cloudflare.com",
		href: BRAND_KIT_CLOUDFLARE_URL,
	},
] as const;
