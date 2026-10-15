const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const PROJECT_ROOT = path.resolve(__dirname, '..');

const EXPECTED_HTML_FILES = [
  'index.html',
  '404.html',
  'pages/all-tools.html',
  'pages/pdf-tools.html',
  'pages/image-tools.html',
  'pages/calculator-tools.html',
  'pages/text-tools.html',
  'pages/about.html',
  'pages/contact.html',
  'pages/privacy-policy.html',
  'pages/terms.html',
  'pages/disclaimer.html',
  'tools/word-counter.html',
  'tools/percentage-calculator.html',
  'tools/age-calculator.html',
  'tools/emi-calculator.html',
  'tools/gst-calculator.html',
  'tools/image-resizer.html',
  'tools/image-compressor.html',
  'tools/pdf-merger.html',
  'tools/pdf-splitter.html',
  'tools/pdf-to-images.html'
];

test('Site Structure - all required HTML files exist', () => {
  EXPECTED_HTML_FILES.forEach(relPath => {
    const fullPath = path.join(PROJECT_ROOT, relPath);
    assert.ok(fs.existsSync(fullPath), `Missing expected file: ${relPath}`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 200, `File ${relPath} is unexpectedly small (${stat.size} bytes)`);
  });
});

test('Site Structure - sitemap.xml and robots.txt exist and are strictly valid', () => {
  const robots = path.join(PROJECT_ROOT, 'robots.txt');
  const sitemap = path.join(PROJECT_ROOT, 'sitemap.xml');
  assert.ok(fs.existsSync(robots), 'robots.txt must exist');
  assert.ok(fs.existsSync(sitemap), 'sitemap.xml must exist');

  const sitemapContent = fs.readFileSync(sitemap, 'utf-8');
  assert.match(sitemapContent, /<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(sitemapContent, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);

  // Strict XML DOM Parsing
  const dom = new JSDOM(sitemapContent, { contentType: 'application/xml' });
  const parserErrors = dom.window.document.querySelectorAll('parsererror');
  assert.strictEqual(parserErrors.length, 0, 'sitemap.xml must have 0 XML parser errors');

  const urls = Array.from(dom.window.document.querySelectorAll('url'));
  assert.strictEqual(urls.length, 21, 'sitemap.xml must contain exactly 21 URLs');

  // Verify homepage canonical alignment
  const homepageLoc = urls[0].querySelector('loc').textContent.trim();
  assert.strictEqual(homepageLoc, 'https://kavitasaini637810-afk.github.io/smart-utility-tools/', 'Homepage loc in sitemap must match canonical URL exactly');

  // Verify all URLs exist and use correct base
  const seenLocs = new Set();
  urls.forEach(u => {
    const loc = u.querySelector('loc').textContent.trim();
    assert.ok(loc.startsWith('https://kavitasaini637810-afk.github.io/smart-utility-tools/'), `Invalid domain in loc: ${loc}`);
    assert.ok(!seenLocs.has(loc), `Duplicate loc in sitemap: ${loc}`);
    seenLocs.add(loc);

    const lastmod = u.querySelector('lastmod').textContent.trim();
    assert.match(lastmod, /^\d{4}-\d{2}-\d{2}$/, `Invalid lastmod date format: ${lastmod}`);
  });

  // Verify robots.txt sitemap reference
  const robotsContent = fs.readFileSync(robots, 'utf-8');
  assert.match(robotsContent, /Sitemap: https:\/\/kavitasaini637810-afk\.github\.io\/smart-utility-tools\/sitemap\.xml/);
});

test('Site Verification - Link Integrity and Asset Paths', () => {
  EXPECTED_HTML_FILES.forEach(htmlFile => {
    const fullPath = path.join(PROJECT_ROOT, htmlFile);
    const htmlContent = fs.readFileSync(fullPath, 'utf-8');
    const dom = new JSDOM(htmlContent);
    const doc = dom.window.document;

    // Check SEO Title and Meta Description
    const title = doc.querySelector('title');
    assert.ok(title && title.textContent.trim().length > 0, `${htmlFile} must have a non-empty <title>`);
    const desc = doc.querySelector('meta[name="description"]');
    assert.ok(desc && desc.getAttribute('content').trim().length > 0, `${htmlFile} must have a meta description`);

    // Check All Local Anchor Links
    const anchors = doc.querySelectorAll('a[href]');
    anchors.forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('#')) {
        return; // Skip external / mailto / anchors
      }

      // Clean query string or hash
      const cleanHref = href.split('?')[0].split('#')[0];
      const targetDir = path.dirname(fullPath);
      const resolvedTarget = path.resolve(targetDir, cleanHref);

      assert.ok(fs.existsSync(resolvedTarget), `Broken link in ${htmlFile}: href="${href}" -> resolved to ${resolvedTarget}`);
    });

    // Check All Local Stylesheets
    const links = doc.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(l => {
      const href = l.getAttribute('href');
      if (href.startsWith('http')) return;
      const resolvedCss = path.resolve(path.dirname(fullPath), href);
      assert.ok(fs.existsSync(resolvedCss), `Missing CSS in ${htmlFile}: ${href}`);
    });

    // Check All Local Scripts
    const scripts = doc.querySelectorAll('script[src]');
    scripts.forEach(s => {
      const src = s.getAttribute('src');
      if (src.startsWith('http')) return;
      const resolvedJs = path.resolve(path.dirname(fullPath), src);
      assert.ok(fs.existsSync(resolvedJs), `Missing JS script in ${htmlFile}: ${src}`);
    });
  });
});

test('SEO Verification - Canonicals, OG Tags, JSON-LD, and H1 Structure', () => {
  EXPECTED_HTML_FILES.forEach(htmlFile => {
    const fullPath = path.join(PROJECT_ROOT, htmlFile);
    const htmlContent = fs.readFileSync(fullPath, 'utf-8');
    const dom = new JSDOM(htmlContent);
    const doc = dom.window.document;

    // Heading hierarchy: Exactly one h1 per page
    const h1s = doc.querySelectorAll('h1');
    assert.strictEqual(h1s.length, 1, `${htmlFile} must have exactly one <h1>, found ${h1s.length}`);

    // Skip 404 from indexing checks
    if (htmlFile === '404.html') {
      const robotsMeta = doc.querySelector('meta[name="robots"]');
      assert.ok(robotsMeta && robotsMeta.getAttribute('content').includes('noindex'), '404.html must have noindex robots');
      return;
    }

    // Canonical Tag
    const canonical = doc.querySelector('link[rel="canonical"]');
    assert.ok(canonical, `${htmlFile} must have a canonical tag`);
    const canonicalHref = canonical.getAttribute('href');
    assert.ok(
      canonicalHref.startsWith('https://kavitasaini637810-afk.github.io/smart-utility-tools/'),
      `${htmlFile} canonical must point to published site URL, got: ${canonicalHref}`
    );

    // Open Graph Tags
    const ogTitle = doc.querySelector('meta[property="og:title"]');
    const ogDesc = doc.querySelector('meta[property="og:description"]');
    const ogUrl = doc.querySelector('meta[property="og:url"]');
    assert.ok(ogTitle && ogTitle.getAttribute('content'), `${htmlFile} must have og:title`);
    assert.ok(ogDesc && ogDesc.getAttribute('content'), `${htmlFile} must have og:description`);
    assert.ok(ogUrl && ogUrl.getAttribute('content'), `${htmlFile} must have og:url`);

    // Structured Data (JSON-LD)
    const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
    assert.ok(jsonLdScripts.length >= 1, `${htmlFile} must have at least one JSON-LD structured data block`);
    jsonLdScripts.forEach((s, idx) => {
      assert.doesNotThrow(() => {
        const parsed = JSON.parse(s.textContent);
        assert.ok(parsed['@context'] === 'https://schema.org', 'Schema @context must be https://schema.org');
        assert.ok(parsed['@type'], 'Schema @type must exist');
      }, `${htmlFile} JSON-LD block #${idx + 1} must be valid JSON`);
    });
  });
});

