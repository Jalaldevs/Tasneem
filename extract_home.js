const fs = require('fs');
const path = 'C:/Users/Jalal/.gemini/antigravity-ide/brain/3595cb39-7d84-454b-ad7f-16cdf072ffb5/.system_generated/logs/transcript_full.jsonl';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('import React, { useEffect, useState, useRef } from')) {
    try {
      const data = JSON.parse(lines[i]);
      if (data.content && data.content.includes("import React, { useEffect, useState, useRef } from 'react';")) {
        const idx = data.content.indexOf("import React, { useEffect, useState, useRef } from 'react';");
        let code = data.content.substring(idx);
        fs.writeFileSync('C:/Users/Jalal/Desktop/Projects/TasneemApp/Home_backup_head.txt', code.substring(0, 15000));
        console.log('Saved backup snippet');
        break;
      }
    } catch(e) {}
  }
}
