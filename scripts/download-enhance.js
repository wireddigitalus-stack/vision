#!/usr/bin/env node
/**
 * Phase 2: Download scraped images + Gemini AI SEO Enhancement
 * No puppeteer needed — uses direct CDN URLs extracted from the browser scrape.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
const https = require("https");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDYTtPYWA623cnugup_lw_WbbN_Y1iAxDw";
const IMAGES_DIR = path.join(__dirname, "../public/property-images");
const OUTPUT_JSON = path.join(__dirname, "../src/lib/scraped-properties.json");

// ── Real scraped image URLs from teamvisionllc.com CDN ─────────────────────
const SCRAPED_IMAGES = [
  { url: "https://lirp.cdn-website.com/49369e6c/dms3rep/multi/opt/The+Executive+Tall+Image-1920w.png", filename: "commercial-executive-entry.jpg", alt: "The Executive Office Entry", property: "The Executive" },
  { url: "https://lirp.cdn-website.com/49369e6c/dms3rep/multi/opt/Centre+Point+Tall+Image-1920w.png", filename: "commercial-centerpoint-mall.jpg", alt: "Centre Point Strip Mall", property: "Centre Point Suites" },
  { url: "https://lirp.cdn-website.com/49369e6c/dms3rep/multi/opt/city+centre+outside+1-1920w.jpg", filename: "commercial-city-centre-exterior.jpg", alt: "City Centre Building Exterior", property: "City Centre" },
  { url: "https://lirp.cdn-website.com/49369e6c/dms3rep/multi/opt/Vision+Tall+Slim+Images-1920w.png", filename: "commercial-vision-office.jpg", alt: "Vision LLC Office Space", property: "Vision Office" },
  { url: "https://lirp.cdn-website.com/49369e6c/dms3rep/multi/opt/centerpoint-2-1920w.png", filename: "commercial-centerpoint-2.jpg", alt: "Centre Point Exterior", property: "Centre Point Suites" },
  { url: "https://lirp.cdn-website.com/49369e6c/dms3rep/multi/opt/office+space+pic+1-1920w.jpg", filename: "cowork-shared-office.jpg", alt: "Bristol CoWork Shared Workspace", property: "Bristol CoWork" },
  { url: "https://lirp.cdn-website.com/49369e6c/dms3rep/multi/opt/office+space+11-1920w.jpg", filename: "cowork-conference-room.jpg", alt: "Bristol CoWork Conference Room", property: "Bristol CoWork" },
  { url: "https://lirp.cdn-website.com/49369e6c/dms3rep/multi/opt/office+space+pic+4-1920w.jpg", filename: "cowork-lobby-waiting.jpg", alt: "Bristol CoWork Lobby and Waiting Area", property: "Bristol CoWork" },
  { url: "https://lirp.cdn-website.com/49369e6c/dms3rep/multi/opt/office+space+10-63af29d3-1920w.jpg", filename: "cowork-private-office.jpg", alt: "Bristol CoWork Private Office", property: "Bristol CoWork" },
  { url: "https://lirp.cdn-website.com/49369e6c/dms3rep/multi/opt/construction-built-11-1920w.png", filename: "development-event-space-after.jpg", alt: "Foundation Event Facility Completed", property: "Foundation Event Facility" },
  { url: "https://lirp.cdn-website.com/49369e6c/dms3rep/multi/opt/construction+build+8-1920w.jpg", filename: "development-construction.jpg", alt: "Vision LLC Commercial Construction", property: "Development & Construction" },
  { url: "https://lirp.cdn-website.com/49369e6c/dms3rep/multi/opt/red+pepper+before+and+after-1920w.png", filename: "development-red-pepper-transform.jpg", alt: "Red Pepper Building Transformation", property: "Development & Construction" },
];

// ── Real scraped property data from teamvisionllc.com ──────────────────────
const SCRAPED_PROPERTIES = [
  {
    id: "city-centre",
    name: "City Centre Professional Suites",
    type: "Office / Mixed-Use",
    sqft: "1,200 – 18,000+",
    rawDescription: "City Centre is Vision LLC's flagship mixed-use development in the heart of Downtown Bristol. Premium street-level retail with executive office suites above. Located at the center of Bristol's growing business district with private parking available.",
    location: "Bristol, TN",
    images: ["commercial-city-centre-exterior.jpg"],
    features: ["Street-Level Retail", "Executive Suites", "Private Parking", "Downtown Location"],
    badge: "Featured",
    badgeColor: "green",
    status: "available",
  },
  {
    id: "bristol-cowork",
    name: "Bristol CoWork",
    type: "CoWorking Space",
    sqft: "5,000+",
    rawDescription: "Bristol CoWork at 620 State Street is our newest commercial facility. It offers a range of modern commercial leasing options tailored to meet the needs of modern business professionals. From shared workspaces and private offices to fully equipped conference rooms, our brand new facility is designed to foster productivity and collaboration, all while keeping costs low. Amenities include power, water, high-speed internet, and shared conference space.",
    location: "620 State Street, Bristol, TN",
    images: ["cowork-shared-office.jpg", "cowork-conference-room.jpg", "cowork-lobby-waiting.jpg", "cowork-private-office.jpg"],
    features: ["Private Offices", "Dedicated Desks", "Conference Rooms", "High-Speed Internet", "Fully Furnished"],
    badge: "CoWork",
    badgeColor: "blue",
    status: "memberships",
  },
  {
    id: "the-executive",
    name: "The Executive — Premier Office Suites",
    type: "Office",
    sqft: "500 – 12,000",
    rawDescription: "Premier office suites in a meticulously restored historic building in Downtown Bristol. Full-service amenities include professional address, mail handling, and on-demand meeting rooms. The Executive offers flexible lease terms ideal for professional services, law firms, and growing businesses.",
    location: "Bristol, TN",
    images: ["commercial-executive-entry.jpg"],
    features: ["Historic Building", "Full-Service Amenities", "Professional Address", "Flexible Leasing"],
    badge: "Premium",
    badgeColor: "gold",
    status: "available",
  },
  {
    id: "centre-point-suites",
    name: "Centre Point Suites",
    type: "Retail / Office",
    sqft: "800 – 5,000",
    rawDescription: "Centre Point is a high-visibility retail and office complex strategically positioned along one of Bristol's highest-traffic corridors. Anchor tenants, signage opportunities, and ample parking make it ideal for retail businesses, personal service providers, and medical offices.",
    location: "Bristol, TN",
    images: ["commercial-centerpoint-mall.jpg", "commercial-centerpoint-2.jpg"],
    features: ["High-Traffic Location", "Retail Storefronts", "Ample Parking", "Signage Opportunities"],
    badge: "High-Traffic",
    badgeColor: "green",
    status: "units",
  },
  {
    id: "foundation-event-facility",
    name: "Foundation Event Facility",
    type: "Event Space / Commercial",
    sqft: "3,000 – 8,000",
    rawDescription: "The Foundation Event Facility (FEF) is a landmark adaptive reuse project by Vision LLC — a historic building transformed into a versatile event and commercial space in Downtown Bristol. Available for long-term commercial lease or short-term event bookings.",
    location: "Bristol, TN",
    images: ["development-event-space-after.jpg"],
    features: ["Historic Adaptive Reuse", "Event Space", "Commercial Lease", "Downtown Bristol"],
    badge: "Unique",
    badgeColor: "gold",
    status: "available",
  },
  {
    id: "commercial-warehouse",
    name: "Commercial Warehouse Space",
    type: "Industrial",
    sqft: "2,000 – 25,000",
    rawDescription: "Flexible commercial warehouse and light industrial space in the Bristol metro area. Loading docks, high ceilings, and 3-phase power available. Ideal for distribution, light manufacturing, storage, and contractor operations in the Tri-Cities region.",
    location: "Bristol, TN",
    images: ["development-construction.jpg"],
    features: ["Loading Docks", "High Ceilings", "3-Phase Power", "Light Industrial"],
    badge: "Industrial",
    badgeColor: "gray",
    status: "available",
  },
];

// ─── Download helper ─────────────────────────────────────────────────────────
function downloadImage(imageUrl, destPath) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(destPath);
    const req = https.get(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Referer": "https://www.teamvisionllc.com/",
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlink(destPath, () => {});
        return downloadImage(res.headers.location, destPath).then(resolve);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(destPath, () => {});
        console.log(`    ⚠️  HTTP ${res.statusCode}`);
        return resolve(false);
      }
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(true); });
    });
    req.on("error", (err) => {
      fs.unlink(destPath, () => {});
      console.log(`    ⚠️  Network error: ${err.message}`);
      resolve(false);
    });
    req.setTimeout(15000, () => {
      req.destroy();
      fs.unlink(destPath, () => {});
      console.log(`    ⚠️  Timeout`);
      resolve(false);
    });
  });
}

// ─── Gemini Enhancement ──────────────────────────────────────────────────────
async function enhanceWithGemini(genAI, property) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const prompt = `You are a senior commercial real estate SEO copywriter specializing in the Tri-Cities region (Bristol TN, Kingsport TN, Johnson City TN, Southwest Virginia).

PROPERTY NAME: "${property.name}"
TYPE: ${property.type}
LOCATION: ${property.location}
SQUARE FOOTAGE: ${property.sqft} sqft
KEY FEATURES: ${property.features.join(", ")}
ORIGINAL DESCRIPTION: "${property.rawDescription}"

Task: Write a premium, SEO-optimized 2-3 sentence commercial real estate listing description that:
1. Opens with the property's strongest selling point
2. Naturally includes 1-2 local SEO phrases ("Bristol TN commercial real estate", "Tri-Cities" OR "Downtown Bristol commercial space") 
3. Includes relevant commercial terms (lease terms, sqft, use cases, amenities)
4. Ends with a strong benefit statement (not a call to action)
5. Sounds authoritative and professional — like it belongs on a premium CRE platform
6. NEVER use: "nestled", "boasting", "vibrant", "stunning", "state-of-the-art", or "perfect for"

Return ONLY the description text. No quotes, no preamble, no em-dashes at the start.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim().replace(/^["']|["']$/g, "");
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function run() {
  console.log("\n🚀 Vision LLC — Property Image Download + AI SEO Enhancement");
  console.log("━".repeat(60));

  // Ensure output dirs exist
  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  // Step 1: Download images
  console.log(`\n⬇️  Downloading ${SCRAPED_IMAGES.length} property images from CDN...`);
  const downloadResults = [];
  
  for (const img of SCRAPED_IMAGES) {
    const destPath = path.join(IMAGES_DIR, img.filename);
    process.stdout.write(`  ${img.filename}... `);
    
    if (fs.existsSync(destPath)) {
      console.log(`✅ (cached)`);
      downloadResults.push({ ...img, localPath: `/property-images/${img.filename}`, success: true });
      continue;
    }
    
    const success = await downloadImage(img.url, destPath);
    console.log(success ? "✅" : "❌");
    downloadResults.push({ ...img, localPath: `/property-images/${img.filename}`, success });
    await new Promise(r => setTimeout(r, 400));
  }

  const successCount = downloadResults.filter(r => r.success).length;
  console.log(`\n  → Downloaded ${successCount}/${SCRAPED_IMAGES.length} images`);

  // Step 2: AI enhance property descriptions
  console.log(`\n🤖 Running Gemini AI on ${SCRAPED_PROPERTIES.length} property descriptions...`);
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  
  const enhancedProperties = [];
  
  for (const property of SCRAPED_PROPERTIES) {
    console.log(`\n  📋 ${property.name}`);
    console.log(`     Original: "${property.rawDescription.substring(0, 70)}..."`);
    
    let seoDescription = property.rawDescription;
    try {
      seoDescription = await enhanceWithGemini(genAI, property);
      console.log(`     ✨ Enhanced: "${seoDescription.substring(0, 70)}..."`);
    } catch (err) {
      console.log(`     ⚠️  Gemini error: ${err.message} — using original`);
    }
    
    // Find matching downloaded images for this property
    const propertyImages = downloadResults
      .filter(img => img.property === property.name && img.success)
      .map(img => img.localPath);

    enhancedProperties.push({
      ...property,
      description: seoDescription,
      downloadedImages: propertyImages,
    });
    
    await new Promise(r => setTimeout(r, 600));
  }

  // Step 3: Write output JSON
  const output = {
    scrapedAt: new Date().toISOString(),
    sourceUrl: "https://www.teamvisionllc.com",
    totalImages: successCount,
    totalProperties: enhancedProperties.length,
    images: downloadResults,
    properties: enhancedProperties,
  };
  
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2));

  // Step 4: Print TypeScript-ready data
  console.log("\n" + "━".repeat(60));
  console.log("✅ COMPLETE!\n");
  console.log(`📸 Images downloaded: ${successCount}/${SCRAPED_IMAGES.length}`);
  console.log(`🤖 Properties enhanced: ${enhancedProperties.length}`);
  console.log(`📄 Full JSON: ${OUTPUT_JSON}\n`);

  // Generate data.ts update
  console.log("📋 Ready-to-use TypeScript for data.ts PROPERTIES array:\n");
  console.log("export const PROPERTIES: Property[] = [");
  
  enhancedProperties.forEach((p, i) => {
    const primaryImage = p.downloadedImages[0] || null;
    console.log(`  {`);
    console.log(`    id: "${p.id}",`);
    console.log(`    name: "${p.name}",`);
    console.log(`    type: "${p.type}",`);
    console.log(`    sqft: "${p.sqft}",`);
    console.log(`    status: "${p.status}" as const,`);
    console.log(`    location: "${p.location}",`);
    console.log(`    description: \`${p.description.replace(/`/g, "'")}\`,`);
    console.log(`    features: [${p.features.map(f => `"${f}"`).join(", ")}],`);
    if (primaryImage) console.log(`    image: "${primaryImage}",`);
    if (p.downloadedImages.length > 1) console.log(`    images: [${p.downloadedImages.map(i => `"${i}"`).join(", ")}],`);
    console.log(`    badge: "${p.badge}",`);
    console.log(`    badgeColor: "${p.badgeColor}" as const,`);
    console.log(`  },`);
    if (i < enhancedProperties.length - 1) console.log();
  });
  
  console.log("];\n");
  console.log("💡 Run 'npm run update-data' to auto-merge into data.ts\n");
}

run().catch(err => {
  console.error("\n❌ Fatal:", err.message);
  process.exit(1);
});
