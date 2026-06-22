import fs from 'fs';
import readline from 'readline';

const logPath = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\d3bf602f-11f3-4d98-8611-8d37911096ac\\.system_generated\\logs\\transcript.jsonl';

async function searchSetupDbRun() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);
      if (line.includes('setup_db_final.js')) {
        console.log(`Step ${obj.step_index} (${obj.type}):`);
        if (obj.content) {
          console.log("Content:", obj.content.substring(0, 500));
        }
      }
    } catch (e) {
    }
  }
}

searchSetupDbRun();
