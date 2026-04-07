// scripts/generate-blog.js
// Generates 5 SEO-optimized blog posts for Vision LLC using Gemini API
// Run: node scripts/generate-blog.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyDYTtPYWA623cnugup_lw_WbbN_Y1iAxDw";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Blog post specs to generate
const BLOG_SPECS = [
  {
    slug: "downtown-bristol-tn-commercial-real-estate-market-2025",
    title: "Downtown Bristol, TN Commercial Real Estate Market Outlook 2025",
    metaTitle: "Downtown Bristol TN Commercial Real Estate Market Outlook 2025 | Vision LLC",
    metaDescription:
      "Deep dive into the 2025 commercial real estate market in Downtown Bristol, TN. Office vacancy rates, retail trends, adaptive reuse projects & investment opportunities on State Street.",
    category: "Market Reports",
    tags: ["Bristol TN", "Market Report", "Commercial Real Estate", "Tri-Cities"],
    targetKeyword: "downtown Bristol TN commercial real estate 2025",
    prompt: `Write a detailed, 1000-word SEO-optimized blog post for Vision LLC — the largest private commercial property owner in Downtown Bristol, TN.

Title: "Downtown Bristol, TN Commercial Real Estate Market Outlook 2025"
Target keyword: "downtown Bristol TN commercial real estate 2025"

COMPANY CONTEXT:
- Vision LLC is headquartered at 100 5th St., Suite 2W, Bristol, TN 37620
- Phone: 423-573-1022
- They own iconic buildings along State Street in downtown Bristol
- They specialize in historic adaptive reuse and mixed-use development
- Their flagship project is City Centre Professional Suites (1,200–18,000+ sqft)
- They also operate Bristol CoWork at 620 State Street (coworking/shared office)
- They serve the Tri-Cities MSA: Bristol TN/VA, Kingsport, Johnson City
- Bristol is on the TN/VA state line — zip code 37620, Sullivan County
- Key local employers: Ballad Health, Tennessee Eastman, Bristol Motor Speedway, King University

STRUCTURE:
- Write in formal but engaging professional tone
- Use H2 subheadings (##) for sections
- Include: market overview, retail trends on State Street, office vacancy insights, adaptive reuse opportunity, why businesses are choosing Downtown Bristol, CTA paragraph
- Mention specific Bristol landmarks, neighborhoods, employers naturally
- Include hyperlocal signals: zip 37620, Sullivan County, I-81 corridor, State Street, The Pinnacle
- End with a strong CTA to contact Vision LLC at 423-573-1022
- Return ONLY the article body paragraphs with ## H2 subheadings. No title, no intro meta, just content.`,
  },
  {
    slug: "coworking-vs-traditional-office-tri-cities-tennessee",
    title: "Coworking vs. Traditional Office Space in the Tri-Cities: What's Right for Your Business?",
    metaTitle: "Coworking vs Traditional Office Space Tri-Cities TN | Bristol CoWork | Vision LLC",
    metaDescription:
      "Comparing coworking memberships vs. traditional commercial leases in the Tri-Cities. Learn how Bristol CoWork at 620 State Street serves startups, remote teams, and growing businesses.",
    category: "Business Insights",
    tags: ["Coworking", "Bristol TN", "Office Space", "Tri-Cities", "Small Business"],
    targetKeyword: "coworking space Tri-Cities Tennessee",
    prompt: `Write a detailed, 1000-word SEO-optimized blog post for Vision LLC.

Title: "Coworking vs. Traditional Office Space in the Tri-Cities: What's Right for Your Business?"
Target keyword: "coworking space Tri-Cities Tennessee"

COMPANY CONTEXT:
- Vision LLC operates Bristol CoWork at 620 State Street, Bristol, TN 37620
- Bristol CoWork offers: private offices, dedicated desks, conference rooms, high-speed internet, all utilities included, 5,000+ sqft
- They also offer traditional long-term commercial leases via City Centre and The Executive suites
- Tri-Cities = Bristol TN/VA (37620), Kingsport (37660), Johnson City (37601)
- Vision LLC phone: 423-573-1022

STRUCTURE:
- Write in conversational but professional tone
- Use H2 subheadings (##) for sections
- Include: growing remote work trend in NETN, what coworking offers, what traditional office offers, comparison table in prose form, who each is right for, why Bristol CoWork stands out, CTA
- Include local context: ETSU remote graduates, Eastman Chemical contractors, healthcare tech workers, Ballad Health
- Mention specific Bristol neighborhood context: State Street, downtown Bristol
- End with strong CTA to call 423-573-1022 or tour Bristol CoWork
- Return ONLY the article body paragraphs with ## H2 subheadings. No title, no intro meta, just content.`,
  },
  {
    slug: "historic-adaptive-reuse-downtown-bristol-tennessee",
    title: "Historic Adaptive Reuse: How Vision LLC Is Transforming Downtown Bristol, TN",
    metaTitle: "Historic Adaptive Reuse Downtown Bristol TN | Vision LLC Development",
    metaDescription:
      "How Vision LLC is leading the historic adaptive reuse movement in Downtown Bristol, TN — converting century-old buildings into premium commercial real estate on the TN/VA state line.",
    category: "Development",
    tags: ["Historic Preservation", "Adaptive Reuse", "Bristol TN", "Development", "Commercial Real Estate"],
    targetKeyword: "historic adaptive reuse Bristol TN",
    prompt: `Write a detailed, 1000-word SEO-optimized blog post for Vision LLC.

Title: "Historic Adaptive Reuse: How Vision LLC Is Transforming Downtown Bristol, TN"
Target keyword: "historic adaptive reuse Bristol TN"

COMPANY CONTEXT:
- Vision LLC is an award-winning developer specializing in historic adaptive reuse
- Founded 2002, 20+ years of continuous downtown Bristol investment
- Largest private commercial property owner in Downtown Bristol
- Located at 100 5th St., Suite 2W, Bristol, TN 37620 (zip code 37620, Sullivan County)
- Projects: City Centre Professional Suites, The Executive suites, State Street retail buildouts
- Bristol is famous for its twin-city state line on State Street — Virginia on one side, Tennessee on the other
- The downtown core features early 20th century commercial architecture

STRUCTURE:
- Write in sophisticated, authoritative tone
- Use H2 subheadings (##) for sections
- Include: what adaptive reuse is, why Bristol is uniquely positioned (history, architecture, state line), Vision LLC's approach and projects, economic impact (preserving character while adding commercial value), tax incentive context (historic tax credits), future of downtown Bristol 
- Mention: Bristol's National Register downtown district, the Paramount Center for the Arts, Birthplace of Country Music Museum as neighborhood anchors
- End with strong CTA to explore development partnerships with Vision LLC
- Return ONLY the article body paragraphs with ## H2 subheadings. No title, no intro meta, just content.`,
  },
  {
    slug: "top-industries-driving-commercial-real-estate-kingsport-johnson-city",
    title: "Top Industries Driving Commercial Real Estate Demand in Kingsport & Johnson City, TN",
    metaTitle: "Industries Driving Commercial Real Estate Demand Kingsport & Johnson City TN | Vision LLC",
    metaDescription:
      "Eastman Chemical, ETSU, Ballad Health, and defense contractors are fueling office and industrial demand across Kingsport and Johnson City, TN. Vision LLC breaks down the market.",
    category: "Market Reports",
    tags: ["Kingsport TN", "Johnson City TN", "Market Report", "Industrial", "Tri-Cities"],
    targetKeyword: "commercial real estate Kingsport Johnson City TN",
    prompt: `Write a detailed, 1000-word SEO-optimized blog post for Vision LLC.

Title: "Top Industries Driving Commercial Real Estate Demand in Kingsport & Johnson City, TN"
Target keyword: "commercial real estate Kingsport Johnson City TN"

COMPANY CONTEXT:
- Vision LLC serves the entire Tri-Cities MSA: Bristol TN/VA, Kingsport, Johnson City
- Headquartered in Downtown Bristol at 100 5th St., Suite 2W, Bristol, TN 37620
- Phone: 423-573-1022
- They help businesses find office space, retail, industrial, and mixed-use properties across the region

REGIONAL CONTEXT:
- Kingsport (zip 37660, Sullivan County): anchored by Eastman Chemical (global specialty chemicals), BAE Systems (defense), Holston Valley Medical Center, Domtar paper
- Johnson City (zip 37601, Washington County): anchored by East Tennessee State University (ETSU), Ballad Health (region's largest health system), State of Franklin Commerce Park
- I-26 runs through both cities connecting them to Asheville and Charlotte
- Major growth sectors: healthcare tech, remote corporate, defense supply chain, university spin-offs

STRUCTURE:
- Write in authoritative business tone
- Use H2 subheadings (##) for sections
- Cover: healthcare & medical (Ballad Health), advanced manufacturing (Eastman, BAE), higher education (ETSU), logistics/distribution (I-26 corridor), remote/hybrid corporate expansion
- Include specific neighborhood context: Center City Kingsport, State of Franklin district JCTN, University District
- End with CTA to contact Vision LLC for Kingsport/Johnson City space needs
- Return ONLY the article body paragraphs with ## H2 subheadings. No title, no intro meta, just content.`,
  },
  {
    slug: "executive-business-consulting-northeast-tennessee-2025",
    title: "Executive Business Consulting in Northeast Tennessee: What CEOs Need in 2025",
    metaTitle: "Executive Business Consulting Northeast Tennessee 2025 | Vision LLC Advisement",
    metaDescription:
      "Vision LLC's Executive Advisement division offers C-suite strategy, market entry consulting, and high-stakes deal negotiation for business leaders across the Tri-Cities and Southwest Virginia.",
    category: "Executive Advisement",
    tags: ["Executive Consulting", "Business Strategy", "Tri-Cities", "Tennessee", "C-Suite"],
    targetKeyword: "executive business consulting Northeast Tennessee",
    prompt: `Write a detailed, 1000-word SEO-optimized blog post for Vision LLC's Executive Advisement division.

Title: "Executive Business Consulting in Northeast Tennessee: What CEOs Need in 2025"
Target keyword: "executive business consulting Northeast Tennessee"

COMPANY CONTEXT:
- Vision LLC's Division III is Executive Advisement — providing C-suite strategy, site selection, market entry, investment analysis, and deal negotiation
- Led by deeply connected regional operators with 20+ years in the Tri-Cities market
- Serves CEOs, founders, private equity, and land developers across TN and SW Virginia
- Headquartered: 100 5th St., Suite 2W, Bristol, TN 37620, phone 423-573-1022
- Region served: Tri-Cities MSA (Bristol, Kingsport, Johnson City), Southwest Virginia, broader NETN

STRUCTURE:
- Write in polished, executive-level tone
- Use H2 subheadings (##) for sections
- Include: why NETN is an overlooked strategic market in 2025, what executive advisement means vs generic consulting, Vision LLC's five service pillars (site selection, investment underwriting, market entry strategy, deal negotiation, historic tax credit strategy), who the ideal client is, why local expertise matters more than national consultants
- Regional context: mention Tri-Cities economic resilience, low cost of entry vs. Asheville/Charlotte/Nashville, fiber infrastructure, airport access (Tri-Cities Regional Airport, Blountville TN 37617)
- End with strong CTA to schedule a confidential executive consultation
- Return ONLY the article body paragraphs with ## H2 subheadings. No title, no intro meta, just content.`,
  },
];

async function generatePost(spec) {
  console.log(`\n⚡ Generating: ${spec.title}`);

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent(spec.prompt);
  const content = result.response.text();

  console.log(`  ✅ Generated ${content.length} characters`);
  return content;
}

function estimateReadTime(content) {
  const words = content.split(/\s+/).length;
  return Math.max(4, Math.round(words / 200));
}

async function main() {
  console.log("🚀 Vision LLC Blog Generator — Starting...\n");

  const posts = [];

  for (const spec of BLOG_SPECS) {
    try {
      const content = await generatePost(spec);

      posts.push({
        slug: spec.slug,
        title: spec.title,
        metaTitle: spec.metaTitle,
        metaDescription: spec.metaDescription,
        category: spec.category,
        tags: spec.tags,
        targetKeyword: spec.targetKeyword,
        readTime: estimateReadTime(content),
        publishedAt: new Date().toISOString().split("T")[0],
        author: "Vision LLC Team",
        authorTitle: "Commercial Real Estate Experts, Tri-Cities TN",
        content,
      });

      // Avoid rate limiting
      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      console.error(`  ❌ Error generating ${spec.slug}:`, err.message);
    }
  }

  // Write to blog-data.ts
  const outputTs = `// Auto-generated by scripts/generate-blog.js — DO NOT EDIT MANUALLY
// Re-run: node scripts/generate-blog.js

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  tags: string[];
  targetKeyword: string;
  readTime: number;
  publishedAt: string;
  author: string;
  authorTitle: string;
  content: string; // Markdown with ## H2 headings
}

export const BLOG_POSTS: BlogPost[] = ${JSON.stringify(posts, null, 2)};
`;

  const outputPath = path.join(__dirname, "../src/lib/blog-data.ts");
  fs.writeFileSync(outputPath, outputTs, "utf-8");

  console.log(`\n✅ All done! ${posts.length} posts written to src/lib/blog-data.ts`);
  console.log("   Run: npm run dev and visit /blog");
}

main().catch(console.error);
