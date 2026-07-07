/**
 * insert_zakat_translations.js
 * 
 * Inserts `zakat` section and `referenceUI.shareAyah` key into all language
 * blocks in appTranslations.js that are missing them.
 *
 * Safe to run multiple times — idempotent (checks before inserting).
 */
const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../app/constants/appTranslations.js');
let content = fs.readFileSync(targetFile, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// ZAKAT translations for all 30 languages
// ─────────────────────────────────────────────────────────────────────────────
const zakatTranslations = {
  // english & arabic already exist — skip them
  chinese: {
    title: '扎卡特计算器',
    nisabQuestion: '您的财富是否超过了尼萨布并保持了整整一个伊斯兰历年？',
    wealthLabel: '总财富（储蓄、黄金、白银等）',
    wealthPlaceholder: '0.00',
    zakatDue: '应缴天课（2.5%）',
    setReminder: '在下一个伊斯兰历年提醒我（354天）',
    reminderBody: '是时候检查您的天课了。',
    reminderSuccess: '提醒设置成功！',
    eligibilityTitle: '谁有资格接受天课？',
    categories: [
      { title: '贫困者', desc: '一无所有或财物极少的人。' },
      { title: '贫乏者', desc: '虽有一些财物但不足以满足基本需求的人。' },
      { title: '天课收集者', desc: '被任命收集和分配天课的人。' },
      { title: '心被收服者', desc: '为争取其心（通常是新穆斯林）。' },
      { title: '解放奴隶', desc: '解放奴隶或俘虏。' },
      { title: '负债者', desc: '无力偿还债务的人。' },
      { title: '为主道', desc: '在真主道路上（伊斯兰传播、防御等）。' },
      { title: '旅途困顿者', desc: '旅途中身陷困境、缺乏物资的旅行者。' },
    ],
  },
  hindi: {
    title: 'ज़कात कैलकुलेटर',
    nisabQuestion: 'क्या आपकी संपत्ति एक पूर्ण हिजरी वर्ष के लिए निसाब से अधिक है?',
    wealthLabel: 'कुल संपत्ति (बचत, सोना, चाँदी, आदि)',
    wealthPlaceholder: '0.00',
    zakatDue: 'देय ज़कात (2.5%)',
    setReminder: 'अगले हिजरी वर्ष में याद दिलाएँ (354 दिन)',
    reminderBody: 'अपनी ज़कात की जाँच करने का समय आ गया है।',
    reminderSuccess: 'रिमाइंडर सफलतापूर्वक सेट किया गया!',
    eligibilityTitle: 'ज़कात पाने के योग्य कौन है?',
    categories: [
      { title: 'अल-फ़क़ीरा (ग़रीब)', desc: 'जिनके पास कुछ भी नहीं या बहुत कम है।' },
      { title: 'अल-मसाकीन (ज़रूरतमंद)', desc: 'जिनके पास कुछ धन है लेकिन बुनियादी ज़रूरतें पूरी नहीं होतीं।' },
      { title: 'अल-आमिलीन (ज़कात संग्रहकर्ता)', desc: 'ज़कात एकत्र करने और वितरित करने के लिए नियुक्त लोग।' },
      { title: 'मुअल्लफ़तुल क़ुलूब', desc: 'नव-मुस्लिमों के दिलों को जीतना।' },
      { title: 'अर-रिक़ाब', desc: 'दासों या बंदियों को मुक्त करना।' },
      { title: 'अल-ग़ारिमीन', desc: 'जो क़र्ज़ में डूबे हैं और इसे चुका नहीं सकते।' },
      { title: 'फ़ी सबीलिल्लाह', desc: 'अल्लाह के रास्ते में (इस्लामी प्रचार, रक्षा, आदि)।' },
      { title: 'इब्नुस सबील (यात्री)', desc: 'साधनहीन यात्री।' },
    ],
  },
  spanish: {
    title: 'Calculadora de Zakat',
    nisabQuestion: '¿Ha superado el Nisab durante un año lunar completo?',
    wealthLabel: 'Riqueza total (ahorros, oro, plata, etc.)',
    wealthPlaceholder: '0.00',
    zakatDue: 'Zakat a pagar (2,5%)',
    setReminder: 'Recuérdame el próximo año Hijri (354 días)',
    reminderBody: 'Es el momento de revisar tu Zakat.',
    reminderSuccess: '¡Recordatorio establecido con éxito!',
    eligibilityTitle: '¿Quién es elegible para recibir el Zakat?',
    categories: [
      { title: 'Al-Fuqara (Los pobres)', desc: 'Los que no tienen nada o muy poco.' },
      { title: 'Al-Masakin (Los necesitados)', desc: 'Los que tienen algo de riqueza pero no suficiente para sus necesidades básicas.' },
      { title: 'Al-Ameleen (Recaudadores de Zakat)', desc: 'Los designados para recaudar y distribuir el Zakat.' },
      { title: "Mu'allafatul Quloob", desc: 'Para reconciliar corazones (generalmente nuevos musulmanes).' },
      { title: 'Ar-Riqaab', desc: 'Para liberar esclavos o cautivos.' },
      { title: 'Al-Gharimeen', desc: 'Los que están endeudados y no pueden pagar.' },
      { title: 'Fi Sabeelillah', desc: 'En la causa de Alá (propagación islámica, defensa, etc.).' },
      { title: 'Ibnus Sabeel (El viajero)', desc: 'Un viajero varado sin provisiones.' },
    ],
  },
  french: {
    title: 'Calculateur de Zakat',
    nisabQuestion: 'Avez-vous dépassé le Nisab pendant une année lunaire complète?',
    wealthLabel: 'Richesse totale (économies, or, argent, etc.)',
    wealthPlaceholder: '0.00',
    zakatDue: 'Zakat due (2,5%)',
    setReminder: 'Me rappeler la prochaine année hégirienne (354 jours)',
    reminderBody: 'Il est temps de vérifier votre Zakat.',
    reminderSuccess: 'Rappel défini avec succès!',
    eligibilityTitle: 'Qui est éligible pour recevoir la Zakat?',
    categories: [
      { title: 'Al-Fuqara (Les pauvres)', desc: "Ceux qui n'ont rien ou très peu." },
      { title: 'Al-Masakin (Les nécessiteux)', desc: "Ceux qui ont quelques richesses mais pas assez pour leurs besoins de base." },
      { title: 'Al-Ameleen (Collecteurs de Zakat)', desc: 'Ceux chargés de collecter et distribuer la Zakat.' },
      { title: "Mu'allafatul Quloob", desc: 'Pour réconcilier les cœurs (souvent les nouveaux musulmans).' },
      { title: 'Ar-Riqaab', desc: 'Pour libérer des esclaves ou des captifs.' },
      { title: 'Al-Gharimeen', desc: 'Ceux qui sont endettés et ne peuvent pas rembourser.' },
      { title: 'Fi Sabeelillah', desc: "Dans la cause d'Allah (propagation islamique, défense, etc.)." },
      { title: 'Ibnus Sabeel (Le voyageur)', desc: "Un voyageur bloqué sans provisions." },
    ],
  },
  bengali: {
    title: 'যাকাত ক্যালকুলেটর',
    nisabQuestion: 'আপনার সম্পদ কি এক পূর্ণ হিজরি বছর ধরে নিসাবের উপরে ছিল?',
    wealthLabel: 'মোট সম্পদ (সঞ্চয়, সোনা, রূপা, ইত্যাদি)',
    wealthPlaceholder: '০.০০',
    zakatDue: 'প্রদেয় যাকাত (২.৫%)',
    setReminder: 'পরের হিজরি বছরে মনে করিয়ে দিন (৩৫৪ দিন)',
    reminderBody: 'আপনার যাকাত পর্যালোচনা করার সময় হয়েছে।',
    reminderSuccess: 'রিমাইন্ডার সফলভাবে সেট হয়েছে!',
    eligibilityTitle: 'কে যাকাত পেতে যোগ্য?',
    categories: [
      { title: 'আল-ফুকারা (দরিদ্র)', desc: 'যাদের কিছুই নেই বা খুবই কম আছে।' },
      { title: 'আল-মাসাকিন (অভাবী)', desc: 'যাদের কিছু সম্পদ আছে কিন্তু মৌলিক চাহিদা পূরণের জন্য যথেষ্ট নয়।' },
      { title: 'আল-আমেলীন (যাকাত সংগ্রহকারী)', desc: 'যাকাত সংগ্রহ ও বিতরণের জন্য নিযুক্ত ব্যক্তি।' },
      { title: "মুআল্লাফাতুল কুলুব", desc: 'হৃদয় একত্রিত করতে (প্রায়ই নতুন মুসলিম)।' },
      { title: 'আর-রিকাব', desc: 'দাস বা বন্দীদের মুক্ত করতে।' },
      { title: 'আল-গারিমীন', desc: 'যারা ঋণে জর্জরিত এবং পরিশোধ করতে পারছেন না।' },
      { title: 'ফী সাবীলিল্লাহ', desc: 'আল্লাহর পথে (ইসলাম প্রচার, প্রতিরক্ষা ইত্যাদি)।' },
      { title: 'ইবনুস সাবীল (মুসাফির)', desc: 'পথে আটকা পড়া সম্বলহীন মুসাফির।' },
    ],
  },
  portuguese: {
    title: 'Calculadora de Zakat',
    nisabQuestion: 'A sua riqueza superou o Nisab por um ano lunar completo?',
    wealthLabel: 'Riqueza total (poupanças, ouro, prata, etc.)',
    wealthPlaceholder: '0.00',
    zakatDue: 'Zakat a pagar (2,5%)',
    setReminder: 'Lembrar-me no próximo ano Hijri (354 dias)',
    reminderBody: 'É hora de verificar o seu Zakat.',
    reminderSuccess: 'Lembrete definido com sucesso!',
    eligibilityTitle: 'Quem é elegível para receber o Zakat?',
    categories: [
      { title: 'Al-Fuqara (Os pobres)', desc: 'Os que nada têm ou muito pouco.' },
      { title: 'Al-Masakin (Os necessitados)', desc: 'Os que têm alguma riqueza mas insuficiente para as suas necessidades básicas.' },
      { title: 'Al-Ameleen (Coletores de Zakat)', desc: 'Os nomeados para recolher e distribuir o Zakat.' },
      { title: "Mu'allafatul Quloob", desc: 'Para reconciliar corações (frequentemente novos muçulmanos).' },
      { title: 'Ar-Riqaab', desc: 'Para libertar escravos ou cativos.' },
      { title: 'Al-Gharimeen', desc: 'Os que estão endividados e não conseguem pagar.' },
      { title: 'Fi Sabeelillah', desc: 'Na causa de Allah (propagação islâmica, defesa, etc.).' },
      { title: 'Ibnus Sabeel (O viajante)', desc: 'Um viajante sem provisões.' },
    ],
  },
  russian: {
    title: 'Калькулятор Закята',
    nisabQuestion: 'Превысило ли ваше состояние нисаб в течение полного лунного года?',
    wealthLabel: 'Общее состояние (сбережения, золото, серебро и др.)',
    wealthPlaceholder: '0.00',
    zakatDue: 'Закят к уплате (2,5%)',
    setReminder: 'Напомнить мне в следующем году по хиджре (354 дня)',
    reminderBody: 'Пришло время проверить ваш Закят.',
    reminderSuccess: 'Напоминание успешно установлено!',
    eligibilityTitle: 'Кто имеет право на получение Закята?',
    categories: [
      { title: 'Аль-Фукара (Бедные)', desc: 'Те, у кого ничего нет или очень мало.' },
      { title: 'Аль-Масакин (Нуждающиеся)', desc: 'Те, у кого есть некоторое имущество, но недостаточно для удовлетворения основных потребностей.' },
      { title: 'Аль-Амилин (Сборщики закята)', desc: 'Назначенные для сбора и распределения Закята.' },
      { title: "Му'аллафатуль-кулюб", desc: 'Для примирения сердец (часто новые мусульмане).' },
      { title: 'Ар-Рикаб', desc: 'Для освобождения рабов или пленников.' },
      { title: 'Аль-Гаримин', desc: 'Те, кто обременён долгами и не может их выплатить.' },
      { title: 'Фи Сабилиллах', desc: 'На пути Аллаха (распространение ислама, защита и т.д.).' },
      { title: 'Ибнус-Сабиль (Путник)', desc: 'Путник, застрявший без средств к существованию.' },
    ],
  },
  urdu: {
    title: 'زکاۃ کیلکولیٹر',
    nisabQuestion: 'کیا آپ کی دولت ایک پورے ہجری سال تک نصاب سے زیادہ رہی؟',
    wealthLabel: 'کل دولت (بچت، سونا، چاندی وغیرہ)',
    wealthPlaceholder: '0.00',
    zakatDue: 'واجب الادا زکاۃ (2.5%)',
    setReminder: 'اگلے ہجری سال یاد دلائیں (354 دن)',
    reminderBody: 'اپنی زکاۃ چیک کرنے کا وقت ہو گیا ہے۔',
    reminderSuccess: 'یاددہانی کامیابی سے سیٹ ہو گئی!',
    eligibilityTitle: 'زکاۃ لینے کا حق کسے ہے؟',
    categories: [
      { title: 'الفقراء (غریب)', desc: 'جن کے پاس کچھ بھی نہیں یا بہت کم ہے۔' },
      { title: 'المساکین (مسکین)', desc: 'جن کے پاس کچھ مال ہے لیکن بنیادی ضروریات کے لیے کافی نہیں۔' },
      { title: 'العاملون (زکاۃ جمع کرنے والے)', desc: 'زکاۃ جمع اور تقسیم کرنے کے لیے مقرر کردہ افراد۔' },
      { title: 'المؤلفة قلوبهم', desc: 'دلوں کو اسلام کی طرف راغب کرنا (اکثر نئے مسلمان)۔' },
      { title: 'الرقاب', desc: 'غلاموں یا قیدیوں کو آزاد کروانا۔' },
      { title: 'الغارمون', desc: 'وہ لوگ جو قرض میں ڈوبے ہوں اور ادا نہ کر سکتے ہوں۔' },
      { title: 'فی سبیل اللہ', desc: 'اللہ کی راہ میں (اسلام کی تبلیغ، دفاع وغیرہ)۔' },
      { title: 'ابن السبیل (مسافر)', desc: 'سفر میں پھنسا ہوا مسافر جس کے پاس کچھ نہ ہو۔' },
    ],
  },
  german: {
    title: 'Zakat-Rechner',
    nisabQuestion: 'Überstieg Ihr Vermögen den Nisab über ein vollständiges Mondjahr?',
    wealthLabel: 'Gesamtvermögen (Ersparnisse, Gold, Silber usw.)',
    wealthPlaceholder: '0.00',
    zakatDue: 'Fällige Zakat (2,5%)',
    setReminder: 'Im nächsten Hijri-Jahr erinnern (354 Tage)',
    reminderBody: 'Es ist Zeit, Ihre Zakat zu überprüfen.',
    reminderSuccess: 'Erinnerung erfolgreich gesetzt!',
    eligibilityTitle: 'Wer ist berechtigt, Zakat zu empfangen?',
    categories: [
      { title: 'Al-Fuqara (Die Armen)', desc: 'Diejenigen, die nichts oder sehr wenig haben.' },
      { title: 'Al-Masakin (Die Bedürftigen)', desc: 'Diejenigen, die etwas Vermögen haben, aber nicht genug für ihre Grundbedürfnisse.' },
      { title: 'Al-Ameleen (Zakat-Sammler)', desc: 'Diejenigen, die zur Einziehung und Verteilung der Zakat bestimmt sind.' },
      { title: "Mu'allafatul Quloob", desc: 'Zur Gewinnung von Herzen (oft neue Muslime).' },
      { title: 'Ar-Riqaab', desc: 'Zur Befreiung von Sklaven oder Gefangenen.' },
      { title: 'Al-Gharimeen', desc: 'Diejenigen, die verschuldet sind und nicht zahlen können.' },
      { title: 'Fi Sabeelillah', desc: 'Im Dienst Allahs (islamische Verbreitung, Verteidigung usw.).' },
      { title: 'Ibnus Sabeel (Der Reisende)', desc: 'Ein gestrandeter Reisender ohne Vorräte.' },
    ],
  },
  japanese: {
    title: 'ザカート計算機',
    nisabQuestion: 'あなたの財産は1ヒジュラ暦年を通じてニサーブを超えていましたか？',
    wealthLabel: '総財産（貯蓄、金、銀など）',
    wealthPlaceholder: '0.00',
    zakatDue: '支払うべきザカート（2.5%）',
    setReminder: '次のヒジュラ暦年に通知する（354日）',
    reminderBody: 'ザカートを確認する時期です。',
    reminderSuccess: 'リマインダーが正常に設定されました！',
    eligibilityTitle: 'ザカートを受け取る資格があるのは誰ですか？',
    categories: [
      { title: 'アル・フカラー（貧しい人）', desc: '何も持っていないか、ほとんど持っていない人。' },
      { title: 'アル・マサーキーン（困窮者）', desc: '多少の財産はあるが、基本的なニーズを満たすには不十分な人。' },
      { title: 'アル・アーミリーン（ザカート収集者）', desc: 'ザカートの徴収・分配を任された人。' },
      { title: "ムアッラファトゥル・クルーブ", desc: '心を和解させるため（多くの場合、新しいムスリム）。' },
      { title: 'アッラーリカーブ', desc: '奴隷や捕虜を解放するため。' },
      { title: 'アル・ガーリミーン', desc: '借金を抱え、返済できない人。' },
      { title: 'フィー・サビーリッラー', desc: 'アッラーの道のため（イスラームの布教・防衛など）。' },
      { title: 'イブヌッ・サビール（旅人）', desc: '旅の途中で立ち往生した旅人。' },
    ],
  },
  italian: {
    title: 'Calcolatore Zakat',
    nisabQuestion: 'La tua ricchezza ha superato il Nisab per un anno lunare completo?',
    wealthLabel: 'Ricchezza totale (risparmi, oro, argento, ecc.)',
    wealthPlaceholder: '0.00',
    zakatDue: 'Zakat dovuta (2,5%)',
    setReminder: 'Ricordami il prossimo anno Hijri (354 giorni)',
    reminderBody: 'È ora di controllare il tuo Zakat.',
    reminderSuccess: 'Promemoria impostato con successo!',
    eligibilityTitle: 'Chi ha diritto a ricevere lo Zakat?',
    categories: [
      { title: 'Al-Fuqara (I poveri)', desc: "Coloro che non hanno nulla o molto poco." },
      { title: 'Al-Masakin (I bisognosi)', desc: 'Coloro che hanno qualche ricchezza ma non sufficiente per i bisogni di base.' },
      { title: 'Al-Ameleen (Raccoglitori di Zakat)', desc: 'Coloro designati a raccogliere e distribuire lo Zakat.' },
      { title: "Mu'allafatul Quloob", desc: 'Per riconciliare i cuori (spesso nuovi musulmani).' },
      { title: 'Ar-Riqaab', desc: 'Per liberare schiavi o prigionieri.' },
      { title: 'Al-Gharimeen', desc: 'Coloro che sono indebitati e non possono pagare.' },
      { title: 'Fi Sabeelillah', desc: "Nella causa di Allah (propagazione islamica, difesa, ecc.)." },
      { title: 'Ibnus Sabeel (Il viaggiatore)', desc: 'Un viaggiatore bloccato senza provviste.' },
    ],
  },
  korean: {
    title: '자카트 계산기',
    nisabQuestion: '귀하의 재산이 완전한 히즈라력 1년 동안 니사브를 초과했습니까?',
    wealthLabel: '총 재산 (저축, 금, 은 등)',
    wealthPlaceholder: '0.00',
    zakatDue: '납부할 자카트 (2.5%)',
    setReminder: '다음 히즈라력 연도에 알림 (354일)',
    reminderBody: '자카트를 확인할 시간입니다.',
    reminderSuccess: '알림이 성공적으로 설정되었습니다!',
    eligibilityTitle: '누가 자카트를 받을 자격이 있습니까?',
    categories: [
      { title: '알 푸카라 (가난한 자)', desc: '아무것도 없거나 매우 적은 사람들.' },
      { title: '알 마사킨 (궁핍한 자)', desc: '약간의 재산은 있지만 기본 필요를 충족하기에 부족한 사람들.' },
      { title: '알 아멜린 (자카트 수집자)', desc: '자카트를 수집하고 배분하도록 임명된 사람들.' },
      { title: "무알라파툴 쿨룹", desc: '마음을 화해시키기 위해 (주로 새로운 무슬림).' },
      { title: '아르 리캅', desc: '노예나 포로를 해방하기 위해.' },
      { title: '알 가리민', desc: '빚을 갚지 못하는 사람들.' },
      { title: '피 사빌릴라', desc: '알라의 길에서 (이슬람 전파, 방어 등).' },
      { title: '이브누스 사빌 (여행자)', desc: '양식 없이 고립된 여행자.' },
    ],
  },
  kurdish: {
    title: 'Hesabkarê Zekat',
    nisabQuestion: 'Ma dewlemendiya we di saleke hicriyan de ji Nisab derbas bû?',
    wealthLabel: 'Dewlemendiya giştî (teserûf, zêr, zîv, hwd.)',
    wealthPlaceholder: '0.00',
    zakatDue: 'Zekata ku divê bê dayîn (2.5%)',
    setReminder: 'Di sala Hicrî ya bê de bîne bîra min (354 roj)',
    reminderBody: 'Dem e ku hûn Zekata xwe kontrol bikin.',
    reminderSuccess: 'Bîranîn bi serfirazî hate danîn!',
    eligibilityTitle: 'Kê mafê wergirtina Zekatê heye?',
    categories: [
      { title: 'El-Fuqara (Feqîr)', desc: 'Kesên ku tiştek an pir kêm tişt hene.' },
      { title: 'El-Mesakin (Hewceder)', desc: 'Kesên ku hinekî dewlemendiya wan heye lê ne bes e.' },
      { title: 'El-Ameleen (Berhevkerên Zekatê)', desc: 'Kesên ku ji bo berhevkirin û dabeşkirina Zekatê hatine destnîşankirin.' },
      { title: "Mu'ellefetul Qulûb", desc: 'Ji bo lihevkirina dilan (bi gelemperî Misilmanên nû).' },
      { title: 'Er-Riqab', desc: 'Ji bo azadkirina koleyan an girtiyên.' },
      { title: 'El-Ğarimîn', desc: 'Kesên ku di bin deynê de ne û nikarin bidin.' },
      { title: 'Fi Sebilillah', desc: 'Di riya Xwedê de (belawelakirin, parastina Îslamê, hwd.).' },
      { title: 'Îbnûs Sebîl (Rêwî)', desc: 'Rêwîyekî ku bê amûr maye.' },
    ],
  },
  macedonian: {
    title: 'Калкулатор за Зекат',
    nisabQuestion: 'Дали вашето богатство ги надминало Нисабот за цела хиџриска година?',
    wealthLabel: 'Вкупно богатство (штедења, злато, сребро, итн.)',
    wealthPlaceholder: '0.00',
    zakatDue: 'Зекат за плаќање (2,5%)',
    setReminder: 'Потсети ме следната хиџриска година (354 дена)',
    reminderBody: 'Дојде време да го проверите вашиот Зекат.',
    reminderSuccess: 'Потсетникот е успешно поставен!',
    eligibilityTitle: 'Кој е подобен да прима Зекат?',
    categories: [
      { title: 'Ал-Фукара (Сиромашните)', desc: 'Оние кои немаат ништо или многу малку.' },
      { title: 'Ал-Масакин (Потребните)', desc: 'Оние кои имаат нешто богатство, но не доволно за основни потреби.' },
      { title: 'Ал-Амелин (Собирачи на Зекат)', desc: 'Назначени за собирање и распределба на Зекатот.' },
      { title: "Му'аллафатул Кулуб", desc: 'За помирување на срцата (обично нови Муслимани).' },
      { title: 'Ар-Рикаб', desc: 'За ослободување на робови или заробеници.' },
      { title: 'Ал-Гаримин', desc: 'Оние кои се задолжени и не можат да платат.' },
      { title: 'Фи Сабилиллах', desc: 'На патот на Аллах (ширење на Исламот, одбрана, итн.).' },
      { title: 'Ибнус Сабил (Патникот)', desc: 'Патник заглавен без средства.' },
    ],
  },
  malay: {
    title: 'Kalkulator Zakat',
    nisabQuestion: 'Adakah harta anda melebihi Nisab selama setahun penuh kalendar Hijrah?',
    wealthLabel: 'Jumlah harta (simpanan, emas, perak, dll.)',
    wealthPlaceholder: '0.00',
    zakatDue: 'Zakat yang perlu dibayar (2.5%)',
    setReminder: 'Ingatkan saya tahun Hijrah akan datang (354 hari)',
    reminderBody: 'Sudah tiba masanya untuk menyemak Zakat anda.',
    reminderSuccess: 'Peringatan berjaya ditetapkan!',
    eligibilityTitle: 'Siapa yang layak menerima Zakat?',
    categories: [
      { title: 'Al-Fuqara (Orang Miskin)', desc: 'Mereka yang tidak mempunyai apa-apa atau sangat sedikit.' },
      { title: 'Al-Masakin (Yang Memerlukan)', desc: 'Mereka yang mempunyai sedikit harta tetapi tidak mencukupi untuk keperluan asas.' },
      { title: 'Al-Ameleen (Pemungut Zakat)', desc: 'Mereka yang dilantik untuk mengutip dan mengagihkan Zakat.' },
      { title: "Mu'allafatul Quloob", desc: 'Untuk melembutkan hati (biasanya mualaf).' },
      { title: 'Ar-Riqaab', desc: 'Untuk membebaskan hamba atau tawanan.' },
      { title: 'Al-Gharimeen', desc: 'Mereka yang berhutang dan tidak mampu membayar.' },
      { title: 'Fi Sabeelillah', desc: 'Di jalan Allah (dakwah Islam, pertahanan, dll.).' },
      { title: 'Ibnus Sabeel (Musafir)', desc: 'Seorang musafir yang terkandas tanpa bekalan.' },
    ],
  },
  maltese: {
    title: 'Kalkulatur Zakat',
    nisabQuestion: "Il-ġid tiegħek aqbeż in-Nisab għal sena lunari sħiħa?",
    wealthLabel: 'Ġid totali (tfaddil, deheb, fidda, eċċ.)',
    wealthPlaceholder: '0.00',
    zakatDue: 'Zakat dovuta (2.5%)',
    setReminder: 'Ftakkarni fis-sena Hijri li jmiss (354 jum)',
    reminderBody: "Wasal iż-żmien biex tivverifika z-Zakat tiegħek.",
    reminderSuccess: 'Tfakkira ssettjata b\'suċċess!',
    eligibilityTitle: 'Min huwa eliġibbli biex jirċievi z-Zakat?',
    categories: [
      { title: 'Al-Fuqara (Il-Fqar)', desc: "Dawk li ma għandhom xejn jew ftit ħafna." },
      { title: 'Al-Masakin (Il-Bżognuż)', desc: 'Dawk li għandhom xi ġid iżda mhux biżżejjed.' },
      { title: 'Al-Ameleen (Ġabriet Zakat)', desc: 'Dawk maħtura biex jiġbru u jqassmu z-Zakat.' },
      { title: "Mu'allafatul Quloob", desc: 'Biex jirrikonċiljaw il-qlub (spiss Musulmani ġodda).' },
      { title: 'Ar-Riqaab', desc: 'Biex jeħilsu lsiera jew priġunieri.' },
      { title: 'Al-Gharimeen', desc: 'Dawk li huma f\'dejn u ma jistgħux iħallsu.' },
      { title: 'Fi Sabeelillah', desc: "Fil-kawża ta' Allah (tixrid Iżlamiku, difiża, eċċ.)." },
      { title: 'Ibnus Sabeel (Il-Vjaġġatur)', desc: 'Vjaġġatur imwaqqaf mingħajr provvisti.' },
    ],
  },
  nepali: {
    title: 'जकात क्यालकुलेटर',
    nisabQuestion: 'के तपाईंको सम्पत्ति पूरा एक हिजरी वर्षसम्म निसाबभन्दा बढी थियो?',
    wealthLabel: 'कुल सम्पत्ति (बचत, सुन, चाँदी आदि)',
    wealthPlaceholder: '0.00',
    zakatDue: 'तिर्नुपर्ने जकात (2.5%)',
    setReminder: 'अर्को हिजरी वर्षमा सम्झाउनुहोस् (354 दिन)',
    reminderBody: 'तपाईंको जकात जाँच्ने समय भयो।',
    reminderSuccess: 'रिमाइन्डर सफलतापूर्वक सेट गरियो!',
    eligibilityTitle: 'जकात पाउन को योग्य छ?',
    categories: [
      { title: 'अल-फुकारा (गरिब)', desc: 'जसलाई केही छैन वा धेरै कम छ।' },
      { title: 'अल-मसाकिन (आवश्यकता भएका)', desc: 'जसलाई केही सम्पत्ति छ तर मूलभूत आवश्यकताका लागि पर्याप्त छैन।' },
      { title: 'अल-आमेलीन (जकात संग्रहकर्ता)', desc: 'जकात संग्रह र वितरणका लागि नियुक्त।' },
      { title: "मुअल्लाफतुल कुलूब", desc: 'मनलाई एकजुट गर्न (प्रायः नयाँ मुस्लिम)।' },
      { title: 'अर-रिकाब', desc: 'दास वा बन्दीहरूलाई मुक्त गर्न।' },
      { title: 'अल-गारिमीन', desc: 'कर्जमा डुबेका र तिर्न नसक्नेहरू।' },
      { title: 'फी साबीलिल्लाह', desc: 'अल्लाहको मार्गमा (इस्लाम प्रचार, सुरक्षा आदि)।' },
      { title: 'इब्नुस साबील (यात्री)', desc: 'बाटोमा अड्किएको असहाय यात्री।' },
    ],
  },
  norwegian: {
    title: 'Zakat-kalkulator',
    nisabQuestion: 'Oversteg formuen din Nisab i et fullstendig månedår (Hijri)?',
    wealthLabel: 'Total formue (sparing, gull, sølv osv.)',
    wealthPlaceholder: '0.00',
    zakatDue: 'Zakat å betale (2,5%)',
    setReminder: 'Minn meg på neste Hijri-år (354 dager)',
    reminderBody: 'Det er på tide å sjekke din Zakat.',
    reminderSuccess: 'Påminnelse satt vellykket!',
    eligibilityTitle: 'Hvem er berettiget til å motta Zakat?',
    categories: [
      { title: 'Al-Fuqara (De fattige)', desc: 'De som ikke har noe eller svært lite.' },
      { title: 'Al-Masakin (De trengende)', desc: 'De som har noe formue, men ikke nok til grunnleggende behov.' },
      { title: 'Al-Ameleen (Zakat-innsamlere)', desc: 'De utpekt til å samle inn og fordele Zakat.' },
      { title: "Mu'allafatul Quloob", desc: 'For å forsone hjerter (ofte nye muslimer).' },
      { title: 'Ar-Riqaab', desc: 'For å frigi slaver eller fanger.' },
      { title: 'Al-Gharimeen', desc: 'De som er gjeldstynget og ikke kan betale.' },
      { title: 'Fi Sabeelillah', desc: "I Allahs sak (islamsk formidling, forsvar osv.)." },
      { title: 'Ibnus Sabeel (Den reisende)', desc: 'En strandet reisende uten proviant.' },
    ],
  },
  persian: {
    title: 'ماشین‌حساب زکات',
    nisabQuestion: 'آیا ثروت شما در طول یک سال کامل هجری از نصاب تجاوز کرده است؟',
    wealthLabel: 'ثروت کل (پس‌انداز، طلا، نقره و غیره)',
    wealthPlaceholder: '0.00',
    zakatDue: 'زکات پرداختنی (۲.۵٪)',
    setReminder: 'در سال هجری بعدی یادم بینداز (354 روز)',
    reminderBody: 'وقت بررسی زکات شماست.',
    reminderSuccess: 'یادآور با موفقیت تنظیم شد!',
    eligibilityTitle: 'چه کسانی واجد شرایط دریافت زکات هستند؟',
    categories: [
      { title: 'الفقراء (فقیران)', desc: 'کسانی که هیچ چیز ندارند یا بسیار کم دارند.' },
      { title: 'المساکین (مستمندان)', desc: 'کسانی که مقداری ثروت دارند اما برای نیازهای اساسی کافی نیست.' },
      { title: 'العاملین (جمع‌آوری‌کنندگان زکات)', desc: 'کسانی که برای جمع‌آوری و توزیع زکات منصوب شده‌اند.' },
      { title: 'المؤلفة قلوبهم', desc: 'برای آشتی دادن قلب‌ها (معمولاً مسلمانان تازه‌وارد).' },
      { title: 'الرقاب', desc: 'برای آزاد کردن بردگان یا اسیران.' },
      { title: 'الغارمین', desc: 'کسانی که بدهکار هستند و توان بازپرداخت ندارند.' },
      { title: 'فی سبیل‌الله', desc: 'در راه خدا (تبلیغ اسلام، دفاع و غیره).' },
      { title: 'ابن‌السبیل (مسافر)', desc: 'مسافری که در راه مانده و ندار است.' },
    ],
  },
  polish: {
    title: 'Kalkulator Zakat',
    nisabQuestion: 'Czy Twój majątek przekraczał Nisab przez pełny rok księżycowy?',
    wealthLabel: 'Łączny majątek (oszczędności, złoto, srebro itp.)',
    wealthPlaceholder: '0.00',
    zakatDue: 'Należny Zakat (2,5%)',
    setReminder: 'Przypomnij mi w następnym roku hidżry (354 dni)',
    reminderBody: 'Czas sprawdzić swój Zakat.',
    reminderSuccess: 'Przypomnienie ustawiono pomyślnie!',
    eligibilityTitle: 'Kto kwalifikuje się do otrzymania Zakat?',
    categories: [
      { title: 'Al-Fuqara (Ubodzy)', desc: 'Ci, którzy nic nie mają lub bardzo mało.' },
      { title: 'Al-Masakin (Potrzebujący)', desc: 'Ci, którzy mają trochę majątku, ale nie wystarczającego na podstawowe potrzeby.' },
      { title: 'Al-Ameleen (Zbieracze Zakat)', desc: 'Ci wyznaczeni do zbierania i dystrybucji Zakat.' },
      { title: "Mu'allafatul Quloob", desc: 'Dla pojednania serc (często nowi muzułmanie).' },
      { title: 'Ar-Riqaab', desc: 'Dla wyzwolenia niewolników lub jeńców.' },
      { title: 'Al-Gharimeen', desc: 'Ci, którzy są zadłużeni i nie mogą zapłacić.' },
      { title: 'Fi Sabeelillah', desc: 'Na drodze Allaha (szerzenie islamu, obrona itp.).' },
      { title: 'Ibnus Sabeel (Podróżnik)', desc: 'Podróżnik uwięziony bez środków do życia.' },
    ],
  },
  filipino: {
    title: 'Zakat Calculator',
    nisabQuestion: 'Nalampasan ba ng iyong kayamanan ang Nisab sa loob ng isang buong taong Hijri?',
    wealthLabel: 'Kabuuang kayamanan (ipon, ginto, pilak, atbp.)',
    wealthPlaceholder: '0.00',
    zakatDue: 'Zakat na dapat bayaran (2.5%)',
    setReminder: 'Ipaalala sa susunod na taong Hijri (354 araw)',
    reminderBody: 'Panahon na para suriin ang iyong Zakat.',
    reminderSuccess: 'Matagumpay na naitakda ang paalala!',
    eligibilityTitle: 'Sino ang karapat-dapat makatanggap ng Zakat?',
    categories: [
      { title: 'Al-Fuqara (Ang mga Mahirap)', desc: 'Ang mga walang wala o napakakaunti.' },
      { title: 'Al-Masakin (Ang mga Nangangailangan)', desc: 'Ang mga may kaunting kayamanan ngunit hindi sapat para sa pangunahing pangangailangan.' },
      { title: 'Al-Ameleen (Mga Tagakolekta ng Zakat)', desc: 'Ang mga itinalaga para mangolekta at mamahagi ng Zakat.' },
      { title: "Mu'allafatul Quloob", desc: 'Para pagsamahin ang mga puso (kadalasang bagong Muslim).' },
      { title: 'Ar-Riqaab', desc: 'Para palayain ang mga alipin o bihag.' },
      { title: 'Al-Gharimeen', desc: 'Ang mga may utang at hindi makapagbayad.' },
      { title: 'Fi Sabeelillah', desc: 'Sa landas ng Allah (pagpapalawak ng Islam, depensa, atbp.).' },
      { title: 'Ibnus Sabeel (Ang Manlalakbay)', desc: 'Isang manlalakbay na natigil nang walang probisyon.' },
    ],
  },
  romanian: {
    title: 'Calculator Zakat',
    nisabQuestion: 'A depășit averea dumneavoastră Nisab-ul pe parcursul unui an lunar complet?',
    wealthLabel: 'Avere totală (economii, aur, argint etc.)',
    wealthPlaceholder: '0.00',
    zakatDue: 'Zakat de plătit (2,5%)',
    setReminder: 'Amintește-mi în anul Hijri următor (354 zile)',
    reminderBody: 'Este timpul să verificați Zakat-ul dumneavoastră.',
    reminderSuccess: 'Reamintire setată cu succes!',
    eligibilityTitle: 'Cine este eligibil să primească Zakat?',
    categories: [
      { title: 'Al-Fuqara (Săracii)', desc: 'Cei care nu au nimic sau foarte puțin.' },
      { title: 'Al-Masakin (Cei nevoiași)', desc: 'Cei care au ceva avere, dar nu suficientă pentru nevoile de bază.' },
      { title: 'Al-Ameleen (Colectorii de Zakat)', desc: 'Cei desemnați să colecteze și să distribuie Zakat-ul.' },
      { title: "Mu'allafatul Quloob", desc: 'Pentru a reconcilia inimile (adesea musulmani noi).' },
      { title: 'Ar-Riqaab', desc: 'Pentru a elibera sclavi sau prizonieri.' },
      { title: 'Al-Gharimeen', desc: 'Cei care sunt îndatorați și nu pot plăti.' },
      { title: 'Fi Sabeelillah', desc: "În cauza lui Allah (propagare islamică, apărare etc.)." },
      { title: 'Ibnus Sabeel (Călătorul)', desc: 'Un călător blocat fără provizii.' },
    ],
  },
  dutch: {
    title: 'Zakat Calculator',
    nisabQuestion: 'Oversteeg uw vermogen de Nisab gedurende een volledig maanjaar?',
    wealthLabel: 'Totaal vermogen (spaargeld, goud, zilver, enz.)',
    wealthPlaceholder: '0.00',
    zakatDue: 'Te betalen Zakat (2,5%)',
    setReminder: 'Herinner me aan het volgende Hijri-jaar (354 dagen)',
    reminderBody: 'Het is tijd om uw Zakat te controleren.',
    reminderSuccess: 'Herinnering succesvol ingesteld!',
    eligibilityTitle: 'Wie komt in aanmerking voor Zakat?',
    categories: [
      { title: 'Al-Fuqara (De armen)', desc: 'Degenen die niets hebben of zeer weinig.' },
      { title: 'Al-Masakin (De behoeftigen)', desc: 'Degenen die enig vermogen hebben, maar niet genoeg voor basisbehoeften.' },
      { title: 'Al-Ameleen (Zakat-inzamelaars)', desc: 'Degenen aangesteld om Zakat in te zamelen en te verdelen.' },
      { title: "Mu'allafatul Quloob", desc: 'Om harten te verzoenen (vaak nieuwe moslims).' },
      { title: 'Ar-Riqaab', desc: 'Om slaven of gevangenen vrij te laten.' },
      { title: 'Al-Gharimeen', desc: 'Degenen die in schulden zitten en niet kunnen betalen.' },
      { title: 'Fi Sabeelillah', desc: "In de zaak van Allah (islamitische verspreiding, verdediging enz.)." },
      { title: 'Ibnus Sabeel (De reiziger)', desc: 'Een gestrand reiziger zonder proviand.' },
    ],
  },
  slovak: {
    title: 'Kalkulačka Zakat',
    nisabQuestion: 'Presiahlo vaše bohatstvo Nisab počas celého mesiačneho roka?',
    wealthLabel: 'Celkové bohatstvo (úspory, zlato, striebro atď.)',
    wealthPlaceholder: '0.00',
    zakatDue: 'Splatný Zakat (2,5 %)',
    setReminder: 'Pripomenúť mi v ďalšom roku Hidžry (354 dní)',
    reminderBody: 'Je čas skontrolovať váš Zakat.',
    reminderSuccess: 'Pripomienka bola úspešne nastavená!',
    eligibilityTitle: 'Kto má nárok na prijatie Zakatu?',
    categories: [
      { title: 'Al-Fuqara (Chudobní)', desc: 'Tí, ktorí nemajú nič alebo veľmi málo.' },
      { title: 'Al-Masakin (Núdzni)', desc: 'Tí, ktorí majú trochu majetku, ale nie dosť na základné potreby.' },
      { title: 'Al-Ameleen (Vyberatelia Zakatu)', desc: 'Určení na vyberanie a rozdeľovanie Zakatu.' },
      { title: "Mu'allafatul Quloob", desc: 'Na zmierenie sŕdc (často noví moslimovia).' },
      { title: 'Ar-Riqaab', desc: 'Na oslobodenie otrokov alebo zajatcov.' },
      { title: 'Al-Gharimeen', desc: 'Tí, ktorí sú zadlžení a nemôžu platiť.' },
      { title: 'Fi Sabeelillah', desc: 'V Allahovej veci (islamské šírenie, obrana atď.).' },
      { title: 'Ibnus Sabeel (Cestujúci)', desc: 'Uviaznutý cestujúci bez prostriedkov.' },
    ],
  },
  somali: {
    title: 'Xisaabiyaha Zakada',
    nisabQuestion: 'Miyay hantidaadu ka dhaaftay Nisaabka sanad guurti Hijri ah oo buuxda?',
    wealthLabel: 'Hanta guud (badbaadinta, dahabka, lacagta, iwm.)',
    wealthPlaceholder: '0.00',
    zakatDue: 'Zakada la bixiyo (2.5%)',
    setReminder: 'I xasuusii sanadka Hijri ee xiga (354 maalmood)',
    reminderBody: 'Waa waqtigii aad Zakadaada hubinaysay.',
    reminderSuccess: 'Xusuusinta si guul leh ayaa loo dejiyay!',
    eligibilityTitle: 'Yaa xaq u leh inuu Zakada helo?',
    categories: [
      { title: 'Al-Fuqara (Masaakiinta)', desc: 'Kuwa aan waxba lahayn ama aad yar.' },
      { title: 'Al-Masakin (Baahida leh)', desc: 'Kuwa haysta xoogaa hanti laakiin kuma filan baahida aasaasiga ah.' },
      { title: 'Al-Ameleen (Ururiyayaasha Zakada)', desc: 'Kuwa loo xilsaaray in ay uruuriyaan oo ay u qaybiyaan Zakada.' },
      { title: "Mu'allafatul Quloob", desc: 'Si loo helo wadashaqeynta qalbiyadda (badanaa Muslimiinta cusub).' },
      { title: 'Ar-Riqaab', desc: 'Si loo xoreeyo addoonta ama maxaabiista.' },
      { title: 'Al-Gharimeen', desc: 'Kuwa lagu xidayo deynta oo ayna bixin karin.' },
      { title: 'Fi Sabeelillah', desc: 'Saboolka Eebbe (faafinta Islaamka, difaaca, iwm.).' },
      { title: 'Ibnus Sabeel (Musaafirka)', desc: 'Musaafir ku xidhan oo aan waxba lahayn.' },
    ],
  },
  swedish: {
    title: 'Zakat-kalkylator',
    nisabQuestion: 'Översteg din förmögenhet Nisab under ett fullständigt månår?',
    wealthLabel: 'Total förmögenhet (besparingar, guld, silver, osv.)',
    wealthPlaceholder: '0.00',
    zakatDue: 'Zakat att betala (2,5%)',
    setReminder: 'Påminn mig nästa Hijri-år (354 dagar)',
    reminderBody: 'Det är dags att kontrollera din Zakat.',
    reminderSuccess: 'Påminnelse inställd!',
    eligibilityTitle: 'Vem är berättigad att ta emot Zakat?',
    categories: [
      { title: 'Al-Fuqara (De fattiga)', desc: 'De som inte har något eller mycket lite.' },
      { title: 'Al-Masakin (De behövande)', desc: 'De som har viss förmögenhet men inte tillräckligt för grundläggande behov.' },
      { title: 'Al-Ameleen (Zakat-insamlare)', desc: 'De utsedda att samla in och fördela Zakat.' },
      { title: "Mu'allafatul Quloob", desc: 'För att förena hjärtan (ofta nya muslimer).' },
      { title: 'Ar-Riqaab', desc: 'För att befria slavar eller fångar.' },
      { title: 'Al-Gharimeen', desc: 'De som är skuldsatta och inte kan betala.' },
      { title: 'Fi Sabeelillah', desc: 'I Allahs sak (islamisk spridning, försvar, osv.).' },
      { title: 'Ibnus Sabeel (Den resande)', desc: 'En strandsatt resande utan förnödenheter.' },
    ],
  },
  turkish: {
    title: 'Zekât Hesaplayıcı',
    nisabQuestion: 'Servetiniz tam bir hicri yıl boyunca nisabı aştı mı?',
    wealthLabel: 'Toplam servet (tasarruf, altın, gümüş vb.)',
    wealthPlaceholder: '0.00',
    zakatDue: 'Ödenecek Zekât (%2,5)',
    setReminder: 'Bir sonraki Hicri yılda hatırlat (354 gün)',
    reminderBody: 'Zekâtınızı kontrol etme zamanı geldi.',
    reminderSuccess: 'Hatırlatıcı başarıyla ayarlandı!',
    eligibilityTitle: 'Zekât almaya kim hak kazanır?',
    categories: [
      { title: 'El-Fukarâ (Fakirler)', desc: 'Hiçbir şeyi olmayan veya çok az olanlar.' },
      { title: 'El-Mesâkîn (Yoksullar)', desc: 'Bir miktar serveti olan ama temel ihtiyaçlarını karşılamak için yeterli değil.' },
      { title: 'El-Âmilûn (Zekât Toplayanlar)', desc: 'Zekâtı toplamak ve dağıtmak için görevlendirilenler.' },
      { title: "El-Müellefe-i Kulûb", desc: 'Kalpleri ısındırmak için (çoğunlukla yeni Müslümanlar).' },
      { title: 'Er-Rikâb', desc: 'Köleleri veya esirleri azat etmek için.' },
      { title: 'El-Ğârimîn', desc: 'Borçlu olan ve ödeyemeyen kişiler.' },
      { title: 'Fî Sebîlillâh', desc: "Allah yolunda (İslam'ın yayılması, savunma vb.)." },
      { title: "İbnus-Sebîl (Yolcu)", desc: "Azıksız kalan bir yolcu." },
    ],
  },
  uzbek: {
    title: 'Zakot kalkulyatori',
    nisabQuestion: "Boyligingiz to'liq bir hijriy yil davomida nisob miqdoridan oshganmi?",
    wealthLabel: "Umumiy boylik (jamg'arma, oltin, kumush va boshqalar)",
    wealthPlaceholder: '0.00',
    zakatDue: "To'lanadigan zakot (2,5%)",
    setReminder: "Keyingi hijriy yilda eslatib qo'ying (354 kun)",
    reminderBody: 'Zakotingizni tekshirish vaqti keldi.',
    reminderSuccess: "Eslatma muvaffaqiyatli o'rnatildi!",
    eligibilityTitle: "Zakot olishga kim haqli?",
    categories: [
      { title: "Al-Fuqaro (Kambag'allar)", desc: "Hech narsasi bo'lmagan yoki juda oz bo'lganlar." },
      { title: "Al-Masokin (Muhtojlar)", desc: "Biroz boyligi bor, lekin asosiy ehtiyojlari uchun yetarli emas." },
      { title: "Al-Amileen (Zakot yig'uvchilar)", desc: "Zakotni yig'ish va taqsimlash uchun tayinlanganlar." },
      { title: "Mu'allafatul Qulub", desc: "Qalblarni birlashtirish uchun (ko'pincha yangi musulmonlar)." },
      { title: 'Ar-Riqob', desc: "Qul yoki asirlarni ozod qilish uchun." },
      { title: 'Al-G\'arimeen', desc: "Qarzga botgan va to'lay olmaydigan odamlar." },
      { title: 'Fi Sabilillah', desc: "Alloh yo'lida (Islomni tarqatish, mudofaa va boshqalar)." },
      { title: 'Ibnus Sabeel (Musofir)', desc: "Yo'lda qolib ketgan musofir." },
    ],
  },
  finnish: {
    title: 'Zakat-laskuri',
    nisabQuestion: 'Ylittikö varallisuutesi Nisabin koko kuukalenterivuoden ajan?',
    wealthLabel: 'Kokonaisvarallisuus (säästöt, kulta, hopea jne.)',
    wealthPlaceholder: '0.00',
    zakatDue: 'Maksettava Zakat (2,5%)',
    setReminder: 'Muistuta minua ensi Hijri-vuonna (354 päivää)',
    reminderBody: 'On aika tarkistaa Zakatisi.',
    reminderSuccess: 'Muistutus asetettu onnistuneesti!',
    eligibilityTitle: 'Kuka on oikeutettu saamaan Zakatin?',
    categories: [
      { title: 'Al-Fuqara (Köyhät)', desc: 'Ne, joilla ei ole mitään tai hyvin vähän.' },
      { title: 'Al-Masakin (Tarvitsevat)', desc: 'Ne, joilla on jonkin verran varallisuutta mutta ei tarpeeksi perustarpeisiin.' },
      { title: 'Al-Ameleen (Zakat-kerääjät)', desc: 'Ne, jotka on nimetty keräämään ja jakamaan Zakatin.' },
      { title: "Mu'allafatul Quloob", desc: 'Sydänten sovittamiseksi (usein uudet muslimit).' },
      { title: 'Ar-Riqaab', desc: 'Orjien tai vankien vapauttamiseksi.' },
      { title: 'Al-Gharimeen', desc: 'Ne, jotka ovat velkaantuneet eivätkä pysty maksamaan.' },
      { title: 'Fi Sabeelillah', desc: 'Allahin asiassa (islamin levittäminen, puolustus jne.).' },
      { title: 'Ibnus Sabeel (Matkalainen)', desc: 'Jumiutunut matkalainen ilman varusteita.' },
    ],
  },
  tamil: {
    title: 'ஜகாத் கணிப்பான்',
    nisabQuestion: 'உங்கள் செல்வம் ஒரு முழு ஹிஜ்ரி ஆண்டு முழுவதும் நிஸாபை தாண்டியதா?',
    wealthLabel: 'மொத்த செல்வம் (சேமிப்பு, தங்கம், வெள்ளி போன்றவை)',
    wealthPlaceholder: '0.00',
    zakatDue: 'செலுத்த வேண்டிய ஜகாத் (2.5%)',
    setReminder: 'அடுத்த ஹிஜ்ரி ஆண்டில் நினைவூட்டவும் (354 நாட்கள்)',
    reminderBody: 'உங்கள் ஜகாத்தை சரிபார்க்கும் நேரம் இது.',
    reminderSuccess: 'நினைவூட்டல் வெற்றிகரமாக அமைக்கப்பட்டது!',
    eligibilityTitle: 'யார் ஜகாத் பெற தகுதியானவர்கள்?',
    categories: [
      { title: 'அல்-ஃபுக்கரா (ஏழைகள்)', desc: 'எதுவும் இல்லாதவர்கள் அல்லது மிகவும் குறைவாக உள்ளவர்கள்.' },
      { title: 'அல்-மஸாகீன் (தேவைப்படுபவர்கள்)', desc: 'சிறிது செல்வம் உள்ளவர்கள் ஆனால் அடிப்படை தேவைகளுக்கு போதுமானதில்லை.' },
      { title: 'அல்-ஆமிலீன் (ஜகாத் சேகரிப்பாளர்கள்)', desc: 'ஜகாத் சேகரிக்கவும் விநியோகிக்கவும் நியமிக்கப்பட்டவர்கள்.' },
      { title: "முஃஅல்லஃபத்துல் குலூப்", desc: 'இதயங்களை ஒன்றிணைக்க (பெரும்பாலும் புதிய முஸ்லிம்கள்).' },
      { title: 'அர்-ரிக்காப்', desc: 'அடிமைகள் அல்லது கைதிகளை விடுவிக்க.' },
      { title: 'அல்-ஃகாரிமீன்', desc: 'கடனில் மூழ்கி திருப்பிச் செலுத்த முடியாதவர்கள்.' },
      { title: 'ஃபீ சபீலில்லாஹ்', desc: 'அல்லாஹ்வின் பாதையில் (இஸ்லாமிய பரப்பு, பாதுகாப்பு போன்றவை).' },
      { title: 'இப்னுஸ் சபீல் (பயணி)', desc: 'வழிநடுவில் தவிக்கும் பயணி.' },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// shareAyah translations for referenceUI
// ─────────────────────────────────────────────────────────────────────────────
const shareAyahTranslations = {
  english: 'Share Ayah',
  arabic: 'مشاركة الآية',
  chinese: '分享经文',
  hindi: 'आयत शेयर करें',
  spanish: 'Compartir Ayah',
  french: 'Partager l\'Ayah',
  bengali: 'আয়াত শেয়ার করুন',
  portuguese: 'Compartilhar Ayah',
  russian: 'Поделиться аятом',
  urdu: 'آیت شیئر کریں',
  german: 'Ayah teilen',
  japanese: 'アーヤを共有',
  italian: 'Condividi Ayah',
  korean: '아야 공유',
  kurdish: 'Ayetê Parve Bike',
  macedonian: 'Сподели Ает',
  malay: 'Kongsi Ayah',
  maltese: 'Aqsam l-Ayah',
  nepali: 'आयत शेयर गर्नुहोस्',
  norwegian: 'Del Ayah',
  persian: 'اشتراک‌گذاری آیه',
  polish: 'Udostępnij Ayah',
  filipino: 'Ibahagi ang Ayah',
  romanian: 'Distribuie Ayah',
  dutch: 'Ayah delen',
  slovak: 'Zdieľať Ayah',
  somali: 'La wadaag Aayada',
  swedish: 'Dela Ayah',
  turkish: 'Ayeti Paylaş',
  uzbek: 'Oyatni ulashing',
  finnish: 'Jaa Ayah',
  tamil: 'ஆயத்தை பகிர்',
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Build the JS object string for a zakat section
// ─────────────────────────────────────────────────────────────────────────────
function buildZakatSection(t) {
  const categoriesStr = t.categories.map(cat =>
    `      { title: ${JSON.stringify(cat.title)}, desc: ${JSON.stringify(cat.desc)} }`
  ).join(',\n');

  return `  zakat: {
    title: ${JSON.stringify(t.title)},
    nisabQuestion: ${JSON.stringify(t.nisabQuestion)},
    wealthLabel: ${JSON.stringify(t.wealthLabel)},
    wealthPlaceholder: ${JSON.stringify(t.wealthPlaceholder)},
    zakatDue: ${JSON.stringify(t.zakatDue)},
    setReminder: ${JSON.stringify(t.setReminder)},
    reminderBody: ${JSON.stringify(t.reminderBody)},
    reminderSuccess: ${JSON.stringify(t.reminderSuccess)},
    eligibilityTitle: ${JSON.stringify(t.eligibilityTitle)},
    categories: [
${categoriesStr}
    ]
  },`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main processing
// ─────────────────────────────────────────────────────────────────────────────
function processLanguageBlock(blockContent, langName) {
  let modified = blockContent;

  // 1. Insert zakat section before calculationMethod (or before the closing };)
  const zakatTrans = zakatTranslations[langName];
  if (zakatTrans && !modified.includes('  zakat: {')) {
    const zakatSection = buildZakatSection(zakatTrans);
    // Insert before calculationMethod section
    if (modified.includes('  calculationMethod: {')) {
      modified = modified.replace('  calculationMethod: {', `${zakatSection}\n  calculationMethod: {`);
    } else {
      // Fallback: insert before last };
      modified = modified.replace(/\};\s*$/, `\n${zakatSection}\n};\n`);
    }
    console.log(`  ✓ Added zakat section for ${langName}`);
  } else if (!zakatTrans && langName !== 'english' && langName !== 'arabic') {
    console.log(`  ⚠ No zakat translation for ${langName} — skipping`);
  } else {
    console.log(`  → zakat already present in ${langName}`);
  }

  // 2. Insert shareAyah into referenceUI
  const shareAyah = shareAyahTranslations[langName];
  if (shareAyah && !modified.includes('shareAyah:')) {
    // Find referenceUI block and add shareAyah after opening brace
    modified = modified.replace(
      /  referenceUI:\s*\{/,
      `  referenceUI: {\n    shareAyah: ${JSON.stringify(shareAyah)},`
    );
    console.log(`  ✓ Added shareAyah for ${langName}`);
  } else {
    console.log(`  → shareAyah already present in ${langName}`);
  }

  // 3. Add reminderBody to existing english/arabic zakat sections if missing
  if ((langName === 'english' || langName === 'arabic') && !modified.includes('reminderBody:')) {
    const reminderBodyStr = langName === 'english'
      ? '    reminderBody: "It is time to check your Zakat.",'
      : '    reminderBody: "حان وقت التحقق من زكاتك.",' ;
    modified = modified.replace(
      /    reminderSuccess:/,
      `${reminderBodyStr}\n    reminderSuccess:`
    );
    console.log(`  ✓ Added reminderBody for ${langName}`);
  }

  return modified;
}

// ─────────────────────────────────────────────────────────────────────────────
// Split file into language blocks and process each
// ─────────────────────────────────────────────────────────────────────────────
// The file looks like:
//   const english = { ... };
//   const arabic = { ... };
//   ...
//   export default { ... }
//
// We split on "const <langName> = {" boundaries

const langBlockRegex = /^const (\w+) = \{/gm;
const matches = [];
let match;
while ((match = langBlockRegex.exec(content)) !== null) {
  matches.push({ name: match[1], start: match.index });
}

// Find export default position
const exportIndex = content.indexOf('\nexport default {');

// Build the modified content by processing each block
let result = '';
for (let i = 0; i < matches.length; i++) {
  const { name, start } = matches[i];
  const end = i < matches.length - 1 ? matches[i + 1].start : exportIndex;
  const blockContent = content.slice(start, end);

  console.log(`\nProcessing: ${name}`);
  const processed = processLanguageBlock(blockContent, name);
  result += processed;
}

// Append the export default part unchanged
result += content.slice(exportIndex);

fs.writeFileSync(targetFile, result, 'utf8');
console.log('\n✅ Done! appTranslations.js has been updated.');
console.log('Run: node -e "const t = require(\'./app/constants/appTranslations.js\'); console.log(\'OK\', Object.keys(t.default || t).length)" to verify.');
