import fs from "fs";
import path from "path";
import zlib from "zlib";

const distPath = new URL("../artifacts/x-toolkit-extension/dist", import.meta.url).pathname;
const outputPath = new URL("../x-toolkit-extension-v1.0.0.zip", import.meta.url).pathname;

function getAllFiles(dir, base = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...getAllFiles(full, base));
    else files.push({ full, rel: path.relative(base, full).replace(/\\/g, "/") });
  }
  return files;
}

function u32(n) { const b = Buffer.alloc(4); b.writeUInt32LE(n >>> 0, 0); return b; }
function u16(n) { const b = Buffer.alloc(2); b.writeUInt16LE(n & 0xffff, 0); return b; }

function crc32(buf) {
  const t = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = t[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

const files = getAllFiles(distPath);
const localParts = [];
const cdParts = [];
let offset = 0;

for (const { full, rel } of files) {
  const data = fs.readFileSync(full);
  const comp = zlib.deflateRawSync(data, { level: 6 });
  const useComp = comp.length < data.length;
  const fd = useComp ? comp : data;
  const crc = crc32(data);
  const name = Buffer.from(rel, "utf8");

  const lh = Buffer.concat([
    Buffer.from([0x50,0x4b,0x03,0x04]),
    u16(20), u16(0), u16(useComp ? 8 : 0),
    u16(0), u16(0),
    u32(crc), u32(fd.length), u32(data.length),
    u16(name.length), u16(0),
    name,
  ]);

  const cd = Buffer.concat([
    Buffer.from([0x50,0x4b,0x01,0x02]),
    u16(20), u16(20), u16(0), u16(useComp ? 8 : 0),
    u16(0), u16(0),
    u32(crc), u32(fd.length), u32(data.length),
    u16(name.length), u16(0), u16(0), u16(0), u16(0),
    u32(0), u32(offset),
    name,
  ]);

  localParts.push(lh, fd);
  cdParts.push(cd);
  offset += lh.length + fd.length;
}

const cdBuf = Buffer.concat(cdParts);
const eocd = Buffer.concat([
  Buffer.from([0x50,0x4b,0x05,0x06]),
  u16(0), u16(0),
  u16(files.length), u16(files.length),
  u32(cdBuf.length), u32(offset),
  u16(0),
]);

fs.writeFileSync(outputPath, Buffer.concat([...localParts, cdBuf, eocd]));
const size = fs.statSync(outputPath).size;
console.log(`ZIP created: ${outputPath} (${(size/1024).toFixed(1)} KB)`);
