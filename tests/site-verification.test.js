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

test('Site Structure - sitemap.xml and robots.txt exist', () => {
  const robots = path.join(PROJECT_ROOT, 'robots.txt');
  const sitemap = path.join(PROJECT_ROOT, 'sitemap.xml');
  assert.ok(fs.existsSync(robots), 'robots.txt must exist');
  assert.ok(fs.existsSync(sitemap), 'sitemap.xml must exist');

  const sitemapContent = fs.readFileSync(sitemap, 'utf-8');
  assert.match(sitemapContent, /<urlset/);
  assert.match(sitemapContent, /word-counter\.html/);
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

