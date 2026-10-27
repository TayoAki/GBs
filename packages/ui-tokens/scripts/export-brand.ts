import { mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = new URL("../../../", import.meta.url);
const path = (name: string) => fileURLToPath(new URL(name, root));
const asset = (name: string) => path(`packages/ui-tokens/assets/${name}`);
const BACKGROUND = "#0E5B53";

const render = (name: string, size = 1024) =>
  sharp(asset(name), { density: 72 * (size / 1024) * 4 })
    .resize(size, size)
    .png()
    .toBuffer();
// The full-bleed icon: teal plate with the badge. Platforms that mask icons get it square.
const square = await render("hire-shelby.svg");
// Android launchers crop adaptive layers to a circle, so the badge shrinks into the safe zone.
async function safeZone(name: string) {
  return sharp({ create: { width: 1024, height: 1024, channels: 4, background: "transparent" } })
    .composite([{ input: await render(name, 820), top: 102, left: 102 }])
    .png()
    .toBuffer();
}

function roundedMask(size: number, radius: number) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="white"/></svg>`,
  );
}
async function roundedCorners(input: Buffer, size = 1024, radius = 200) {
  return sharp(await sharp(input).resize(size, size).png().toBuffer())
    .composite([{ input: roundedMask(size, radius), blend: "dest-in" }])
    .png()
    .toBuffer();
}
const rounded = await roundedCorners(square);

async function png(input: Buffer, name: string, size: number) {
  await sharp(input).resize(size, size).png().toFile(path(name));
}

// PNG frames in ICO are supported by modern Windows and browser favicon loaders.
async function ico(input: Buffer, name: string, sizes: number[]) {
  const frames = await Promise.all(sizes.map((size) => sharp(input).resize(size).png().toBuffer()));
  const header = Buffer.alloc(6 + frames.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);
  let offset = header.length;
  frames.forEach((frame, index) => {
    const entry = 6 + index * 16;
    header[entry] = header[entry + 1] = sizes[index] === 256 ? 0 : sizes[index];
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(frame.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += frame.length;
  });
  await writeFile(path(name), Buffer.concat([header, ...frames]));
}

// Web app. The marketing site in apps/www keeps the upstream project's own marks.
const publicDir = "apps/web/public";
await png(rounded, `${publicDir}/favicon-16x16.png`, 16);
await png(rounded, `${publicDir}/favicon-32x32.png`, 32);
await png(rounded, `${publicDir}/favicon.png`, 128);
await png(square, `${publicDir}/apple-touch-icon.png`, 180);
await png(square, `${publicDir}/icon-192.png`, 192);
await png(square, `${publicDir}/icon-512.png`, 512);
await ico(rounded, `${publicDir}/favicon.ico`, [16, 32, 48]);

// Desktop. Pre-Tahoe macOS icons sit in an 824-point plate with Dock margins and a shadow.
await png(square, "apps/desktop/assets/icon.png", 1024);
await ico(rounded, "apps/desktop/assets/icon.ico", [16, 32, 48, 64, 128, 256]);
const shadow = await sharp(roundedMask(824, 185)).blur(18).linear(0.3, 0).png().toBuffer();
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: "transparent" } })
  .composite([
    { input: shadow, top: 112, left: 100, blend: "over" },
    { input: await roundedCorners(square, 824, 185), top: 96, left: 100 },
  ])
  .png()
  .toFile(path("apps/desktop/assets/icon-macos.png"));

// Icon Composer source for macOS Tahoe and iOS: one opaque full-bleed layer.
const composer = "packages/ui-tokens/assets/Rakazo.icon";
await rm(path(`${composer}/Assets`), { recursive: true, force: true });
await mkdir(path(`${composer}/Assets`), { recursive: true });
await png(square, `${composer}/Assets/hire-shelby.png`, 1024);

// Mobile.
await png(square, "apps/mobile/assets/icon.png", 1024);
await png(rounded, "apps/mobile/assets/favicon.png", 128);
await writeFile(
  path("apps/mobile/assets/adaptive-icon.png"),
  await safeZone("hire-shelby-foreground.svg"),
);
await sharp({ create: { width: 1024, height: 1024, channels: 3, background: BACKGROUND } })
  .png()
  .toFile(path("apps/mobile/assets/icon-background.png"));
await writeFile(
  path("apps/mobile/assets/monochrome-icon.png"),
  await safeZone("hire-shelby-monochrome.svg"),
);
// The splash shows the rounded icon, which reads on both the light and dark splash colours.
await sharp(rounded)
  .resize(620, 620)
  .extend({ top: 202, bottom: 202, left: 202, right: 202, background: "transparent" })
  .png()
  .toFile(path("apps/mobile/assets/splash-icon.png"));

// Android notification icons must be white alpha silhouettes.
const silhouette = await sharp(path("apps/mobile/assets/monochrome-icon.png"))
  .resize(72, 72)
  .extractChannel("alpha")
  .toBuffer();
await sharp({ create: { width: 72, height: 72, channels: 3, background: "white" } })
  .joinChannel(silhouette)
  .png()
  .toFile(path("apps/mobile/assets/notification-icon.png"));
