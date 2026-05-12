import { describe, expect, it } from "bun:test";

import { extractAddedLockedPackageVersions } from "./check-lockfile-release-age";

describe("extractAddedLockedPackageVersions", () => {
	it("extracts unique package versions from added bun lock entries", () => {
		const packageVersions = extractAddedLockedPackageVersions(`
diff --git a/bun.lock b/bun.lock
@@ -1,2 +1,4 @@
+    "@clerk/shared": ["@clerk/shared@4.10.1", "", {}, "sha512-example"],
+    "react": ["react@19.2.4", "", {}, "sha512-example"],
+    "@clerk/shared": ["@clerk/shared@4.10.1", "", {}, "sha512-example"],
+        "react": "19.2.4",
`);

		expect(packageVersions).toEqual([
			{ name: "@clerk/shared", version: "4.10.1" },
			{ name: "react", version: "19.2.4" },
		]);
	});

	it("ignores non-package lockfile additions", () => {
		const packageVersions = extractAddedLockedPackageVersions(`
+  "workspaces": {
+    "": {
+      "name": "ship-by-sunday-site",
+    },
`);

		expect(packageVersions).toEqual([]);
	});
});
