import assert from "node:assert/strict";
import { test } from "node:test";
import { deflateSync } from "node:zlib";
import { decodePng, samePixels } from "../scripts/screenshots.mjs";

// Minimal 8-bit RGB PNG encoder (no CRC check on read), with a choice of row filter and compression level.
const png = (w, h, rgb, { filter = 0, level = 6 } = {}) => {
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    return Buffer.concat([len, Buffer.from(type, "latin1"), data, Buffer.alloc(4)]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const rows = [];
  for (let y = 0; y < h; y++) {
    const row = rgb.subarray(y * w * 3, (y + 1) * w * 3);
    // Filter 1 (Sub): each byte minus the byte one pixel to its left.
    const line = filter === 1 ? row.map((v, x) => (v - (x >= 3 ? row[x - 3] : 0)) & 0xff) : row;
    rows.push(Buffer.from([filter]), Buffer.from(line));
  }
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", deflateSync(Buffer.concat(rows), { level })), chunk("IEND", Buffer.alloc(0))]);
};
const image = (w, h) => Buffer.from(Array.from({ length: w * h * 3 }, (_, i) => (i * 37) % 256));

// The screenshot workflow committed byte-different PNGs whose pixels had not changed (another encoder).
test("screenshots: re-encoded identical pixels count as unchanged, a real change does not", () => {
  const px = image(40, 30);
  const a = png(40, 30, px);
  const b = png(40, 30, px, { filter: 1, level: 9 });
  assert.notDeepEqual(a, b);
  assert.deepEqual(decodePng(b).pixels, px);
  assert.ok(samePixels(a, b));
  // A few anti-aliasing levels on a handful of values: still the same image.
  const aa = Buffer.from(px);
  for (const i of [5, 99, 1200]) aa[i] = (aa[i] + 5) % 256;
  assert.ok(samePixels(a, png(40, 30, aa)));
  // One clearly different pixel, many slightly different values, or another size: changed.
  const one = Buffer.from(px);
  one[300] = (one[300] + 128) % 256;
  assert.ok(!samePixels(a, png(40, 30, one)));
  const many = Buffer.from(px).map((v, i) => (i % 7 ? v : (v + 3) % 256));
  assert.ok(!samePixels(a, png(40, 30, many)));
  assert.ok(!samePixels(a, png(30, 40, px)));
});
