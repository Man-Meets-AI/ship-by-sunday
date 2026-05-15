import { PublicSiteHeader } from "@/components/layout/public-site-header";
import { routeConfig } from "@/config/product";

type BlogSurfaceHeaderProps = {
	activeHref?: string;
};

export function BlogSurfaceHeader({ activeHref }: BlogSurfaceHeaderProps) {
	return <PublicSiteHeader activeHref={activeHref ?? routeConfig.blog} />;
}
