import path from "node:path";

export const SHIP_BY_SUNDAY_DRAFT_DIRECTORY_NAME = ".ship-by-sunday";
export const SHIP_BY_SUNDAY_DRAFT_FILE_NAME = "draft.json";
export const SHIP_BY_SUNDAY_DRAFT_TEMP_FILE_NAME = "draft.json.tmp";
export const SHIP_BY_SUNDAY_PRODUCT_KEY = "ship-by-sunday";
export const SHIP_BY_SUNDAY_LOCAL_CLERK_USER_ID = "local-cli-user";

export function getDraftDirectoryPath(projectRootPath: string) {
	return path.join(projectRootPath, SHIP_BY_SUNDAY_DRAFT_DIRECTORY_NAME);
}

export function getDraftFilePath(projectRootPath: string) {
	return path.join(
		getDraftDirectoryPath(projectRootPath),
		SHIP_BY_SUNDAY_DRAFT_FILE_NAME,
	);
}

export function getDraftTempFilePath(projectRootPath: string) {
	return path.join(
		getDraftDirectoryPath(projectRootPath),
		SHIP_BY_SUNDAY_DRAFT_TEMP_FILE_NAME,
	);
}
