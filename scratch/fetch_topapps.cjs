const fs = require('fs');
const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', (err) => reject(err));
  });
}

async function run() {
  try {
    console.log("Fetching index HTML from topapps.fr...");
    const html = await fetchUrl('https://topapps.fr/');
    
    // Find JS assets in HTML
    const jsMatches = html.match(/\/assets\/[a-zA-Z0-9_-]+\.js/g);
    console.log("Found JS assets:", jsMatches);

    if (jsMatches) {
      for (const jsPath of jsMatches) {
        const fullUrl = `https://topapps.fr${jsPath}`;
        console.log(`Fetching asset: ${fullUrl}...`);
        const jsContent = await fetchUrl(fullUrl);
        fs.writeFileSync(`scratch/topapps_asset.js`, jsContent);
        console.log(`Saved ${fullUrl} to scratch/topapps_asset.js (size: ${jsContent.length} bytes)`);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
