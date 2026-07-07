const fs = require('fs');
const file = 'app/constants/appTranslations.js';
let content = fs.readFileSync(file, 'utf8');

// The faulty injection created this pattern:
//   },
//
// ,
//   share: {
//
// We want to fix it to just:
//   },
//   share: {

content = content.replace(/},\s*,\s*share: \{/g, '},\n  share: {');

fs.writeFileSync(file, content);
console.log('Fixed syntax errors.');
