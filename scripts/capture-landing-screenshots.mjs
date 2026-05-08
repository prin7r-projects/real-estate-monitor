#!/usr/bin/env node
// Capture desktop + mobile screenshots from the live deploy.
// Usage: node scripts/capture-landing-screenshots.mjs [URL]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const URL = process.argv[2] || "https://real-estate-monitor.prin7r.com";

async function shoot(viewport, deviceScaleFactor, outPath) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport, deviceScaleFactor });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60_000 });
  // Allow web fonts to settle
  await page.waitForTimeout(1500);
  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();
  console.log(`[SKYLINE_SHOT] wrote ${outPath} (${viewport.width}x${viewport.height})`);
}

(async () => {
  const docsDir = resolve(__dirname, "..", "docs", "screenshots");
  await mkdir(docsDir, { recursive: true });
  await shoot({ width: 1440, height: 900 }, 2, resolve(docsDir, "landing-desktop.png"));
  await shoot({ width: 390, height: 844 }, 2, resolve(docsDir, "landing-mobile.png"));
})().catch((err) => {
  console.error("[SKYLINE_SHOT] failed", err);
  process.exit(1);
});
