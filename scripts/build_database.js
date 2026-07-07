const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'tasneem_data.db');
const SUNNAH_DIR = path.join(__dirname, '..', 'assets', 'sunnah', 'editions');
const TAFSEER_DIR = path.join(__dirname, '..', 'assets', 'tafseer');

// Remove existing DB if it exists
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
}

const db = new Database(DB_PATH);

// Optimization for massive inserts
db.pragma('journal_mode = WAL');
db.pragma('synchronous = OFF');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS Hadiths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    edition TEXT,
    hadithnumber INTEGER,
    arabicnumber REAL,
    text TEXT,
    grades TEXT,
    reference TEXT
  );

  CREATE TABLE IF NOT EXISTS Tafseer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    edition TEXT,
    surah INTEGER,
    ayah INTEGER,
    text TEXT
  );

  CREATE INDEX idx_hadiths_edition ON Hadiths(edition);
  CREATE INDEX idx_tafseer_edition_surah_ayah ON Tafseer(edition, surah, ayah);
`);

const insertHadith = db.prepare(`
  INSERT INTO Hadiths (edition, hadithnumber, arabicnumber, text, grades, reference)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertTafseer = db.prepare(`
  INSERT INTO Tafseer (edition, surah, ayah, text)
  VALUES (?, ?, ?, ?)
`);

// 1. Process Sunnah
console.log('Processing Sunnah (this may take a minute)...');
if (fs.existsSync(SUNNAH_DIR)) {
  const sunnahFiles = fs.readdirSync(SUNNAH_DIR).filter(f => f.endsWith('.json'));
  for (const file of sunnahFiles) {
    if (file === 'editions.json') continue; // Skip metadata
    console.log(`- ${file}`);
    const editionName = file.replace('.min.json', '');
    const data = JSON.parse(fs.readFileSync(path.join(SUNNAH_DIR, file), 'utf8'));
    
    db.transaction(() => {
      for (const hadith of data.hadiths || []) {
        insertHadith.run(
          editionName,
          hadith.hadithnumber,
          hadith.arabicnumber,
          hadith.text,
          JSON.stringify(hadith.grades || []),
          JSON.stringify(hadith.reference || {})
        );
      }
    })();
  }
}

// 2. Process Tafseer
console.log('\nProcessing Tafseer (this may take a minute)...');
if (fs.existsSync(TAFSEER_DIR)) {
  const tafseerEditions = fs.readdirSync(TAFSEER_DIR).filter(d => fs.statSync(path.join(TAFSEER_DIR, d)).isDirectory());
  for (const edition of tafseerEditions) {
    console.log(`- ${edition}`);
    const editionDir = path.join(TAFSEER_DIR, edition);
    const surahFiles = fs.readdirSync(editionDir).filter(f => f.endsWith('.tafseer'));
    
    db.transaction(() => {
      for (const file of surahFiles) {
        const surahData = JSON.parse(fs.readFileSync(path.join(editionDir, file), 'utf8'));
        const ayahsArray = Array.isArray(surahData) ? surahData : (surahData.ayahs || []);
        for (const ayah of ayahsArray) {
          insertTafseer.run(
            edition,
            ayah.surah,
            ayah.ayah,
            ayah.text
          );
        }
      }
    })();
  }
}

console.log('\nDatabase generated successfully at:', DB_PATH);
