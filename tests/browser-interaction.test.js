const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const PROJECT_ROOT = path.resolve(__dirname, '..');

test('DOM Interaction - Homepage mobile nav and FAQ accordion', () => {
  const html = fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf-8');
  const dom = new JSDOM(html, { runScripts: 'dangerously' });
  const window = dom.window;
  const document = window.document;

  // Execute main.js in DOM context
  const mainJs = fs.readFileSync(path.join(PROJECT_ROOT, 'assets/js/main.js'), 'utf-8');
  window.eval(mainJs);

  // Trigger DOMContentLoaded
  document.dispatchEvent(new window.Event('DOMContentLoaded'));

  // Test 1: Mobile Nav Toggle
  const toggleBtn = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  assert.ok(toggleBtn);
  assert.ok(navLinks);
  assert.equal(toggleBtn.getAttribute('aria-expanded'), 'false');
  assert.equal(navLinks.classList.contains('open'), false);

  toggleBtn.click();
  assert.equal(toggleBtn.getAttribute('aria-expanded'), 'true');
  assert.equal(navLinks.classList.contains('open'), true);

  toggleBtn.click();
  assert.equal(toggleBtn.getAttribute('aria-expanded'), 'false');
  assert.equal(navLinks.classList.contains('open'), false);

  // Test 2: FAQ Accordion
  const faqItem = document.querySelector('.faq-item');
  const faqBtn = faqItem.querySelector('.faq-question');
  assert.equal(faqItem.classList.contains('open'), false);

  faqBtn.click();
  assert.equal(faqItem.classList.contains('open'), true);
  assert.equal(faqBtn.getAttribute('aria-expanded'), 'true');

  faqBtn.click();
  assert.equal(faqItem.classList.contains('open'), false);
  assert.equal(faqBtn.getAttribute('aria-expanded'), 'false');

  // Test 3: Tool Live Search
  const searchInput = document.querySelector('.search-input');
  const cards = document.querySelectorAll('.tool-card');
  assert.equal(cards.length, 10);

  searchInput.value = 'pdf';
  searchInput.dispatchEvent(new window.Event('input'));

  let visibleCount = 0;
  cards.forEach(card => {
    if (card.style.display !== 'none') visibleCount++;
  });
  assert.equal(visibleCount, 3, 'Searching "pdf" should match exactly 3 PDF tool cards');

  // Search non-existent
  searchInput.value = 'nonexistentxyz';
  searchInput.dispatchEvent(new window.Event('input'));
  const noResults = document.getElementById('noSearchResults');
  assert.equal(noResults.style.display, 'block');
});

test('DOM Interaction - Word Counter live updates', () => {
  const html = fs.readFileSync(path.join(PROJECT_ROOT, 'tools/word-counter.html'), 'utf-8');
  const dom = new JSDOM(html, { runScripts: 'dangerously' });
  const window = dom.window;
  const document = window.document;

  const script = fs.readFileSync(path.join(PROJECT_ROOT, 'assets/js/tools/word-counter.js'), 'utf-8');
  window.eval(script);
  document.dispatchEvent(new window.Event('DOMContentLoaded'));

  const textarea = document.getElementById('textInput');
  const wordEl = document.getElementById('wordCount');
  const charEl = document.getElementById('charWithSpaces');

  textarea.value = 'Hello world! Smart Utility Tools.';
  textarea.dispatchEvent(new window.Event('input'));

  assert.equal(wordEl.textContent, '5');
  assert.equal(charEl.textContent, '33');

  // Clear button
  const clearBtn = document.getElementById('clearBtn');
  clearBtn.click();
  assert.equal(textarea.value, '');
  assert.equal(wordEl.textContent, '0');
});

test('DOM Interaction - Percentage Calculator form submission', () => {
  const html = fs.readFileSync(path.join(PROJECT_ROOT, 'tools/percentage-calculator.html'), 'utf-8');
  const dom = new JSDOM(html, { runScripts: 'dangerously' });
  const window = dom.window;
  const document = window.document;

  const script = fs.readFileSync(path.join(PROJECT_ROOT, 'assets/js/tools/percentage-calculator.js'), 'utf-8');
  window.eval(script);
  document.dispatchEvent(new window.Event('DOMContentLoaded'));

  // Mode 1: 20% of 250
  document.getElementById('p1_x').value = '20';
  document.getElementById('p1_y').value = '250';
  const form1 = document.getElementById('formPercentOf');
  form1.dispatchEvent(new window.Event('submit'));

  const res1 = document.getElementById('res_p1');
  assert.equal(res1.style.display, 'block');
  assert.match(res1.textContent, /50/);
});

test('DOM Interaction - EMI Calculator form submission', () => {
  const html = fs.readFileSync(path.join(PROJECT_ROOT, 'tools/emi-calculator.html'), 'utf-8');
  const dom = new JSDOM(html, { runScripts: 'dangerously' });
  const window = dom.window;
  const document = window.document;

  const script = fs.readFileSync(path.join(PROJECT_ROOT, 'assets/js/tools/emi-calculator.js'), 'utf-8');
  window.eval(script);
  document.dispatchEvent(new window.Event('DOMContentLoaded'));

  document.getElementById('principal').value = '100000';
  document.getElementById('rate').value = '10';
  document.getElementById('tenure').value = '10';
  document.getElementById('tenureType').value = 'years';

  const form = document.getElementById('emiForm');
  form.dispatchEvent(new window.Event('submit'));

  const emiResult = document.getElementById('emiResult');
  assert.equal(emiResult.style.display, 'block');
  const resEMI = document.getElementById('resEMI');
  assert.match(resEMI.textContent, /1,321/); // 1321.51
});

test('DOM Interaction - GST Calculator form submission', () => {
  const html = fs.readFileSync(path.join(PROJECT_ROOT, 'tools/gst-calculator.html'), 'utf-8');
  const dom = new JSDOM(html, { runScripts: 'dangerously' });
  const window = dom.window;
  const document = window.document;

  const script = fs.readFileSync(path.join(PROJECT_ROOT, 'assets/js/tools/gst-calculator.js'), 'utf-8');
  window.eval(script);
  document.dispatchEvent(new window.Event('DOMContentLoaded'));

  document.getElementById('gstAmount').value = '10000';
  const form = document.getElementById('gstForm');
  form.dispatchEvent(new window.Event('submit'));

  const gstResult = document.getElementById('gstResult');
  assert.equal(gstResult.style.display, 'block');
  const tax = document.getElementById('resTax');
  assert.match(tax.textContent, /1,800/);
  const total = document.getElementById('resTotalGst');
  assert.match(total.textContent, /11,800/);
});

test('DOM Interaction - Contact Form validation', () => {
  const html = fs.readFileSync(path.join(PROJECT_ROOT, 'pages/contact.html'), 'utf-8');
  const dom = new JSDOM(html, { runScripts: 'dangerously' });
  const window = dom.window;
  const document = window.document;

  document.dispatchEvent(new window.Event('DOMContentLoaded'));

  const form = document.getElementById('contactForm');
  const errorEl = document.getElementById('contactError');
  const nameError = document.getElementById('nameError');

  // Submit empty form
  form.dispatchEvent(new window.Event('submit'));
  assert.equal(errorEl.style.display, 'block');
  assert.equal(nameError.style.display, 'block');
});

