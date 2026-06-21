import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CHAMPIONS_JSON = path.join(__dirname, '../src/data/champions.json');
const OUTPUT = path.join(__dirname, '../src/data/portraitUrls.json');

const champions = JSON.parse(fs.readFileSync(CHAMPIONS_JSON, 'utf8'));

// Build name -> id mapping, and also try title-case variants
const byName = new Map();
for (const c of champions) {
  byName.set(c.name, c.id);
}

// Wikia filename -> our champion name mapping
// From the parse API, portrait filenames are like: Abomination_portrait.png
// Champion names in wiki are like "Abomination", "Cyclops (Blue Team)", "Spider-Man (Miles Morales)"
// The filename replaces spaces with underscores and removes special chars
function filenameToName(filename) {
  // Remove _portrait.png suffix
  const base = filename.replace(/_portrait\.png$/i, '').replace(/_featured\.png$/i, '');
  // Convert underscores to spaces
  let name = base.replace(/_/g, ' ');
  // The wiki title for names with parentheses: e.g. Spider-Man (Miles Morales) -> Spider-Man_(Miles_Morales)
  // So we need to check if our dataset has the exact match first
  return name;
}

async function fetchJson(url) {
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MCOC-Roster-Fetcher/1.0)',
    },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}: ${url}`);
  return resp.json();
}

async function main() {
  console.log('Step 1: Fetching image list from parse API...');
  const parseData = await fetchJson(
    'https://marvel-contestofchampions.fandom.com/api.php?action=parse&page=List_of_Champions&prop=images&format=json'
  );

  const allImages = parseData.parse?.images || [];
  console.log('Total images found:', allImages.length);

  // Filter portrait images
  const portraitFiles = allImages.filter(name => name.endsWith('_portrait.png'));
  console.log('Portrait images found:', portraitFiles.length);

  // Build the mapping from filename to our champion name
  // We need to handle title case: some filenames use underscores
  const championNames = Array.from(byName.keys());
  const nameLowerToId = new Map();
  const nameLowerToName = new Map();
  for (const name of championNames) {
    nameLowerToId.set(name.toLowerCase(), byName.get(name));
    nameLowerToName.set(name.toLowerCase(), name);
  }

  const matchedFiles = [];
  const unmatchedFiles = [];

  for (const file of portraitFiles) {
    const baseName = file.replace(/_portrait\.png$/i, '').replace(/_/g, ' ');
    const lowerName = baseName.toLowerCase();

    // Try direct match first
    if (byName.has(baseName)) {
      matchedFiles.push({ file, name: baseName, id: byName.get(baseName) });
      continue;
    }

    // Try case-insensitive match
    if (nameLowerToId.has(lowerName)) {
      const properName = nameLowerToName.get(lowerName);
      matchedFiles.push({ file, name: properName, id: nameLowerToId.get(lowerName) });
      continue;
    }

    // Try partial matching (e.g. "Iron Man" from "Iron_Man" in filename, but "Iron Man" in data)
    // But note that the filename "Abomination" matches "Abomination" in our data
    // The filename is usually already the correct name

    unmatchedFiles.push(file);
  }

  console.log('Matched files:', matchedFiles.length);
  console.log('Unmatched files:', unmatchedFiles.length);
  if (unmatchedFiles.length > 0) {
    console.log('Unmatched:', unmatchedFiles.slice(0, 10).join(', '));
  }

  // Step 2: Batch query actual image URLs for matched files
  console.log('Step 2: Fetching image URLs...');
  const mapping = {};

  // Batch in groups of 50
  const BATCH_SIZE = 50;
  for (let i = 0; i < matchedFiles.length; i += BATCH_SIZE) {
    const batch = matchedFiles.slice(i, i + BATCH_SIZE);
    const titles = batch.map(m => `File:${m.file}`).join('|');
    const url = `https://marvel-contestofchampions.fandom.com/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url|size&format=json`;

    const data = await fetchJson(url);
    const pages = data.query?.pages || {};

    for (const pageId in pages) {
      const page = pages[pageId];
      const info = page.imageinfo?.[0];
      if (!info) continue;

      const filename = page.title.replace(/^File:/, '').replace(/ /g, '_');
      const match = matchedFiles.find(m => m.file === filename);
      if (match) {
        mapping[match.id] = info.url;
      }
    }

    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(matchedFiles.length / BATCH_SIZE)} done: ${Object.keys(mapping).length} total URLs`);
  }

  // Step 3: Save
  fs.writeFileSync(OUTPUT, JSON.stringify(mapping, null, 2));
  console.log('Saved to', OUTPUT);
  console.log('Total matched champions:', Object.keys(mapping).length);
  console.log('Total unmatched champions:', champions.length - Object.keys(mapping).length);

  // Show sample URLs
  const sampleIds = Object.keys(mapping).slice(0, 3);
  for (const id of sampleIds) {
    console.log(`  ${id}: ${mapping[id]}`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
