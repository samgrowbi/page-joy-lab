import sharp from "sharp";
import { readdir, stat } from "fs/promises";
import path from "path";

const ROOT = "src/assets";

// Per-directory/file size policies
function policyFor(filename, dir) {
  const lower = filename.toLowerCase();
  // Logos / partner strips → keep transparency where present, max 800px
  if (
    lower.includes("logo") ||
    lower.includes("partners") ||
    lower.includes("google-maps") ||
    lower.includes("yelp") ||
    lower.includes("trustpilot")
  ) {
    return { maxWidth: 800, quality: 82 };
  }
  // Icons → small
  if (dir.endsWith("/icons")) return { maxWidth: 256, quality: 85 };
  // Posters (video) → moderate
  if (lower.endsWith("-poster.png")) return { maxWidth: 800, quality: 75 };
  // Before/After cards
  if (/^a\d+-(before|after)\./i.test(lower)) return { maxWidth: 1100, quality: 75 };
  // Hero / full-bleed / thankyou / about / gallery / body / booking
  return { maxWidth: 1600, quality: 78 };
}

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

const files = (await walk(ROOT)).filter((f) =>
  /\.(png|jpe?g)$/i.test(f)
);

let savedTotal = 0, beforeTotal = 0;
for (const file of files) {
  const dir = path.dirname(file);
  const base = path.basename(file);
  const { maxWidth, quality } = policyFor(base, dir);
  const webpPath = file.replace(/\.(png|jpe?g)$/i, ".webp");
  const before = (await stat(file)).size;
  beforeTotal += before;
  try {
    const img = sharp(file).rotate();
    const meta = await img.metadata();
    const pipeline = (meta.width && meta.width > maxWidth)
      ? img.resize({ width: maxWidth, withoutEnlargement: true })
      : img;
    await pipeline.webp({ quality, effort: 5 }).toFile(webpPath);
    const after = (await stat(webpPath)).size;
    savedTotal += before - after;
    console.log(`${base.padEnd(40)} ${(before/1024).toFixed(0).padStart(6)}KB -> ${(after/1024).toFixed(0).padStart(6)}KB  (${meta.width}px)`);
  } catch (e) {
    console.error("FAIL", file, e.message);
  }
}
console.log(`\nTOTAL: ${(beforeTotal/1024/1024).toFixed(1)}MB -> ${((beforeTotal-savedTotal)/1024/1024).toFixed(1)}MB  (saved ${(savedTotal/1024/1024).toFixed(1)}MB)`);
