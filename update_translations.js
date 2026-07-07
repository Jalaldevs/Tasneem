const fs = require('fs');

const file = 'app/constants/appTranslations.js';
let content = fs.readFileSync(file, 'utf8');

const translations = {
  english: { title: "Share Options", message: "What would you like to share?", ayahAndTranslation: "Text & Translation", includeNotes: "Include Notes" },
  arabic: { title: "خيارات المشاركة", message: "ما الذي تود مشاركته؟", ayahAndTranslation: "النص والترجمة", includeNotes: "تضمين الملاحظات" },
  spanish: { title: "Opciones de compartir", message: "¿Qué te gustaría compartir?", ayahAndTranslation: "Texto y traducción", includeNotes: "Incluir notas" },
  french: { title: "Options de partage", message: "Que souhaitez-vous partager ?", ayahAndTranslation: "Texte et traduction", includeNotes: "Inclure les notes" },
  urdu: { title: "شیئر کے اختیارات", message: "آپ کیا شیئر کرنا چاہیں گے؟", ayahAndTranslation: "متن اور ترجمہ", includeNotes: "نوٹس شامل کریں" },
  hindi: { title: "साझा करने के विकल्प", message: "आप क्या साझा करना चाहेंगे?", ayahAndTranslation: "पाठ और अनुवाद", includeNotes: "नोट्स शामिल करें" },
  bengali: { title: "শেয়ার করার বিকল্প", message: "আপনি কি শেয়ার করতে চান?", ayahAndTranslation: "টেক্সট এবং অনুবাদ", includeNotes: "নোট অন্তর্ভুক্ত করুন" },
  indonesian: { title: "Opsi Berbagi", message: "Apa yang ingin Anda bagikan?", ayahAndTranslation: "Teks & Terjemahan", includeNotes: "Sertakan Catatan" },
  russian: { title: "Варианты поделиться", message: "Чем бы вы хотели поделиться?", ayahAndTranslation: "Текст и перевод", includeNotes: "Включить заметки" },
  turkish: { title: "Paylaşım Seçenekleri", message: "Neyi paylaşmak istersiniz?", ayahAndTranslation: "Metin ve Çeviri", includeNotes: "Notları Dahil Et" },
  german: { title: "Teilen Optionen", message: "Was möchten Sie teilen?", ayahAndTranslation: "Text & Übersetzung", includeNotes: "Notizen einschließen" },
  italian: { title: "Opzioni di condivisione", message: "Cosa vorresti condividere?", ayahAndTranslation: "Testo e traduzione", includeNotes: "Includi note" },
  portuguese: { title: "Opções de compartilhamento", message: "O que você gostaria de compartilhar?", ayahAndTranslation: "Texto e Tradução", includeNotes: "Incluir Notas" },
  persian: { title: "گزینه های اشتراک گذاری", message: "چه چیزی را می خواهید به اشتراک بگذارید؟", ayahAndTranslation: "متن و ترجمه", includeNotes: "شامل یادداشت ها" },
  kurdish: { title: "Vebijarkên Parvekirinê", message: "Hûn dixwazin çi parve bikin?", ayahAndTranslation: "Nivîsar & Werger", includeNotes: "Têbînî tevlî bikin" },
  pashto: { title: "د شریکولو اختیارونه", message: "تاسو څه شریکول غواړئ؟", ayahAndTranslation: "متن او ژباړه", includeNotes: "یادښتونه شامل کړئ" },
  malay: { title: "Pilihan Kongsi", message: "Apa yang anda ingin kongsi?", ayahAndTranslation: "Teks & Terjemahan", includeNotes: "Sertakan Nota" },
  somali: { title: "Fursadaha La Wadaagida", message: "Maxaad jeclaan lahayd inaad la wadaagto?", ayahAndTranslation: "Qoraalka iyo Tarjumaadda", includeNotes: "Ku dar Qoraallada" },
  dutch: { title: "Deelopties", message: "Wat wil je delen?", ayahAndTranslation: "Tekst & Vertaling", includeNotes: "Inclusief notities" },
  swedish: { title: "Delningsalternativ", message: "Vad vill du dela?", ayahAndTranslation: "Text & Översättning", includeNotes: "Inkludera anteckningar" }
};

const langRegex = /^const\s+([a-zA-Z]+)\s*=\s*\{/gm;
let match;
const languages = [];
while ((match = langRegex.exec(content)) !== null) {
  languages.push(match[1]);
}

languages.forEach(lang => {
  const trans = translations[lang] || translations['english'];
  const block = `\n  share: {
    title: "${trans.title}",
    message: "${trans.message}",
    ayahAndTranslation: "${trans.ayahAndTranslation}",
    includeNotes: "${trans.includeNotes}",
  },`;
  
  const regex = new RegExp(`^const ${lang} = \\{([\\s\\S]*?)^\\};`, 'm');
  
  content = content.replace(regex, (fullMatch, body) => {
    if (body.includes('share: {')) return fullMatch;
    let newBody = body.replace(/,?\\s*$/, '');
    return `const ${lang} = {${newBody},${block}\n};`;
  });
});

fs.writeFileSync(file, content);
console.log('Done adding share block to all languages.');
