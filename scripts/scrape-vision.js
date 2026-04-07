#!/usr/bin/env node
/**
 * Vision LLC Property Scraper + Gemini SEO Enhancer
 * 
 * Scrapes teamvisionllc.com for property images and descriptions,
 * then uses Gemini AI to enhance each description for local SEO.
 * 
 * Outputs: src/lib/scraped-properties.json (feed into data.ts)
 */

const puppeteer = require("puppeteer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// Point puppeteer to our /tmp cache where Chromium lives
process.env.PUPPETEER_CACHE_DIR = "/tmp/puppeteer-cache";

// ─── Config ────────────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDYTtPYWA623cnugup_lw_WbbN_Y1iAxDw";
const OUTPUT_JSON = path.join(__dirname, "../src/lib/scraped-properties.json");
const IMAGES_DIR = path.join(__dirname, "../public/property-images");

// Pages to scrape on teamvisionllc.com
const PAGES_TO_SCRAPE = [
  { url: "https://www.teamvisionllc.com/commercial-real-estate", type: "Commercial RE" },
  { url: "https://www.teamvisionllc.com/cowork", type: "CoWork" },
  { url: "https://www.teamvisionllc.com/", type: "Homepage" },
  { url: "https://www.teamvisionllc.com/development-construction", type: "Development" },
  { url: "https://www.teamvisionllc.com/executive-advisement", type: "Executive" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    // Skip data URIs and SVGs
    if (url.startsWith("data:") || url.includes(".svg")) return resolve(null);

    const protocol = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);
    
    protocol.get(url, { 
      headers: { 
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Referer": "https://www.teamvisionllc.com/"
      } 
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        return resolve(null);
      }
      res.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve(dest);
      });
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      resolve(null);
    });
  });
}

function slugify(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50);
}

// ─── Gemini SEO Enhancement ─────────────────────────────────────────────────
async function enhanceDescriptionWithGemini(genAI, propertyName, rawDescription, pageType) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const prompt = `You are an expert commercial real estate SEO copywriter specializing in the Tri-Cities region (Bristol TN/VA, Kingsport TN, Johnson City TN).

PROPERTY: "${propertyName}"
PAGE TYPE: ${pageType}
RAW DESCRIPTION: "${rawDescription}"

Your task: Rewrite this property description to be a high-converting, SEO-optimized listing. Requirements:
1. Start strong — lead with what makes this space unique and location-relevant
2. Naturally include LOCAL SEO keywords: "Bristol TN commercial real estate", "Tri-Cities commercial space", "Downtown Bristol commercial property" (use 1-2 max, naturally)
3. Include commercial real estate terms: sq ft, lease terms, amenities, business uses
4. End with a soft action CTA (no phone number or email)
5. Keep it 2-3 sentences max — punchy and scannable
6. Sound professional and authoritative, not generic
7. DO NOT use: "nestled", "boasting", "stunning", "vibrant", or other realtor clichés

Return ONLY the enhanced description text, no quotes, no preamble.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.warn(`  ⚠️  Gemini failed for "${propertyName}": ${err.message}`);
    return rawDescription;
  }
}

// ─── Main Scraper ────────────────────────────────────────────────────────────
async function scrape() {
  console.log("\n🔍 Vision LLC Property Scraper + AI Enhancer\n");
  console.log("━".repeat(50));

  // Ensure images dir exists
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  // Init Gemini
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  
  // Launch puppeteer using system Chrome (bypasses macOS sandbox issues)
  const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  
  console.log("\n🌐 Launching browser...");
  const browser = await puppeteer.launch({ 
    headless: true,
    executablePath: CHROME_PATH,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--disable-extensions",
    ]
  });

  const allProperties = [];
  const allImages = [];

  for (const pageConfig of PAGES_TO_SCRAPE) {
    console.log(`\n📄 Scraping: ${pageConfig.url}`);
    
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    await page.setViewport({ width: 1440, height: 900 });
    
    try {
      await page.goto(pageConfig.url, { 
        waitUntil: "networkidle2", 
        timeout: 30000 
      });
      
      // Wait for content
      await new Promise(r => setTimeout(r, 2000));

      // Extract all meaningful images
      const pageImages = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll("img"));
        return imgs.map(img => ({
          src: img.src || img.getAttribute("data-src") || img.getAttribute("data-lazy-src"),
          alt: img.alt || "",
          width: img.naturalWidth || img.offsetWidth,
          height: img.naturalHeight || img.offsetHeight,
        }))
        .filter(img => 
          img.src && 
          !img.src.startsWith("data:") && 
          !img.src.includes("logo") &&
          !img.src.includes("icon") &&
          !img.src.includes("favicon") &&
          img.width > 200 && 
          img.height > 150
        );
      });
      
      console.log(`  📸 Found ${pageImages.length} qualifying images`);
      pageImages.forEach(img => console.log(`     → ${img.alt || "(no alt)"} [${img.width}x${img.height}]`));

      // Extract text content - headings + descriptions near images
      const pageContent = await page.evaluate(() => {
        const sections = [];
        
        // Get all heading + following paragraph combos
        const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4"));
        headings.forEach(h => {
          const text = h.textContent.trim();
          if (text.length < 3) return;
          
          // Get following sibling paragraphs
          let description = "";
          let sibling = h.nextElementSibling;
          let attempts = 0;
          while (sibling && attempts < 5) {
            if (sibling.tagName === "P" || sibling.tagName === "DIV") {
              const sibText = sibling.textContent.trim();
              if (sibText.length > 30) {
                description += " " + sibText;
                break;
              }
            }
            sibling = sibling.nextElementSibling;
            attempts++;
          }

          if (text.length > 3) {
            sections.push({ heading: text, description: description.trim() });
          }
        });

        // Also get all paragraphs with meaningful content
        const paras = Array.from(document.querySelectorAll("p"))
          .map(p => p.textContent.trim())
          .filter(t => t.length > 50 && t.length < 500);

        return { sections, paras };
      });

      console.log(`  📝 Found ${pageContent.sections.length} heading/content sections`);
      
      // Combine images with content for this page
      const pageData = {
        url: pageConfig.url,
        type: pageConfig.type,
        images: pageImages,
        sections: pageContent.sections,
        paragraphs: pageContent.paras,
      };

      // Add images to global list
      allImages.push(...pageImages.map(img => ({ ...img, pageType: pageConfig.type, pageUrl: pageConfig.url })));

      // Create property records from sections that have good content
      for (const section of pageContent.sections) {
        if (section.heading.length > 5 && section.description.length > 30) {
          allProperties.push({
            name: section.heading,
            rawDescription: section.description,
            pageType: pageConfig.type,
            pageUrl: pageConfig.url,
          });
        }
      }

    } catch (err) {
      console.error(`  ❌ Error scraping ${pageConfig.url}: ${err.message}`);
    }
    
    await page.close();
    
    // Be polite to the server
    await new Promise(r => setTimeout(r, 1500));
  }

  await browser.close();
  console.log(`\n✅ Scraping complete. Found ${allImages.length} images, ${allProperties.length} potential property sections.`);

  // ─── Download Images ──────────────────────────────────────────────────────
  console.log("\n⬇️  Downloading images...");
  const downloadedImages = [];
  
  const uniqueImages = allImages.filter((img, idx, arr) => 
    arr.findIndex(i => i.src === img.src) === idx
  );

  for (let i = 0; i < uniqueImages.length; i++) {
    const img = uniqueImages[i];
    const ext = img.src.split("?")[0].match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[1] || "jpg";
    const filename = `property-${i + 1}-${slugify(img.alt || img.pageType)}.${ext}`;
    const dest = path.join(IMAGES_DIR, filename);
    
    process.stdout.write(`  [${i + 1}/${uniqueImages.length}] ${filename}... `);
    const result = await downloadImage(img.src, dest);
    
    if (result) {
      console.log("✅");
      downloadedImages.push({
        originalUrl: img.src,
        localPath: `/property-images/${filename}`,
        alt: img.alt,
        pageType: img.pageType,
        pageUrl: img.pageUrl,
        width: img.width,
        height: img.height,
      });
    } else {
      console.log("⚠️  skipped");
    }
    
    await new Promise(r => setTimeout(r, 300));
  }

  // ─── AI Enhancement ───────────────────────────────────────────────────────
  console.log(`\n🤖 Enhancing ${allProperties.length} property descriptions with Gemini AI...`);
  
  const enhancedProperties = [];
  
  for (const prop of allProperties) {
    console.log(`\n  🏢 Processing: "${prop.name}"`);
    console.log(`     Original: ${prop.rawDescription.substring(0, 80)}...`);
    
    const enhanced = await enhanceDescriptionWithGemini(
      genAI,
      prop.name,
      prop.rawDescription,
      prop.pageType
    );
    
    console.log(`     Enhanced: ${enhanced.substring(0, 80)}...`);
    
    enhancedProperties.push({
      id: slugify(prop.name),
      name: prop.name,
      type: prop.pageType,
      rawDescription: prop.rawDescription,
      seoDescription: enhanced,
      pageUrl: prop.pageUrl,
    });
    
    // Rate limit Gemini
    await new Promise(r => setTimeout(r, 500));
  }

  // ─── Output JSON ──────────────────────────────────────────────────────────
  const output = {
    scrapedAt: new Date().toISOString(),
    sourceUrl: "https://www.teamvisionllc.com",
    totalImages: downloadedImages.length,
    totalProperties: enhancedProperties.length,
    images: downloadedImages,
    properties: enhancedProperties,
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2));
  
  console.log("\n" + "━".repeat(50));
  console.log("🎉 DONE!\n");
  console.log(`📦 Properties with AI descriptions: ${enhancedProperties.length}`);
  console.log(`📸 Images downloaded: ${downloadedImages.length}`);
  console.log(`📄 Output JSON: ${OUTPUT_JSON}`);
  console.log(`🖼️  Images saved: ${IMAGES_DIR}\n`);
  
  // Print summary table
  console.log("Enhanced Properties:");
  enhancedProperties.forEach((p, i) => {
    console.log(`  ${i + 1}. [${p.type}] ${p.name}`);
  });
  
  console.log("\n💡 Next step: Run 'npm run update-data' to merge into data.ts\n");
}

scrape().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
