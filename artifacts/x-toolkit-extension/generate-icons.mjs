import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[i] = c;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (const b of buf) crc = CRC_TABLE[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const l = Buffer.allocUnsafe(4); l.writeUInt32BE(data.length);
  const c = Buffer.allocUnsafe(4); c.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([l, t, data, c]);
}
function makePNG(size, pixels) {
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr.writeUInt8(8, 8); ihdr.writeUInt8(6, 9); ihdr.fill(0, 10);
  const raw = [];
  for (let y = 0; y < size; y++) {
    raw.push(0);
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      raw.push(pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3]);
    }
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(Buffer.from(raw))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function drawIcon(size) {
  const pixels = new Uint8Array(size * size * 4);
  const cr = size * 0.22;
  const strokeW = Math.max(1.5, size * 0.11);
  const margin = size * 0.19;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      const i = (y * size + x) * 4;

      let outside = false;
      if (px < cr && py < cr) outside = Math.hypot(px - cr, py - cr) > cr;
      else if (px > size - cr && py < cr) outside = Math.hypot(px - (size - cr), py - cr) > cr;
      else if (px < cr && py > size - cr) outside = Math.hypot(px - cr, py - (size - cr)) > cr;
      else if (px > size - cr && py > size - cr) outside = Math.hypot(px - (size - cr), py - (size - cr)) > cr;

      if (outside) { pixels[i + 3] = 0; continue; }

      const d1 = Math.abs((px - size / 2) - (py - size / 2)) / Math.SQRT2;
      const along1 = ((px - margin) + (py - margin)) * 0.5;
      const d2 = Math.abs((px - size / 2) + (py - size / 2)) / Math.SQRT2;
      const along2 = ((px - margin) + (size - margin - py)) * 0.5;
      const span = size - 2 * margin;

      const onX =
        (d1 < strokeW && along1 >= 0 && along1 <= span) ||
        (d2 < strokeW && along2 >= 0 && along2 <= span);

      if (onX) {
        pixels[i] = 29; pixels[i + 1] = 155; pixels[i + 2] = 240; pixels[i + 3] = 255;
      } else {
        pixels[i] = 15; pixels[i + 1] = 23; pixels[i + 2] = 42; pixels[i + 3] = 255;
      }
    }
  }
  return pixels;
}

const outDir = resolve(__dirname, "public/icons");
mkdirSync(outDir, { recursive: true });

for (const size of [16, 32, 48, 128]) {
  const png = makePNG(size, drawIcon(size));
  writeFileSync(resolve(outDir, `icon${size}.png`), png);
  console.log(`  Generated icon${size}.png`);
}
console.log("Icons ready.");
