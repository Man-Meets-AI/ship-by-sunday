import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireGrantedProductAccess } from "./entitlements/model";

export const generateUploadUrl = mutation({
	args: {},
	returns: v.string(),
	handler: async (ctx) => {
		await requireGrantedProductAccess(ctx);
		return ctx.storage.generateUploadUrl();
	},
});
