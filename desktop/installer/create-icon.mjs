import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..", "..");
const sourcePath = path.join(repositoryRoot, "public", "icons", "icon-512.png");
const outputPath = path.join(repositoryRoot, "desktop", "360.WebView2", "Resources", "360.ico");
const sizes = [16, 24, 32, 48, 64, 128, 256];

const images = await Promise.all(
  sizes.map((size) =>
    sharp(sourcePath)
      .resize(size, size, { fit: "contain" })
      .png()
      .toBuffer(),
  ),
);

const headerSize = 6;
const entrySize = 16;
let imageOffset = headerSize + entrySize * images.length;
const header = Buffer.alloc(headerSize + entrySize * images.length);

header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);

images.forEach((image, index) => {
  const size = sizes[index];
  const entryOffset = headerSize + entrySize * index;
  header.writeUInt8(size === 256 ? 0 : size, entryOffset);
  header.writeUInt8(size === 256 ? 0 : size, entryOffset + 1);
  header.writeUInt8(0, entryOffset + 2);
  header.writeUInt8(0, entryOffset + 3);
  header.writeUInt16LE(1, entryOffset + 4);
  header.writeUInt16LE(32, entryOffset + 6);
  header.writeUInt32LE(image.length, entryOffset + 8);
  header.writeUInt32LE(imageOffset, entryOffset + 12);
  imageOffset += image.length;
});

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, Buffer.concat([header, ...images]));
console.log(`Created ${outputPath}`);
