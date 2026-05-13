/**
 * Primary-CTA invert pattern shared by the public marketing surface and the
 * post-checkout success view. Uses `foreground` / `background` tokens instead
 * of the shadcn `--primary` token because `--primary` does not flip cleanly
 * across themes for the active design preset, which would otherwise leave a
 * default `bg-primary` button rendering dark-on-dark.
 *
 * This is the single deletion target when the structural `--primary` /
 * `--primary-foreground` cascade is fixed. When that fix lands, every consumer
 * of this constant should be re-evaluated for whether the local invert is
 * still wanted (marketing CTA tier) or whether it can revert to the default
 * `bg-primary text-primary-foreground` button styling.
 */
export const PRIMARY_CTA_INVERT_CLASSES =
	"bg-foreground text-background hover:bg-foreground/90 disabled:bg-foreground disabled:text-background";
