/**
 * insert_common_save.js
 *
 * Inserts `save`, `changeDate`, `changeDateMsg` into every language's
 * `common` section. Also inserts `zakat.daysLeft`, `zakat.selectedDate`,
 * `zakat.changeDateTitle`, `zakat.changeDateMsg` into every zakat section.
 *
 * Idempotent — skips keys that already exist.
 */
const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../app/constants/appTranslations.js');
let content = fs.readFileSync(targetFile, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// Translations for common.save + common.changeDate + common.changeDateMsg
// ─────────────────────────────────────────────────────────────────────────────
const commonSave = {
  english:    'Save',
  arabic:     'حفظ',
  chinese:    '保存',
  hindi:      'सहेजें',
  spanish:    'Guardar',
  french:     'Enregistrer',
  bengali:    'সংরক্ষণ করুন',
  portuguese: 'Salvar',
  russian:    'Сохранить',
  urdu:       'محفوظ کریں',
  german:     'Speichern',
  japanese:   '保存',
  italian:    'Salva',
  korean:     '저장',
  kurdish:    'Tomar bike',
  macedonian: 'Зачувај',
  malay:      'Simpan',
  maltese:    'Ħlief',
  nepali:     'सुरक्षित गर्नुहोस्',
  norwegian:  'Lagre',
  persian:    'ذخیره',
  polish:     'Zapisz',
  filipino:   'I-save',
  romanian:   'Salvează',
  dutch:      'Opslaan',
  slovak:     'Uložiť',
  somali:     'Keydi',
  swedish:    'Spara',
  turkish:    'Kaydet',
  uzbek:      'Saqlash',
  finnish:    'Tallenna',
  tamil:      'சேமி',
};

const changeDateTitle = {
  english:    'Change Date?',
  arabic:     'تغيير التاريخ؟',
  chinese:    '更改日期？',
  hindi:      'तारीख बदलें?',
  spanish:    '¿Cambiar fecha?',
  french:     'Changer la date?',
  bengali:    'তারিখ পরিবর্তন করবেন?',
  portuguese: 'Alterar data?',
  russian:    'Изменить дату?',
  urdu:       'تاریخ تبدیل کریں؟',
  german:     'Datum ändern?',
  japanese:   '日付を変更しますか？',
  italian:    'Cambiare data?',
  korean:     '날짜를 변경할까요?',
  kurdish:    'Dîrok biguheze?',
  macedonian: 'Промени датум?',
  malay:      'Tukar tarikh?',
  maltese:    'Ibdel id-data?',
  nepali:     'मिति परिवर्तन गर्ने?',
  norwegian:  'Endre dato?',
  persian:    'تغییر تاریخ؟',
  polish:     'Zmienić datę?',
  filipino:   'Baguhin ang petsa?',
  romanian:   'Schimbați data?',
  dutch:      'Datum wijzigen?',
  slovak:     'Zmeniť dátum?',
  somali:     'Taariikhda Badal?',
  swedish:    'Ändra datum?',
  turkish:    'Tarihi değiştir?',
  uzbek:      'Sanani o\'zgartirish?',
  finnish:    'Vaihda päivämäärä?',
  tamil:      'தேதியை மாற்றவா?',
};

const changeDateMsg = {
  english:    'You already have a reminder set. Do you want to change it?',
  arabic:     'لديك تذكير مضبوط بالفعل. هل تريد تغييره؟',
  chinese:    '您已经设置了提醒。是否要更改它？',
  hindi:      'आपके पास पहले से एक रिमाइंडर सेट है। क्या आप इसे बदलना चाहते हैं?',
  spanish:    'Ya tienes un recordatorio establecido. ¿Quieres cambiarlo?',
  french:     'Vous avez déjà un rappel défini. Voulez-vous le modifier?',
  bengali:    'আপনার ইতিমধ্যে একটি রিমাইন্ডার সেট আছে। আপনি কি এটি পরিবর্তন করতে চান?',
  portuguese: 'Você já tem um lembrete definido. Deseja alterá-lo?',
  russian:    'У вас уже установлено напоминание. Хотите его изменить?',
  urdu:       'آپ کے پاس پہلے سے ایک یادہانی سیٹ ہے۔ کیا آپ اسے تبدیل کرنا چاہتے ہیں؟',
  german:     'Sie haben bereits eine Erinnerung gesetzt. Möchten Sie diese ändern?',
  japanese:   'リマインダーがすでに設定されています。変更しますか？',
  italian:    'Hai già un promemoria impostato. Vuoi cambiarlo?',
  korean:     '이미 알림이 설정되어 있습니다. 변경하시겠습니까?',
  kurdish:    'Bîranîneke te ya niha heye. Tu dixwazî wê biguhezîni?',
  macedonian: 'Веќе имате поставен потсетник. Дали сакате да го промените?',
  malay:      'Anda sudah mempunyai peringatan. Adakah anda ingin mengubahnya?',
  maltese:    'Diġà għandek tfakkira ssettjata. Trid tbiddilha?',
  nepali:     'तपाईंसँग पहिले नै रिमाइन्डर सेट छ। के तपाईं यसलाई बदल्न चाहनुहुन्छ?',
  norwegian:  'Du har allerede en påminnelse satt. Vil du endre den?',
  persian:    'شما قبلاً یک یادآوری تنظیم کرده‌اید. آیا می‌خواهید آن را تغییر دهید؟',
  polish:     'Masz już ustawione przypomnienie. Czy chcesz je zmienić?',
  filipino:   'Mayroon ka nang nakatakdang paalala. Gusto mo bang baguhin ito?',
  romanian:   'Aveți deja o reamintire setată. Doriți să o modificați?',
  dutch:      'U heeft al een herinnering ingesteld. Wilt u deze wijzigen?',
  slovak:     'Máte už nastavené pripomenutie. Chcete ho zmeniť?',
  somali:     'Waxaad horeyba u diyaarisay xasuusin. Ma rabtaa inaad beddesho?',
  swedish:    'Du har redan en påminnelse inställd. Vill du ändra den?',
  turkish:    'Zaten bir hatırlatıcı ayarlanmış. Değiştirmek ister misiniz?',
  uzbek:      'Siz allaqachon eslatma belgilagansiz. Uni o\'zgartirmoqchimisiz?',
  finnish:    'Sinulla on jo muistutus asetettu. Haluatko muuttaa sen?',
  tamil:      'உங்களுக்கு ஏற்கனவே நினைவூட்டல் அமைக்கப்பட்டுள்ளது. அதை மாற்ற விரும்புகிறீர்களா?',
};

// zakat-specific keys
const zakatDaysLeft = {
  english:    '{days} days remaining',
  arabic:     '{days} يومًا متبقيًا',
  chinese:    '剩余 {days} 天',
  hindi:      '{days} दिन शेष',
  spanish:    '{days} días restantes',
  french:     '{days} jours restants',
  bengali:    '{days} দিন বাকি',
  portuguese: '{days} dias restantes',
  russian:    'Осталось {days} дней',
  urdu:       '{days} دن باقی',
  german:     'Noch {days} Tage',
  japanese:   'あと {days} 日',
  italian:    '{days} giorni rimanenti',
  korean:     '{days}일 남음',
  kurdish:    '{days} roj mane',
  macedonian: 'Уште {days} дена',
  malay:      '{days} hari lagi',
  maltese:    '{days} ġranet fadal',
  nepali:     '{days} दिन बाँकी',
  norwegian:  '{days} dager igjen',
  persian:    '{days} روز مانده',
  polish:     'Pozostało {days} dni',
  filipino:   '{days} araw na natitira',
  romanian:   'Mai sunt {days} zile',
  dutch:      'Nog {days} dagen',
  slovak:     'Zostáva {days} dní',
  somali:     '{days} maalmood haray',
  swedish:    '{days} dagar kvar',
  turkish:    '{days} gün kaldı',
  uzbek:      '{days} kun qoldi',
  finnish:    '{days} päivää jäljellä',
  tamil:      '{days} நாட்கள் மீதமுள்ளன',
};

const zakatSelectedDate = {
  english:    'Reminder Date',
  arabic:     'تاريخ التذكير',
  chinese:    '提醒日期',
  hindi:      'अनुस्मारक तारीख',
  spanish:    'Fecha del recordatorio',
  french:     'Date du rappel',
  bengali:    'রিমাইন্ডারের তারিখ',
  portuguese: 'Data do lembrete',
  russian:    'Дата напоминания',
  urdu:       'یادہانی کی تاریخ',
  german:     'Erinnerungsdatum',
  japanese:   'リマインダーの日付',
  italian:    'Data del promemoria',
  korean:     '알림 날짜',
  kurdish:    'Dîroka Bîranînê',
  macedonian: 'Датум на потсетник',
  malay:      'Tarikh peringatan',
  maltese:    'Data tat-tfakkira',
  nepali:     'स्मरण मिति',
  norwegian:  'Påminnelsesdato',
  persian:    'تاریخ یادآوری',
  polish:     'Data przypomnienia',
  filipino:   'Petsa ng paalala',
  romanian:   'Data reamintire',
  dutch:      'Herinnerdatum',
  slovak:     'Dátum pripomienky',
  somali:     'Taariikhdda xasuusinta',
  swedish:    'Påminnelsedatum',
  turkish:    'Hatırlatıcı tarihi',
  uzbek:      'Eslatma sanasi',
  finnish:    'Muistutuspäivä',
  tamil:      'நினைவூட்டல் தேதி',
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function insertIntoCommon(blockContent, langName) {
  let modified = blockContent;

  // Insert save
  if (!modified.includes('    save:') && commonSave[langName]) {
    modified = modified.replace(
      /    settings: /,
      `    save: ${JSON.stringify(commonSave[langName])},\n    settings: `
    );
    console.log(`  ✓ common.save for ${langName}`);
  }

  return modified;
}

function insertIntoZakat(blockContent, langName) {
  let modified = blockContent;

  const daysLeft = zakatDaysLeft[langName];
  const selectedDate = zakatSelectedDate[langName];
  const changeTitle = changeDateTitle[langName];
  const changeMsg = changeDateMsg[langName];

  if (daysLeft && !modified.includes('    daysLeft:')) {
    modified = modified.replace(
      /    reminderSuccess:/,
      `    daysLeft: ${JSON.stringify(daysLeft)},\n    selectedDate: ${JSON.stringify(selectedDate)},\n    changeDateTitle: ${JSON.stringify(changeTitle)},\n    changeDateMsg: ${JSON.stringify(changeMsg)},\n    reminderSuccess:`
    );
    console.log(`  ✓ zakat countdown/date keys for ${langName}`);
  }

  return modified;
}

// ─────────────────────────────────────────────────────────────────────────────
// Process language blocks
// ─────────────────────────────────────────────────────────────────────────────
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
  blockContent = insertIntoCommon(blockContent, name);
  blockContent = insertIntoZakat(blockContent, name);

  result += blockContent;
}

result += content.slice(exportIndex);

fs.writeFileSync(targetFile, result, 'utf8');
console.log('\n✅ Done! common.save + zakat countdown keys inserted for all languages.');
