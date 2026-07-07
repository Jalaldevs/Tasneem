/**
 * insert_reminders_complete.js
 *
 * Inserts `complete: "Complete"` into every language's `reminders` section
 * right before `allCaughtUp:`
 */
const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../app/constants/appTranslations.js');
let content = fs.readFileSync(targetFile, 'utf8');

const remindersComplete = {
  english:    'Complete',
  arabic:     'مكتمل',
  chinese:    '完成',
  hindi:      'पूर्ण',
  spanish:    'Completado',
  french:     'Terminé',
  bengali:    'সম্পন্ন',
  portuguese: 'Concluído',
  russian:    'Завершено',
  urdu:       'مکمل',
  german:     'Abgeschlossen',
  japanese:   '完了',
  italian:    'Completato',
  korean:     '완료',
  kurdish:    'Temam',
  macedonian: 'Завршено',
  malay:      'Selesai',
  maltese:    'Lesta',
  nepali:     'पूरा भयो',
  norwegian:  'Fullført',
  persian:    'تکمیل شد',
  polish:     'Zakończono',
  filipino:   'Kumpleto',
  romanian:   'Complet',
  dutch:      'Voltooid',
  slovak:     'Dokončené',
  somali:     'Dhamaystiran',
  swedish:    'Slutförd',
  turkish:    'Tamamlandı',
  uzbek:      'Tugallangan',
  finnish:    'Valmis',
  tamil:      'முடிந்தது',
};

function insertIntoReminders(blockContent, langName) {
  let modified = blockContent;

  if (!modified.includes('    complete:') && remindersComplete[langName]) {
    modified = modified.replace(
      /    allCaughtUp: /,
      `    complete: ${JSON.stringify(remindersComplete[langName])},\n    allCaughtUp: `
    );
    console.log(`  ✓ reminders.complete for ${langName}`);
  }

  return modified;
}

const langBlockRegex = /^const (\w+) = \{/gm;
const matches = [];
let match;
while ((match = langBlockRegex.exec(content)) !== null) {
  matches.push({ name: match[1], start: match.index });
}

const exportIndex = content.indexOf('\nexport default {');

let result = '';
for (let i = 0; i < matches.length; i++) {
  const { name, start } = matches[i];
  const end = i < matches.length - 1 ? matches[i + 1].start : exportIndex;
  let blockContent = content.slice(start, end);

  console.log(`\nProcessing: ${name}`);
  blockContent = insertIntoReminders(blockContent, name);

  result += blockContent;
}

result += content.slice(exportIndex);

fs.writeFileSync(targetFile, result, 'utf8');
console.log('\n✅ Done! reminders.complete inserted for all languages.');
