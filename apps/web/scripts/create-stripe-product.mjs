import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
	throw new Error("Missing STRIPE_SECRET_KEY in .env.local");
}

const stripe = new Stripe(stripeSecretKey, {
	apiVersion: "2026-02-25.clover",
});

const stripeOffers = [
	{
		envPrefix: "STARTER",
		name: "Ship Your Idea by Sunday",
		description: "Starter codebase generator, template app, and guided videos.",
		offerId: "starter",
		unitAmount: 29700,
	},
	{
		envPrefix: "WORKERS",
		name: "Ship by Sunday Workers",
		description:
			"Existing-repo Worker install, doctor pass, approved loop, and proof.",
		offerId: "workers",
		unitAmount: 60000,
	},
];

for (const offer of stripeOffers) {
	const product = await stripe.products.create({
		name: offer.name,
		description: offer.description,
		metadata: {
			accessProduct: "paid_app_access",
			app: "man_meets_ai",
			offerId: offer.offerId,
		},
		default_price_data: {
			currency: "usd",
			unit_amount: offer.unitAmount,
		},
	});

	const defaultPriceId =
		typeof product.default_price === "string"
			? product.default_price
			: product.default_price?.id;

	console.log(`Created Stripe ${offer.offerId} product:`);
	console.log(`STRIPE_${offer.envPrefix}_PRODUCT_ID=${product.id}`);
	if (defaultPriceId) {
		console.log(`STRIPE_${offer.envPrefix}_PRICE_ID=${defaultPriceId}`);
	}
}
