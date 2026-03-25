import { getHomePageStructuredData } from "@/features/marketing/lib/home-page-structured-data";

function createHomePageStructuredDataMarkup() {
	return `<script type="application/ld+json">${getHomePageStructuredData()}</script>`;
}

export function HomePageStructuredData() {
	return (
		<div
			dangerouslySetInnerHTML={{
				__html: createHomePageStructuredDataMarkup(),
			}}
		/>
	);
}
