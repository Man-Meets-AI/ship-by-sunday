"server-only";

import { auth } from "@clerk/nextjs/server";

export async function getConvexToken() {
  const { userId, getToken } = await auth();

  if (!userId) {
    return null;
  }

  return getToken({ template: "convex" });
}

export async function requireConvexToken() {
  const token = await getConvexToken();

  if (!token) {
    throw new Error(
      'Expected an authenticated Convex token. Check the Clerk "convex" JWT template and Convex auth setup.',
    );
  }

  return token;
}
