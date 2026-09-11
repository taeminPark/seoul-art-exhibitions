#!/usr/bin/env node
// 외부 이미지 라이브러리 없이 PNG를 직접 인코딩해 앱 아이콘을 만든다.
// 디자인: 검은 배경 + 액센트 블루 액자 프레임 + 흰색 "산/해" 그림 모티프.

import { deflateSync } from "node:zlib";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const BLACK = [0, 0, 0, 255];
const ACCENT = [10, 132, 255, 255];
const WHITE = [245, 245, 247, 255];

function drawIcon(size) {
  const px = new Array(size * size).fill(null).map(() => BLACK);
  const set = (x, y, color) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    px[y * size + x] = color;
  };

  const margin = Math.round(size * 0.16);
  const frameW = Math.max(2, Math.round(size * 0.035));

  // 액자 프레임 (사각형 테두리)
  for (let y = margin; y < size - margin; y++) {
    for (let x = margin; x < size - margin; x++) {
      const onBorder =
        x < margin + frameW ||
        x >= size - margin - frameW ||
        y < margin + frameW ||
        y >= size - margin - frameW;
      if (onBorder) set(x, y, ACCENT);
    }
  }

  // 액자 안쪽 그림: 해(원) + 산(삼각형)
  const innerLeft = margin + frameW;
  const innerRight = size - margin - frameW;
  const innerTop = margin + frameW;
  const innerBottom = size - margin - frameW;
  const innerW = innerRight - innerLeft;
  const innerH = innerBottom - innerTop;

  // 해
  const sunCx = innerLeft + innerW * 0.68;
  const sunCy = innerTop + innerH * 0.32;
  const sunR = innerW * 0.14;
  for (let y = innerTop; y < innerBottom; y++) {
    for (let x = innerLeft; x < innerRight; x++) {
      const dx = x - sunCx;
      const dy = y - sunCy;
      if (dx * dx + dy * dy <= sunR * sunR) set(x, y, WHITE);
    }
  }

  // 산 (두 개의 삼각형, 겹치게)
  function fillTriangle(apexX, apexY, baseY, halfBase, color) {
    for (let y = Math.round(apexY); y < baseY; y++) {
      const t = (y - apexY) / (baseY - apexY);
      const half = halfBase * t;
      const xStart = Math.round(apexX - half);
      const xEnd = Math.round(apexX + half);
      for (let x = xStart; x <= xEnd; x++) set(x, y, color);
    }
  }

  const baseY = innerBottom - innerH * 0.06;
  fillTriangle(innerLeft + innerW * 0.32, innerTop + innerH * 0.34, baseY, innerW * 0.34, WHITE);
  fillTriangle(innerLeft + innerW * 0.66, innerTop + innerH * 0.48, baseY, innerW * 0.3, ACCENT);

  return px;
}

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePNG(pixels, size) {
  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 4);
    raw[rowStart] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixels[y * size + x];
      const o = rowStart + 1 + x * 4;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const idat = deflateSync(raw);

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

async function main() {
  for (const size of [180, 512]) {
    const png = encodePNG(drawIcon(size), size);
    const filename = size === 512 ? "icon-512.png" : "icon-180.png";
    await writeFile(path.join(ROOT, filename), png);
    console.log(`생성됨: ${filename} (${size}x${size}, ${png.length} bytes)`);
  }
}

main();
