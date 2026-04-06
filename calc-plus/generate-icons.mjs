// generate-icons.mjs
// Run: node generate-icons.mjs
// Requires: npm install canvas

import { createCanvas } from "canvas";
import fs from "fs";
import path from "path";

const OUT = "./public/icons";
fs.mkdirSync(OUT, { recursive: true });

const SIZES = [32, 152, 180, 192, 512];

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const r = size * 0.18; // corner radius

  // Background — warm stone
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, "#e8e4e0");
  bg.addColorStop(1, "#cac6c2");
  ctx.fillStyle = bg;
  roundRect(ctx, 0, 0, size, size, r);
  ctx.fill();

  // Inner shadow / depth
  const shadow = ctx.createLinearGradient(0, 0, 0, size);
  shadow.addColorStop(0, "rgba(255,255,255,0.5)");
  shadow.addColorStop(1, "rgba(0,0,0,0.08)");
  ctx.fillStyle = shadow;
  roundRect(ctx, 0, 0, size, size, r);
  ctx.fill();

  // Draw "+" symbol — big dark slab
  const cx = size / 2;
  const cy = size / 2;
  const thick = size * 0.13;
  const arm   = size * 0.38;

  ctx.fillStyle = "#1c1c1c";
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = size * 0.04;
  ctx.shadowOffsetY = size * 0.025;

  // Horizontal bar
  roundRect(ctx, cx - arm, cy - thick / 2, arm * 2, thick, thick / 2);
  ctx.fill();

  // Vertical bar
  roundRect(ctx, cx - thick / 2, cy - arm, thick, arm * 2, thick / 2);
  ctx.fill();

  ctx.shadowColor = "transparent";

  return canvas;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

for (const size of SIZES) {
  const canvas = drawIcon(size);
  const buf = canvas.toBuffer("image/png");
  const file = path.join(OUT, `icon-${size}.png`);
  fs.writeFileSync(file, buf);
  console.log(`✓ icon-${size}.png`);
}

// Also write an SVG version for favicon
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="18" fill="#e2dedb"/>
  <rect x="44" y="22" width="12" height="56" rx="6" fill="#1c1c1c"/>
  <rect x="22" y="44" width="56" height="12" rx="6" fill="#1c1c1c"/>
</svg>`;
fs.writeFileSync(path.join(OUT, "icon.svg"), svg);
console.log("✓ icon.svg");
console.log("\nAll icons generated in public/icons/");
