#!/usr/bin/env node
/**
 * Merges scraped-properties.json into data.ts
 * Run AFTER scrape-vision.js completes
 */

const fs = require("fs");
const path = require("path");

const JSON_PATH = path.join(__dirname, "../src/lib/scraped-properties.json");
const DATA_PATH = path.join(__dirname, "../src/lib/data.ts");

if (!fs.existsSync(JSON_PATH)) {
  console.error("❌ scraped-properties.json not found. Run 'npm run scrape' first.");
  process.exit(1);
}

const scraped = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
const dataContent = fs.readFileSync(DATA_PATH, "utf8");

console.log(`\n✅ Loaded ${scraped.properties.length} enhanced properties`);
console.log(`✅ Loaded ${scraped.images.length} downloaded images\n`);

// Map scraped data to PROPERTIES array format
// We'll match by name similarity or page type
const IMAGE_TYPES = {
  "CoWork": scraped.images.filter(i => i.pageType === "CoWork"),
  "Commercial RE": scraped.images.filter(i => i.pageType === "Commercial RE"),
  "Homepage": scraped.images.filter(i => i.pageType === "Homepage"),
  "Development": scraped.images.filter(i => i.pageType === "Development"),
  "Executive": scraped.images.filter(i => i.pageType === "Executive"),
};

// Print what we found
console.log("📊 Images by type:");
Object.entries(IMAGE_TYPES).forEach(([type, imgs]) => {
  console.log(`  ${type}: ${imgs.length} images`);
  imgs.forEach(img => console.log(`    → ${img.localPath} (${img.alt || "no alt"})`));
});

console.log("\n📝 AI-Enhanced Property Descriptions:");
scraped.properties.forEach((p, i) => {
  console.log(`\n  ${i + 1}. ${p.name} [${p.type}]`);
  console.log(`     SEO: ${p.seoDescription}`);
});

// Generate the updated PROPERTIES array TypeScript code
const propertyMappings = scraped.properties.map((prop, i) => {
  // Find a matching image from the same page type
  const matchingImages = IMAGE_TYPES[prop.type] || IMAGE_TYPES["Homepage"] || [];
  const image = matchingImages[0]?.localPath || null;

  return {
    id: prop.id || `scraped-${i + 1}`,
    name: prop.name,
    type: prop.type,
    description: prop.seoDescription,
    rawDescription: prop.rawDescription,
    image,
    pageUrl: prop.pageUrl,
  };
});

// Output report
const report = {
  generatedAt: new Date().toISOString(),
  properties: propertyMappings,
  imagesByType: Object.fromEntries(
    Object.entries(IMAGE_TYPES).map(([k, v]) => [k, v.map(i => i.localPath)])
  ),
};

const REPORT_PATH = path.join(__dirname, "../src/lib/scrape-report.json");
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

console.log(`\n💾 Report saved to: ${REPORT_PATH}`);
console.log("\n📋 Paste this into your PROPERTIES array in data.ts:\n");

// Print ready-to-paste TypeScript
propertyMappings.forEach((p, i) => {
  console.log(`  {`);
  console.log(`    id: "${p.id}",`);
  console.log(`    name: "${p.name.replace(/"/g, '\\"')}",`);
  console.log(`    type: "${p.type}",`);
  console.log(`    sqft: "Contact for sizing",`);
  console.log(`    status: "available" as const,`);
  console.log(`    location: "Bristol, TN",`);
  console.log(`    description: "${p.description.replace(/"/g, '\\"')}",`);
  console.log(`    features: [],`);
  if (p.image) console.log(`    image: "${p.image}",`);
  console.log(`    badge: "${p.type}",`);
  console.log(`    badgeColor: "green" as const,`);
  console.log(`  },`);
  if (i < propertyMappings.length - 1) console.log();
});

console.log("\n✅ Done! Copy the above into src/lib/data.ts PROPERTIES array.\n");
