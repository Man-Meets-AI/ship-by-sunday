import { buildStaticRepoDownloadTraceIncludes } from "./repo-download-source-contract";
import {
	STARTER_TEMPLATE_SOURCE_MANIFEST_PATH,
	STARTER_TEMPLATE_SOURCE_ROOT,
	listStarterTemplateSourceFilesSync,
	loadStarterTemplateSourceManifestSync,
} from "./starter-template-source-contract";

function toStarterTemplateSourceTraceFilePath(sourcePath: string) {
	return `../../${STARTER_TEMPLATE_SOURCE_ROOT}/${sourcePath}`;
}

function toStarterTemplateSourceTraceDirectoryGlob(sourceDirectory: string) {
	return `../../${STARTER_TEMPLATE_SOURCE_ROOT}/${sourceDirectory}/**/*`;
}

function toStarterTemplateSourceExcludedSegmentGlob(segment: string) {
	return `../../${STARTER_TEMPLATE_SOURCE_ROOT}/**/${segment}/**/*`;
}

function buildStarterTemplateSourceTraceIncludes() {
	const manifest = loadStarterTemplateSourceManifestSync();
	const sourceFiles = listStarterTemplateSourceFilesSync({ manifest });
	const rootFiles = sourceFiles.filter(
		(sourceFile) => !sourceFile.includes("/"),
	);
	const rootDirectories = Array.from(
		new Set(
			sourceFiles
				.filter((sourceFile) => sourceFile.includes("/"))
				.map((sourceFile) => sourceFile.split("/")[0])
				.filter((segment): segment is string => Boolean(segment)),
		),
	).sort();

	return [
		`../../${STARTER_TEMPLATE_SOURCE_MANIFEST_PATH}`,
		...rootFiles.map(toStarterTemplateSourceTraceFilePath),
		...rootDirectories.map(toStarterTemplateSourceTraceDirectoryGlob),
	];
}

function buildStarterTemplateSourceTraceExcludes() {
	const manifest = loadStarterTemplateSourceManifestSync();
	return [
		...manifest.excludedPathSegments.map((segment) =>
			toStarterTemplateSourceTraceDirectoryGlob(segment),
		),
		...manifest.excludedPathSegments.map(
			toStarterTemplateSourceExcludedSegmentGlob,
		),
	];
}

export function buildRepoDownloadTraceIncludes() {
	return [
		...buildStaticRepoDownloadTraceIncludes(),
		...buildStarterTemplateSourceTraceIncludes(),
	];
}

export function buildRepoDownloadTraceExcludes() {
	return buildStarterTemplateSourceTraceExcludes();
}
