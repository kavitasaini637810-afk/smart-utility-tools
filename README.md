# Smart Utility Tools

> **Free, fast, modern, and privacy-first online tools for calculations, text analysis, image optimization, and PDF processing.**

Smart Utility Tools is a lightweight, mobile-responsive static website containing ten fully functional client-side utilities. All file processing (including images and PDFs) executes locally in the user's web browser with **zero server uploads**, ensuring complete privacy and immediate performance.

---

## 🛠️ The 10 Built-In Tools

| # | Tool Name | Category | Features & Technical Description |
|---|---|---|---|
| 1 | **Word & Character Counter** | Text | Live word count, characters with/without spaces, sentences, paragraphs, reading time (200 wpm), full Unicode/emoji support, copy & clear. |
| 2 | **Percentage Calculator** | Math | 4 calculation modes (X% of Y, what % is X of Y, % increase, % decrease), division-by-zero protection, step-by-step formula explanations. |
| 3 | **Age Calculator** | Calendar | Chronological age in years, months, days, total lifetime metrics (days, weeks, months, hours), calendar-aware leap year handling, next birthday countdown. |
| 4 | **EMI Loan Calculator** | Financial | Standard reducing-balance formula, zero-interest financing support, monthly EMI, total interest, total repayment, and 12-month amortization preview. |
| 5 | **GST Tax Calculator** | Financial | Exclusive (Add GST) and Inclusive (Remove GST) modes across standard brackets (0%, 5%, 12%, 18%, 28%) and custom rates, with CGST/SGST/IGST tax breakdowns. |
| 6 | **Image Resizer** | Images | Canvas-based resizing to custom width/height (pixels), aspect ratio lock toggle, PNG/JPEG/WebP export, 8,000px safeguard, genuine file download. |
| 7 | **Image Compressor** | Images | Lossy/lossless canvas compression with 10%–100% quality slider, WebP & JPEG format conversion, before-and-after size comparison, and honest size reporting. |
| 8 | **PDF Merger** | PDF | Combines multiple PDF files locally using `pdf-lib`. Drag-and-drop file upload, file removal, reordering (Move Up / Down), page count inspection, and instant merged PDF download. |
| 9 | **PDF Splitter** | PDF | Extracts single pages or page ranges (e.g. `1-3, 5, 8-10`) from any PDF document using `pdf-lib`. Strict page validation and out-of-range protection. |
| 10 | **PDF to Images Converter** | PDF | Renders PDF pages onto HTML5 canvas at selectable scale factors (1.0x, 1.5x, 2.0x) using `pdfjs-dist`. Individual PNG page downloads and full batch ZIP export via `jszip`. |

---

## 🏗️ Architecture & Technology Stack

- **Markup & Layout:** Semantic HTML5, accessible form controls, ARIA landmarks, and GitHub-style alerts.
- **Styling:** Vanilla modern CSS3 with custom design tokens (`style.css`), responsive CSS Grid/Flexbox, visible `:focus-visible` accessibility states, and a light modern theme with a professional blue accent (`#2563eb`).
- **Logic:** Vanilla JavaScript (ES6+ with broad browser compatibility, no frontend framework overhead).
- **Client-Side Libraries (Vendored in `assets/vendor/` with CDN Fallback):**
  - `pdf-lib` (v1.17.1) for PDF creation, merging, and extraction.
  - `pdfjs-dist` (v3.11.174) with dedicated web worker for PDF page canvas rendering.
  - `jszip` (v3.10.2) for batch image ZIP archive generation.
- **Privacy Architecture:** 100% client-side execution. Files uploaded into dropzones never leave the user's computer or smartphone.

---

## 📂 Project Directory Structure

```text
smart-utility-tools/
├── index.html                           # Homepage (Hero, Search, Categories, Popular Tools, FAQs, Footer)
├── 404.html                             # Custom accessible 404 page
├── robots.txt                           # Search engine crawler directives
├── sitemap.xml                          # XML Sitemap with priority and change frequencies
├── package.json                         # Project metadata and test configuration
├── README.md                            # Comprehensive project & deployment documentation
├── pages/
│   ├── all-tools.html                   # All 10 tools directory with live instant filter/search
│   ├── pdf-tools.html                   # Category listing: PDF utilities
│   ├── image-tools.html                 # Category listing: Image optimization
│   ├── calculator-tools.html            # Category listing: Financial & Math Calculators
│   ├── text-tools.html                  # Category listing: Text utilities
│   ├── about.html                       # Mission, platform story, and privacy commitment
│   ├── contact.html                     # Contact form with input validation and mailto fallback
│   ├── privacy-policy.html              # Comprehensive privacy disclosure (zero-upload model)
│   ├── terms.html                       # Terms of use and open-source licensing
│   └── disclaimer.html                  # Financial, tax, and operational disclaimers
├── tools/
│   ├── word-counter.html                # Tool 1: Word & Character Counter
│   ├── percentage-calculator.html       # Tool 2: Percentage Calculator
│   ├── age-calculator.html              # Tool 3: Age Calculator
│   ├── emi-calculator.html              # Tool 4: EMI Loan Calculator
│   ├── gst-calculator.html              # Tool 5: GST Tax Calculator
│   ├── image-resizer.html               # Tool 6: Image Resizer
│   ├── image-compressor.html            # Tool 7: Image Compressor
│   ├── pdf-merger.html                  # Tool 8: PDF Merger
│   ├── pdf-splitter.html                # Tool 9: PDF Splitter
│   └── pdf-to-images.html               # Tool 10: PDF to Images Converter
├── assets/
│   ├── css/
│   │   └── style.css                    # Design system, layout, responsive queries, accessible focus
│   ├── js/
│   │   ├── main.js                      # Navigation, mobile drawer, live tool search, FAQ accordion, helpers
│   │   └── tools/
│   │       ├── word-counter.js          # Live text analysis logic
│   │       ├── percentage-calculator.js # Math calculation & formulas
│   │       ├── age-calculator.js        # Date parsing, leap-year handling, countdowns
│   │       ├── emi-calculator.js        # Reducing balance EMI algorithm & schedule
│   │       ├── gst-calculator.js        # GST rate calculations & tax splits
│   │       ├── image-resizer.js         # Canvas resizing & aspect ratio lock
│   │       ├── image-compressor.js      # Quality slider compression & format converter
│   │       ├── pdf-merger.js            # pdf-lib multi-document merger & reordering
│   │       ├── pdf-splitter.js          # Range extraction & validation
│   │       └── pdf-to-images.js         # PDF.js page rendering & JSZip packaging
│   └── vendor/
│       ├── pdf-lib.min.js               # Vendored PDF-Lib library
│       ├── pdf.min.js                   # Vendored PDF.js rendering library
│       ├── pdf.worker.min.js            # Vendored PDF.js web worker
│       └── jszip.min.js                 # Vendored JSZip archiving library
└── tests/
    ├── word-counter.test.js             # Empty input, spaces, paragraphs, Unicode, reading time
    ├── percentage-calculator.test.js    # Normal, zero values, division by zero, % change
    ├── age-calculator.test.js           # Normal dates, month borrowing, leap year, future rejection
    ├── emi-calculator.test.js           # Reducing balance, 0% interest, invalid inputs
    ├── gst-calculator.test.js           # All slabs (0-28%), inclusive/exclusive, rounding
    ├── image-tools.test.js              # Proportions, aspect ratio lock, size bounds, savings
    ├── pdf-tools.test.js                # Range parsing, real PDF creation, merging & splitting
    ├── site-verification.test.js        # Verifies all HTML files, link integrity, asset existence
    └── browser-interaction.test.js      # JSDOM tests for forms, mobile nav, search filter, accordions
```

---

## 🧪 Testing & Verification

Smart Utility Tools comes with a built-in automated test suite executing across Node.js (`node:test`, `node:assert`, and `jsdom`).

To run all 46 automated unit, integration, and integrity tests:

```bash
npm test
```

### Test Coverage Highlights:
- **Word Counter:** Empty string, excessive whitespace, multiline paragraphs, astral Unicode/emojis, reading duration.
- **Percentage Calculator:** Calculation accuracy across all 4 modes, division-by-zero protection, zero inputs, negative values.
- **Age Calculator:** Calendar date arithmetic, leap year logic (including Feb 29 birthdates), month borrowing across different month lengths, future date rejection.
- **EMI Calculator:** Reducing-balance loan formula verification, 0% zero-interest financing edge case, negative/invalid input validation.
- **GST Calculator:** Exact calculations for 0%, 5%, 12%, 18%, and 28% slabs, intra-state CGST/SGST 50% split, inter-state IGST 100% assignment, and 2-decimal rounding.
- **Image Tools:** Aspect ratio preservation math, 8,000px maximum dimension safeguards, byte difference, and percentage savings calculations.
- **PDF Tools:** Page range parsing (`1-3, 5, 8-10`), out-of-range detection, inverted range (`7-3`) rejection, plus **real binary PDF creation, merging of two documents, and page extraction using `pdf-lib`**.
- **Site Integrity:** Validates that all 22 HTML pages exist, every internal link resolves to an actual file on disk, all local stylesheets and vendor scripts exist, and SEO titles/descriptions are present.
- **DOM Interactions:** JSDOM tests verifying that mobile navigation toggles properly, FAQ accordions expand/collapse, real-time search filters tool cards, and all forms compute and display output.

---

## 🚀 Free GitHub Pages Deployment Guide

Smart Utility Tools is designed specifically for **GitHub Pages** (or any static hosting provider like Netlify, Vercel, or Cloudflare Pages). Because all asset paths and links are **fully relative** (`./` and `../`), the site works seamlessly whether published at a custom root domain or under a repository subpath (e.g. `https://<username>.github.io/<repo-name>/`).

### Step-by-Step GitHub Pages Setup:

1. **Initialize Git Repository (if not already done):**
   ```bash
   cd "C:\Users\hp\.gemini\antigravity\scratch\smart-utility-tools"
   git init
   git add .
   git commit -m "Initial release of Smart Utility Tools"
   ```

2. **Create a GitHub Repository:**
   - Log in to your GitHub account and create a new public repository named `smart-utility-tools`.
   - Do **not** initialize it with a README, .gitignore, or license (we already have them).

3. **Push Code to GitHub:**
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/smart-utility-tools.git
   git push -u origin main
   ```

4. **Enable GitHub Pages:**
   - On GitHub, navigate to your repository's **Settings** tab.
   - In the left sidebar, click on **Pages** (under the "Code and automation" section).
   - Under **Build and deployment**:
     - **Source:** Select `Deploy from a branch`.
     - **Branch:** Select `main` and folder `/ (root)`.
     - Click **Save**.

5. **Wait for Deployment:**
   - GitHub Actions will automatically build and publish your static website in 1–2 minutes.
   - Your website will be live at:
     ```
     https://<your-username>.github.io/smart-utility-tools/
     ```

### Updating the Live Website:
Whenever you make updates or add new tools:
```bash
git add .
git commit -m "Update tools and features"
git push origin main
```
GitHub Pages will automatically rebuild and deploy your changes.

---

## ⚙️ Post-Deployment Configuration

### 1. Update Domain in `sitemap.xml` and `robots.txt`
In `sitemap.xml` and `robots.txt`, replace the placeholder URL (`https://yourusername.github.io/smart-utility-tools/`) with your actual deployed URL (e.g., `https://jane-dev.github.io/smart-utility-tools/` or your custom domain).

### 2. Configure Contact Email
The verified operational contact email is configured as `kavitasaini637810@gmail.com` across `pages/contact.html`, `pages/privacy-policy.html`, and `pages/about.html`. You can also connect the contact `<form>` to an external form handling service such as Formspree or Formkeep if preferred.

### 3. Google AdSense Monetization Setup
The website is architected to be 100% compliant with Google AdSense policies:
- Clean navigation, original tool instructions, transparent disclaimers, Privacy Policy, Terms, and About Us pages.
- **Zero fake ads and zero empty blank spaces:** All ad slots (`.ad-slot-container`) have `display: none` by default.
- **To activate AdSense once your application is approved:**
  1. Open `assets/js/main.js`.
  2. Locate `window.ADSENSE_CONFIG`:
     ```javascript
     window.ADSENSE_CONFIG = {
       client: 'ca-pub-XXXXXXXXXXXXXXXX', // Enter your AdSense Publisher ID here
       enabled: true                      // Change from false to true
     };
     ```
  3. Add your AdSense script tag to the `<head>` of `index.html` or tool pages as instructed by Google.
  > **Note:** AdSense approval is an independent review process conducted solely by Google. Developing a quality website does not guarantee automatic approval.

---

## 📄 License & Attribution

This project is open-source under the MIT License.
Third-party libraries:
- [PDF-Lib](https://pdf-lib.js.org/) - MIT License
- [PDF.js](https://mozilla.github.io/pdf.js/) - Apache-2.0 License
- [JSZip](https://stuk.github.io/jszip/) - MIT License

