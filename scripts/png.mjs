// PNG comparison for the screenshot script, without dependencies (the tests run without npm install).
import { inflateSync } from "node:zlib";

// Decodes a non-interlaced 8-bit PNG (what Chromium screenshots are) to its header and raw pixel rows.
export function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");
  let header, idat = [];
  for (let at = 8; at < buf.length; ) {
    const len = buf.readUInt32BE(at), type = buf.toString("latin1", at + 4, at + 8), data = buf.subarray(at + 8, at + 8 + len);
    if (type === "IHDR") header = { w: data.readUInt32BE(0), h: data.readUInt32BE(4), depth: data[8], color: data[9], interlace: data[12] };
    else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    at += 12 + len;
  }
  if (!header || header.depth !== 8 || header.interlace) throw new Error("unsupported PNG");
  const bpp = { 0: 1, 2: 3, 4: 2, 6: 4 }[header.color];
  if (!bpp) throw new Error("unsupported PNG colour type");
  const raw = inflateSync(Buffer.concat(idat)), stride = header.w * bpp, out = Buffer.alloc(stride * header.h);
  for (let y = 0; y < header.h; y++) {
    const filter = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const row = out.subarray(y * stride, (y + 1) * stride), up = y ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? row[x - bpp] : 0, b = up ? up[x] : 0, c = up && x >= bpp ? up[x - bpp] : 0;
      let p = 0;
      if (filter === 1) p = a;
      else if (filter === 2) p = b;
      else if (filter === 3) p = (a + b) >> 1;
      else if (filter === 4) {
        const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
        p = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      row[x] = (line[x] + p) & 0xff;
    }
  }
  return { ...header, pixels: out };
}

// Whether two PNG files show the same image, whatever their compression: same size and colour type, and at most
// a few anti-aliasing values apart (a handful of channel values off by a few levels where a box edge moved by a
// fraction of a pixel). Any visible change touches far more values, or moves them further.
export function samePixels(a, b) {
  const [x, y] = [decodePng(a), decodePng(b)];
  if (x.w !== y.w || x.h !== y.h || x.color !== y.color) return false;
  const budget = Math.max(16, Math.floor(x.pixels.length / 100000));
  let differing = 0;
  for (let i = 0; i < x.pixels.length; i++) {
    const d = Math.abs(x.pixels[i] - y.pixels[i]);
    if (d && (d > 24 || ++differing > budget)) return false;
  }
  return true;
}
