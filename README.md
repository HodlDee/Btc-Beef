# BTC Beef

Static website for [BTC Beef](https://btcbeef.com), a farm-direct Red Angus beef business.

## Local preview

From the project directory, install the development dependencies once and start the preview server:

```bash
npm install
npm run dev
```

The terminal will print the local preview address. Run `npm run validate` before submitting changes.

## Project structure

- `index.html` contains the single-page site content and metadata.
- `assets/css/custom.css` contains BTC Beef-specific design and responsive styles.
- `assets/js/main.js` contains navigation, gallery, and inquiry-form interactions.
- `assets/img` contains the site's optimized imagery and source photos.
- `CNAME`, `robots.txt`, and `sitemap.xml` support the GitHub Pages deployment.

The production site is published from the repository's default branch through GitHub Pages.

## Approved redesign and launch preparation

The approved Bold Cut design is now prepared as the main pages on the launch-preparation branch. The comparison previews remain under `previews/`, with their own noindex metadata, and are excluded from the production build.

Run `npm run validate` to check all production HTML, local links, images, section anchors, sitemap coverage, and structured data. Run `npm run build` to create a complete static `dist/` directory with all nine pages and their assets. GitHub Pages still serves the default branch; these commands do not publish changes.

Before launch:

- Resolve the Beef Box and quarter photographs. Current photos remain in this draft pending the owner's decision; rejected generated replacements are not installed. Ground beef is packaged in round plastic bags, with sixteen 1-lb bags in a Beef Box.
- Have the owner approve any real inquiry-form test before submitting it to Formspree.
- Obtain the owner's go-ahead before merging or publishing the redesign.

Existing homepage links to `#hero`, `#about`, `#menu`, `#chefs`, and other prior section ids continue to work. The former `#gallery` link opens the gallery page.

Launch draft verification (2026-10-14):

- All nine production pages pass HTML and local link/asset/metadata checks; the FAQ structured data matches all 19 questions.
- Browser checks found no horizontal overflow at 320-pixel phone width or 768-pixel tablet width after fixing the cuts selector. Homepage also checked at 390 and 1280 pixels.
- Checked keyboard dropdown navigation, mobile menu and Escape, FAQ disclosures, cut selection, order-interest preselection, recipe photo selection and pause, main-page navigation, and the old farm/gallery links.
- Empty inquiries remain blocked by browser validation. Offline success, HTTP-error, network-error and timeout checks pass; no real form submission was sent.
- Product-photo decision is still pending. This is a launch draft, not a deployed site.
