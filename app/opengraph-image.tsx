import { ImageResponse } from "next/og";

import { productConfig } from "@/config/product";

export const alt = `${productConfig.name} preview`;
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

export default function Image() {
	return new ImageResponse(
		(
			<div
				style={{
					display: "flex",
					width: "100%",
					height: "100%",
					padding: "56px",
					flexDirection: "column",
					justifyContent: "space-between",
					background:
						"linear-gradient(135deg, #0f172a 0%, #1d4ed8 60%, #38bdf8 100%)",
					color: "#f8fafc",
					fontFamily:
						"'Inter', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "14px",
					}}
				>
					<div
						style={{
							height: "44px",
							width: "44px",
							borderRadius: "999px",
							background: "#f8fafc",
							color: "#0f172a",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontWeight: "700",
							fontSize: "20px",
						}}
					>
						{productConfig.shortMark}
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
						}}
					>
						<div
							style={{
								display: "flex",
								fontSize: "28px",
								fontWeight: "700",
							}}
						>
							{productConfig.name}
						</div>
						<div
							style={{
								display: "flex",
								fontSize: "18px",
								opacity: 0.9,
							}}
						>
							{productConfig.metadataDescription}
						</div>
					</div>
				</div>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "18px",
					}}
				>
					<div
						style={{
							display: "flex",
							fontSize: "58px",
							lineHeight: 1.05,
							fontWeight: "800",
							maxWidth: "960px",
						}}
					>
						{productConfig.promise}
					</div>
					<div
						style={{
							display: "flex",
							fontSize: "30px",
							opacity: 0.95,
							fontWeight: "500",
							maxWidth: "900px",
						}}
					>
						{productConfig.priceDisplay} one-time. Guided sprint to ship a live v1.
					</div>
				</div>
			</div>
		),
		{
			...size,
		},
	);
}
