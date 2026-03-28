import path from "node:path";

export const SHIP_BY_SUNDAY_DRAFT_DIRECTORY_NAME = ".ship-by-sunday";
export const SHIP_BY_SUNDAY_DRAFT_FILE_NAME = "draft.json";
export const SHIP_BY_SUNDAY_PRODUCT_KEY = "ship-by-sunday";
export const SHIP_BY_SUNDAY_LOCAL_CLERK_USER_ID = "local-cli-user";

export function getDraftDirectoryPath(repoRootPath: string) {
	return path.join(repoRootPath, SHIP_BY_SUNDAY_DRAFT_DIRECTORY_NAME);
}

export function getDraftFilePath(repoRootPath: string) {
	return path.join(
		getDraftDirectoryPath(repoRootPath),
		SHIP_BY_SUNDAY_DRAFT_FILE_NAME,
	);
}
