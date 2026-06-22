import fs from 'fs';
import readline from 'readline';

const logPath = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\d3bf602f-11f3-4d98-8611-8d37911096ac\\.system_generated\\logs\\transcript.jsonl';

async function searchCommands() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let index = 0;
  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        obj.tool_calls.forEach(tc => {
          if (tc.name === 'run_command' || tc.name?.includes('command')) {
            const args = tc.arguments || tc.args || {};
            const cmd = args.CommandLine || args.commandLine || args.command || args.Cmd || '';
            const cwd = args.Cwd || args.cwd || '';
            console.log(`Step ${obj.step_index || index} | Cwd: ${cwd} | Cmd: ${cmd}`);
          }
        });
      }
    } catch (e) {
      console.log(`Error parsing line ${index}: ${e.message}`);
    }
    index++;
  }
}

searchCommands();
