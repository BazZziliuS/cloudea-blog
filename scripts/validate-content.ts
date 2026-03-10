/**
 * Content validation script.
 * Run: npx tsx scripts/validate-content.ts
 *
 * Validates all blog posts and docs frontmatter using zod schemas.
 * Prints warnings and exits with code 1 if critical errors found.
 */

import { getAllPosts, getAllDocs, getContentWarnings } from "../src/lib/content";

console.log("Validating content...\n");

// Trigger validation by loading all content
const posts = getAllPosts(true);
const docs = getAllDocs();
const warnings = getContentWarnings();

console.log(`Found ${posts.length} posts and ${docs.length} docs.\n`);

if (warnings.length > 0) {
  console.log(`⚠ ${warnings.length} warning(s):\n`);
  for (const w of warnings) {
    console.log(`  ${w.file}`);
    console.log(`    → ${w.message}\n`);
  }

  // Check for critical errors (missing title or date)
  const critical = warnings.filter(
    (w) => w.message.includes("title") || w.message.includes("date")
  );

  if (critical.length > 0) {
    console.log(`✗ ${critical.length} critical error(s) found. Fix before deploying.`);
    process.exit(1);
  }
} else {
  console.log("✓ All content is valid.");
}
