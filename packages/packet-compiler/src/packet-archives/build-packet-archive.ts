import JSZip from "jszip";
import type { RenderedPacketFile } from "../packets/render-types";

export async function buildPacketArchive(files: RenderedPacketFile[]) {
	const zip = new JSZip();
	for (const file of files) {
		zip.file(file.path, file.content);
	}
	return zip.generateAsync({ type: "nodebuffer" });
}
