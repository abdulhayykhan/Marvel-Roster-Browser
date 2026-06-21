/**
 * Build-time script: fetch the MCOC Fandom wiki's champion table
 * and extract portrait image URLs for each champion.
 */

const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const WIKI_URL = 'https://marvel-contestofchampions.fandom.com/wiki/List_of_Champions';
const CHAMPIONS_JSON = path.join(__dirname, '../src/data/champions.json');
const OUTPUT = path.join(__dirname, '../src/data/portraitUrls.json');

// Build the name -> champion lookup from our dataset
const champions = JSON.parse(fs.readFileSync(CHAMPIONS_JSON, 'utf8'));
const byName = new Map();
for (const c of champions) {
  byName.set(c.name, c.id);
}

async function main() {
  console.log('Fetching wiki page...');
  const resp = await fetch(WIKI_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MCOC-Roster-Fetcher/1.0)',
      'Accept': 'text/html',
    },
  });
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
  }
  const html = await resp.text();
  console.log('Fetched', html.length, 'bytes');

  // Write raw HTML for debugging
  const rawHtml = path.join(__dirname, '../src/data/wiki_raw.html');
  fs.writeFileSync(rawHtml, html);
  console.log('Raw HTML saved to', rawHtml);

  // Try to find the champions table.
  // The wiki has a table with class="article-table" and the table rows
  // contain champion names and their portrait images.

  const cheerio = require('cheerio');
  const $ = cheerio.load(html);

  const mapping = {};
  let matchedCount = 0;
  let unmatchedCount = 0;

  // The champions table is typically an article-table
  // Find the table that has both a champion name and an image
  const tables = $('.article-table, table.wikitable');
  console.log('Found', tables.length, 'tables');

  for (let tIdx = 0; tIdx < tables.length; tIdx++) {
    const table = tables.eq(tIdx);
    const rows = table.find('tr');
    console.log(`Table ${tIdx}: ${rows.length} rows`);

    for (let i = 0; i < rows.length; i++) {
      const row = rows.eq(i);
      const cells = row.find('td');
      if (cells.length === 0) continue;

      // Look for the champion name (usually first td with an anchor)
      const nameCell = cells.eq(0);
      const nameLink = nameCell.find('a').first();
      const championName = nameLink.text().trim();

      if (!championName) continue;

      // Look for the image (usually the second td with a link)
      let imgSrc = null;
      const imgCell = cells.eq(1);
      const imgLink = imgCell.find('a').first();
      if (imgLink.length) {
        // Check if it's a link with a thumbnail
        const img = imgLink.find('img').first();
        if (img.length) {
          imgSrc = img.attr('data-src') || img.attr('src');
        }
        // Also check the link href for the image URL
        const href = imgLink.attr('href');
        if (href && !imgSrc) {
          // The href might be the image page URL
          imgSrc = href;
        }
      }
      // If not found in second cell, try other cells
      if (!imgSrc) {
        row.find('img').each((_, imgEl) => {
          const src = $(imgEl).attr('data-src') || $(imgEl).attr('src');
          if (src && src.includes('portrait')) {
            imgSrc = src;
            return false; // break
          }
          if (src) {
            imgSrc = src;
          }
        });
      }
      if (!imgSrc) continue;

      // Clean the image URL
      // Convert thumbnail URLs to full portrait URLs
      let cleanUrl = imgSrc;
      // If it's a thumbnail, convert to full
      if (cleanUrl.includes('/revision/latest/')) {
        // Already a portrait URL with revision, keep it
      } else if (cleanUrl.includes('/thumb/')) {
        // It's a thumbnail, remove the /thumb/ and resize part
        cleanUrl = cleanUrl.replace('/thumb/', '/').replace(/\/\d+px-[^/]+$/, '');
      }
      // Ensure it's a full URL
      if (cleanUrl.startsWith('/')) {
        cleanUrl = 'https://static.wikia.nocookie.net' + cleanUrl;
      }
      if (cleanUrl.startsWith('http') && !cleanUrl.includes('static.wikia.nocookie.net') && !cleanUrl.includes('.wikia.nocookie.net')) {
        // Might be a link to the image page, not the image itself
        // Try to find the actual image URL from the page
        continue;
      }

      if (byName.has(championName)) {
        const id = byName.get(championName);
        mapping[id] = cleanUrl;
        matchedCount++;
        byName.delete(championName);
      } else {
        unmatchedCount++;
        console.log('Unmatched name:', championName);
      }
    }
  }

  console.log('Matched:', matchedCount);
  console.log('Unmatched:', unmatchedCount);
  console.log('Remaining in dataset:', byName.size);
  if (byName.size > 0) {
    console.log('Remaining:', Array.from(byName.keys()).join(', '));
  }

  // Save the mapping
  fs.writeFileSync(OUTPUT, JSON.stringify(mapping, null, 2));
  console.log('Saved mapping to', OUTPUT);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
