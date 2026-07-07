const fs = require('fs');
const path = require('path');

const TRANSLATIONS = {
  english: { title: "Downloading Data", msg: "The Sunnah database is currently downloading. Please wait." },
  arabic: { title: "جاري تنزيل البيانات", msg: "يتم حالياً تنزيل قاعدة بيانات السنة. يرجى الانتظار." },
  chinese: { title: "正在下载数据", msg: "圣训数据库目前正在下载中。请稍候。" },
  hindi: { title: "डेटा डाउनलोड हो रहा है", msg: "सुन्नत डेटाबेस वर्तमान में डाउनलोड हो रहा है। कृपया प्रतीक्षा करें।" },
  spanish: { title: "Descargando Datos", msg: "La base de datos de la Sunnah se está descargando. Por favor espera." },
  french: { title: "Téléchargement des données", msg: "La base de données de la Sunna est en cours de téléchargement. Veuillez patienter." },
  bengali: { title: "তথ্য ডাউনলোড হচ্ছে", msg: "সুন্নাহ ডাটাবেস বর্তমানে ডাউনলোড হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন।" },
  portuguese: { title: "Baixando Dados", msg: "O banco de dados da Sunnah está sendo baixado. Por favor, aguarde." },
  russian: { title: "Загрузка данных", msg: "База данных Сунны в настоящее время загружается. Пожалуйста, подождите." },
  urdu: { title: "ڈیٹا ڈاؤن لوڈ ہو رہا ہے", msg: "سنت کا ڈیٹا بیس فی الحال ڈاؤن لوڈ ہو رہا ہے۔ براہ کرم انتظار کریں۔" },
  german: { title: "Daten werden heruntergeladen", msg: "Die Sunna-Datenbank wird derzeit heruntergeladen. Bitte haben Sie etwas Geduld." },
  japanese: { title: "データをダウンロード中", msg: "現在、スンナデータベースをダウンロードしています。しばらくお待ちください。" },
  italian: { title: "Download dei dati in corso", msg: "Il database della Sunnah è attualmente in fase di download. Si prega di attendere." },
  korean: { title: "데이터 다운로드 중", msg: "현재 수나 데이터베이스를 다운로드 중입니다. 잠시 기다려주십시오." },
  kurdish: { title: "Daneyan dadixîne", msg: "Danegira Sunnetê niha tê daxistin. Ji kerema xwe li bendê bin." },
  macedonian: { title: "Преземање податоци", msg: "Базата на податоци на Сунната моментално се презема. Ве молиме почекайте." },
  malay: { title: "Memuat turun Data", msg: "Pangkalan data Sunnah sedang dimuat turun. Sila tunggu." },
  maltese: { title: "Tniżżil ta' Dejta", msg: "Id-database tas-Sunnah qed titniżżel bħalissa. Jekk jogħġbok stenna." },
  nepali: { title: "डाटा डाउनलोड हुँदैछ", msg: "सुन्नाह डाटाबेस हाल डाउनलोड भइरहेको छ। कृपया प्रतीक्षा गर्नुहोस्।" },
  norwegian: { title: "Laster ned data", msg: "Sunnah-databasen lastes ned for øyeblikket. Vennligst vent." },
  persian: { title: "در حال بارگیری داده‌ها", msg: "پایگاه داده سنت در حال حاضر در حال بارگیری است. لطفا صبر کنید." },
  polish: { title: "Pobieranie danych", msg: "Baza danych Sunna jest obecnie pobierana. Proszę czekać." },
  filipino: { title: "Nagda-download ng Data", msg: "Kasalukuyang nagda-download ang database ng Sunnah. Mangyaring maghintay." },
  romanian: { title: "Se descarcă datele", msg: "Baza de date Sunnah se descarcă în prezent. Vă rugăm să așteptați." },
  dutch: { title: "Gegevens downloaden", msg: "De Sunnah-database wordt momenteel gedownload. Even geduld a.u.b." },
  slovak: { title: "Sťahovanie údajov", msg: "Databáza Sunnah sa momentálne sťahuje. Prosím, počkajte." },
  somali: { title: "Soo dejinta Xogta", msg: "Kaydka macluumaadka Sunnada ayaa hadda la soo dejinayaa. Fadlan sug." },
  swedish: { title: "Laddar ner data", msg: "Sunnah-databasen laddas ner för närvarande. Vänligen vänta." },
  turkish: { title: "Veriler İndiriliyor", msg: "Sünnet veritabanı şu anda indiriliyor. Lütfen bekleyin." },
  uzbek: { title: "Ma'lumotlar yuklanmoqda", msg: "Sunnat ma'lumotlar bazasi hozirda yuklanmoqda. Iltimos, kuting." },
  finnish: { title: "Ladataan tietoja", msg: "Sunna-tietokantaa ladataan parhaillaan. Odota hetki." },
  tamil: { title: "தரவு பதிவிறக்கப்படுகிறது", msg: "சுன்னா தரவுத்தளம் தற்போது பதிவிறக்கப்படுகிறது. தயவுசெய்து காத்திருக்கவும்." },
};

const appTranslationsPath = path.join(__dirname, '../app/constants/appTranslations.js');
let content = fs.readFileSync(appTranslationsPath, 'utf8');

// We need to inject downloadingTitle and downloadingMsg into every language's `premium: {` block
let modifiedCount = 0;

for (const [lang, trans] of Object.entries(TRANSLATIONS)) {
  // Regex to find: const {lang} = { ... premium: { 
  const regex = new RegExp(`(const\\s+${lang}\\s*=\\s*\\{[\\s\\S]*?premium\\s*:\\s*\\{)`);
  
  if (regex.test(content)) {
    // Check if it already has downloadingTitle
    const blockRegex = new RegExp(`const\\s+${lang}\\s*=\\s*\\{[\\s\\S]*?premium\\s*:\\s*\\{[\\s\\S]*?downloadingTitle:`);
    if (!blockRegex.test(content)) {
      content = content.replace(regex, `$1\n      downloadingTitle: "${trans.title}",\n      downloadingMsg: "${trans.msg}",`);
      modifiedCount++;
      console.log(`Updated ${lang}`);
    } else {
      console.log(`Already contains keys for ${lang}`);
    }
  } else {
    console.log(`Could not find premium block for ${lang}`);
  }
}

fs.writeFileSync(appTranslationsPath, content, 'utf8');
console.log(`Successfully updated ${modifiedCount} languages.`);
