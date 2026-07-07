const fs = require('fs');

const path = 'C:/Users/Jalal/.gemini/antigravity-ide/brain/3595cb39-7d84-454b-ad7f-16cdf072ffb5/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(path, 'utf8').split('\n');

for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('"Home.jsx"')) {
    try {
      const data = JSON.parse(lines[i]);
      if (data.type === 'MODEL' && data.tool_calls) {
        for (const tc of data.tool_calls) {
          if (tc.name === 'default_api:replace_file_content' || tc.name === 'default_api:multi_replace_file_content') {
            if (tc.arguments && tc.arguments.TargetFile && tc.arguments.TargetFile.endsWith('Home.jsx')) {
              console.log('Found edit at line', i);
              fs.writeFileSync('C:/Users/Jalal/Desktop/Projects/TasneemApp/last_edit.json', JSON.stringify(tc, null, 2));
              break;
            }
          }
        }
      } else if (data.type === 'SYSTEM' && data.content && data.content.includes('File Path: `file:///c:/Users/Jalal/Desktop/Projects/TasneemApp/app/main/Home.jsx`')) {
         // Sometimes the system dumps the file when it is opened.
         fs.writeFileSync('C:/Users/Jalal/Desktop/Projects/TasneemApp/last_view.json', JSON.stringify(data, null, 2));
      }
    } catch(e) {}
  }
}
