import fs from 'fs';
import readline from 'readline';

const logPath = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\d3bf602f-11f3-4d98-8611-8d37911096ac\\.system_generated\\logs\\transcript.jsonl';

async function searchStep() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);
      if (obj.step_index === 119 || obj.step_index === 120 || obj.step_index === 121) {
        console.log(`=== Step ${obj.step_index} ===`);
        console.log(JSON.stringify(obj, null, 2).substring(0, 1000));
      }
    } catch (e) {
    }
  }
}

searchStep();
