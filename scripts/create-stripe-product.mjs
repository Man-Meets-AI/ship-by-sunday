import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
	throw new Error("Missing STRIPE_SECRET_KEY in .env.local");
}

const stripe = new Stripe(stripeSecretKey, {
	apiVersion: "2026-02-25.clover",
});

const product = await stripe.products.create({
	name: "Ship by Sunday",
	description: "Go from idea to v1 this weekend.",
	metadata: {
		courseSlug: "ship-by-sunday",
	},
	default_price_data: {
		currency: "usd",
		unit_amount: 50000,
	},
});

const defaultPriceId =
	typeof product.default_price === "string"
		? product.default_price
		: product.default_price?.id;

console.log("Created Stripe product:");
console.log(`STRIPE_PRODUCT_ID=${product.id}`);
if (defaultPriceId) {
	console.log(`STRIPE_PRICE_ID=${defaultPriceId}`);
}
