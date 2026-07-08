/**
 * insert_prayer_reset_translations.js (v2)
 *
 * Inserts the `reset` key into the `prayerOffsets` block for all 32 languages
 * in app/constants/appTranslations.js. Works line-by-line to avoid regex corruption.
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app', 'constants', 'appTranslations.js');

const RESETS = {
  english:    'Reset',
  arabic:     'إعادة تعيين',
  chinese:    '重置',
  hindi:      'रीसेट',
  spanish:    'Restablecer',
  french:     'Réinitialiser',
  bengali:    'রিসেট করুন',
  portuguese: 'Redefinir',
  russian:    'Сбросить',
  urdu:       'ری سیٹ کریں',
  german:     'Zurücksetzen',
  japanese:   'リセット',
  italian:    'Ripristina',
  korean:     '초기화',
  kurdish:    'Sifir bike',
  macedonian: 'Ресетирај',
  malay:      'Tetapkan semula',
  maltese:    'Irrisettja',
  nepali:     'रिसेट गर्नुहोस्',
  norwegian:  'Tilbakestill',
  persian:    'بازنشانی',
  polish:     'Resetuj',
  filipino:   'I-reset',
  romanian:   'Resetează',
  dutch:      'Resetten',
  slovak:     'Resetovať',
  somali:     'Dib u habeynta',
  swedish:    'Återställ',
  turkish:    'Sıfırla',
  uzbek:      "Qayta o'rnatish",
  finnish:    'Nollaa',
  tamil:      'மீட்டமை',
};

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');
const resultLines = [];

let currentLang = null;
let inPrayerOffsets = false;
let prayerOffsetsBraceDepth = 0;
let patchCount = 0;
let alreadyHasReset = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  // Detect language variable declaration: "const english = {"
  const langMatch = line.match(/^const\s+(\w+)\s*=\s*\{/);
  if (langMatch) {
    currentLang = langMatch[1];
    inPrayerOffsets = false;
    prayerOffsetsBraceDepth = 0;
    alreadyHasReset = false;
  }

  // Detect entering prayerOffsets block
  if (!inPrayerOffsets && trimmed.startsWith('prayerOffsets:') && trimmed.includes('{')) {
    inPrayerOffsets = true;
    prayerOffsetsBraceDepth = 1;
    alreadyHasReset = false;
  } else if (inPrayerOffsets) {
    // Count braces to track when we exit the block
    for (const ch of trimmed) {
      if (ch === '{') prayerOffsetsBraceDepth++;
      if (ch === '}') prayerOffsetsBraceDepth--;
    }

    if (prayerOffsetsBraceDepth <= 0) {
      // We're exiting the prayerOffsets block
      inPrayerOffsets = false;
    } else {
      // Inside prayerOffsets block
      if (trimmed.startsWith('reset:')) {
        alreadyHasReset = true;
      }

      // Detect the save: line — insert reset right after it
      if (trimmed.startsWith('save:') && !alreadyHasReset && currentLang && RESETS[currentLang]) {
        resultLines.push(line);
        // Determine indentation from the save line
        const indentMatch = line.match(/^(\s+)/);
        const indent = indentMatch ? indentMatch[1] : '    ';
        // Use the same line ending as the save line
        const lineEnding = line.endsWith('\r') ? '\r' : '';
        // Ensure save line has a comma
        if (!trimmed.endsWith(',') && !trimmed.endsWith(',\r')) {
          // remove line we just pushed, add with comma
          resultLines.pop();
          const withComma = line.trimEnd().replace(/,?\s*$/, ',');
          resultLines.push(withComma + (line.endsWith('\r') ? '\r' : ''));
        }
        // Add reset line
        const resetLine = `${indent}reset: "${RESETS[currentLang]}",${lineEnding}`;
        resultLines.push(resetLine);
        console.log(`  [OK] ${currentLang}`);
        patchCount++;
        continue;
      }
    }
  }

  resultLines.push(line);
}

fs.writeFileSync(filePath, resultLines.join('\n'), 'utf8');
console.log(`\nDone! Patched ${patchCount} language(s).`);
