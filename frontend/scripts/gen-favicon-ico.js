/**
 * Generate a minimal multi-size favicon.ico with CAITECH brand mark.
 * Pure Node — no sharp/png-to-ico deps.
 */
const fs = require("fs");
const path = require("path");

function color(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}
const BG = color("#12343B");
const BAR = color("#C7F000");
const FG = color("#F5F5F0");

const C_GLYPH = [
  "01110",
  "10001",
  "10000",
  "10000",
  "10000",
  "10001",
  "01110",
];

function renderRgba(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const barH = Math.max(1, Math.round((size * 3) / 32));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const c = y < barH ? BAR : BG;
      pixels[i] = c[0];
      pixels[i + 1] = c[1];
      pixels[i + 2] = c[2];
      pixels[i + 3] = c[3];
    }
  }
  const gw = 5;
  const gh = 7;
  const scale = Math.max(1, Math.floor((size * 0.45) / Math.max(gw, gh)));
  const tw = gw * scale;
  const th = gh * scale;
  const ox = Math.floor((size - tw) / 2);
  const oy = Math.floor((size - th) / 2) + Math.floor(barH / 2);
  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      if (C_GLYPH[gy][gx] !== "1") continue;
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const x = ox + gx * scale + sx;
          const y = oy + gy * scale + sy;
          if (x < 0 || y < 0 || x >= size || y >= size) continue;
          const i = (y * size + x) * 4;
          pixels[i] = FG[0];
          pixels[i + 1] = FG[1];
          pixels[i + 2] = FG[2];
          pixels[i + 3] = FG[3];
        }
      }
    }
  }
  return pixels;
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function deflateStore(data) {
  const chunks = [];
  let offset = 0;
  const MAX = 65535;
  while (offset < data.length) {
    const end = Math.min(offset + MAX, data.length);
    const slice = data.subarray(offset, end);
    const last = end === data.length ? 1 : 0;
    const header = Buffer.alloc(5);
    header[0] = last;
    header.writeUInt16LE(slice.length, 1);
    header.writeUInt16LE(slice.length ^ 0xffff, 3);
    chunks.push(header, slice);
    offset = end;
  }
  const raw = Buffer.concat(chunks);
  let a = 1;
  let b = 0;
  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]) % 65521;
    b = (b + a) % 65521;
  }
  const adler = Buffer.alloc(4);
  adler.writeUInt32BE(((b << 16) | a) >>> 0);
  return Buffer.concat([Buffer.from([0x78, 0x01]), raw, adler]);
}

function encodePng(size, rgbaTopDown) {
  const stride = 1 + size * 4;
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0;
    rgbaTopDown.copy(raw, y * stride + 1, y * size * 4, (y + 1) * size * 4);
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateStore(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function buildIco(sizes) {
  const images = sizes.map((s) => ({ size: s, png: encodePng(s, renderRgba(s)) }));
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  let offset = 6 + count * 16;
  const entries = [];
  const blobs = [];
  for (const img of images) {
    const e = Buffer.alloc(16);
    e[0] = img.size >= 256 ? 0 : img.size;
    e[1] = img.size >= 256 ? 0 : img.size;
    e[2] = 0;
    e[3] = 0;
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(img.png.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    blobs.push(img.png);
    offset += img.png.length;
  }
  return Buffer.concat([header, ...entries, ...blobs]);
}

const out = path.join(__dirname, "..", "app", "favicon.ico");
const ico = buildIco([16, 32]);
fs.writeFileSync(out, ico);
console.log("Wrote", out, ico.length, "bytes");
