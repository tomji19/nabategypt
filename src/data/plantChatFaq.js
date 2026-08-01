/**
 * Plant FAQ chatbot — bilingual Q&A for plant lovers.
 * `shop` optional path to deepen the answer on the storefront.
 */
export const PLANT_CHAT_FAQ = [
  {
    id: 'easy-care',
    q: {
      en: 'I want a plant that is easy care — almost unkillable',
      ar: 'أريد نبتة سهلة العناية — يصعب قتلها',
    },
    a: {
      en: 'Look for “easy” care plants: snake plant, pothos, ZZ, and many succulents. Water only when the top soil is dry — never on a fixed everyday schedule. Start in our Easy care section.',
      ar: 'ابحث عن نباتات بعناية «سهلة»: نبتة الثعبان، البثوس، ZZ، وكثير من الصباريات. اروِ فقط عندما يجف سطح التربة — ليس كل يوم. ابدأ من قسم العناية السهلة.',
    },
    shop: '/shop?care=easy',
  },
  {
    id: 'no-daily-water',
    q: {
      en: 'I can’t water every day — what should I get?',
      ar: 'لا أستطيع الري كل يوم — ماذا يناسبني؟',
    },
    a: {
      en: 'Most houseplants prefer less water, not more. Succulents and snake plants can go a week or longer between drinks. Overwatering is the #1 beginner mistake — check soil first.',
      ar: 'معظم نباتات المنزل تفضّل ريّاً أقل لا أكثر. الصباريات ونبتة الثعبان قد تصبر أسبوعاً أو أكثر. الإفراط في الري هو الخطأ الأشهر — افحص التربة أولاً.',
    },
    shop: '/shop?care=easy',
  },
  {
    id: 'good-scent',
    q: {
      en: 'Something with a lovely scent for home or balcony',
      ar: 'شيء برائحة جميلة للبيت أو الشرفة',
    },
    a: {
      en: 'Mint, basil, and rosemary perfume a kitchen or sunny balcony. Keep them in bright light and pinch leaves often — that also refreshes the scent.',
      ar: 'النعناع والريحان وإكليل الجبل يعطّران المطبخ أو الشرفة المشمسة. ضعها في ضوء ساطع وقلّم الأوراق كثيراً — ذلك يجدّد العطر أيضاً.',
    },
    shop: '/shop?category=Outdoor%20Plants',
  },
  {
    id: 'edible',
    q: {
      en: 'Can I grow something I can add to food?',
      ar: 'هل يمكن زراعة شيء يُضاف للطعام؟',
    },
    a: {
      en: 'Yes — kitchen herbs: mint for tea, basil for pasta, rosemary for roasting. Grow them in sun, harvest little and often, and rinse before cooking.',
      ar: 'نعم — أعشاب المطبخ: نعناع للشاي، ريحان للمعكرونة، إكليل جبل للشوي. ازرعها في الشمس، واقطف قليلاً وبشكل متكرر، واغسلها قبل الطبخ.',
    },
    shop: '/shop?category=Outdoor%20Plants',
  },
  {
    id: 'low-light',
    q: {
      en: 'My room doesn’t get much sun',
      ar: 'غرفتي لا تحصل على شمس كثيرة',
    },
    a: {
      en: 'Choose low-to-medium light greens: snake plant, pothos, or ZZ. Avoid desert succulents in dark corners — they stretch and weaken. Filter: Light → Low on the shop.',
      ar: 'اختر خضرة لضوء منخفض إلى متوسط: نبتة الثعبان أو البثوس أو ZZ. تجنّب صباريات الصحراء في الزوايا المظلمة. من المتجر: الضوء ← منخفض.',
    },
    shop: '/shop',
  },
  {
    id: 'bright-room',
    q: {
      en: 'I have a bright, sunny window',
      ar: 'لدي نافذة مشرقة ومشمسة',
    },
    a: {
      en: 'Lucky you — succulents, herbs, and many outdoor balcony plants thrive there. Give morning sun if midday Alexandria heat is intense, and rotate the pot weekly.',
      ar: 'حظاً سعيداً — الصباريات والأعشاب وكثير من نباتات الشرفة تحب ذلك. فضّل شمس الصباح إن كانت ظهيرة الإسكندرية حادة، ودوّر الأصيص أسبوعياً.',
    },
    shop: '/shop?category=Succulent',
  },
  {
    id: 'beginner',
    q: {
      en: 'I’m a first-time plant parent — where do I start?',
      ar: 'أنا مبتدئ مع النباتات — من أين أبدأ؟',
    },
    a: {
      en: 'Start with one easy plant, a brightish spot, and a simple rule: water when dry, not by the calendar. Read the care note on each product — and browse Easy care first.',
      ar: 'ابدأ بنبتة واحدة سهلة، ومكان مضيء قليلاً، وقاعدة بسيطة: اروِ عند الجفاف لا حسب التقويم. اقرأ ملاحظة العناية على كل منتج — وابدأ من العناية السهلة.',
    },
    shop: '/shop?care=easy',
  },
  {
    id: 'gift',
    q: {
      en: 'I want a cute gift for someone I love',
      ar: 'أريد هدية لطيفة لمن أحب',
    },
    a: {
      en: 'Gift-ready plants arrive looking thoughtful — great for birthdays, new homes, or “just because.” Pick from Gift ready on the homepage, or tell us the vibe (desk, balcony, calm corner).',
      ar: 'نباتات «جاهزة للهدايا» تصل بمظهر مدروس — مثالية للأعياد أو المنزل الجديد أو «بدون مناسبة». اختر من قسم الهدايا في الصفحة الرئيسية، أو أخبرنا بالمزاج (مكتب، شرفة، ركن هادئ).',
    },
    shop: '/shop',
  },
  {
    id: 'pets',
    q: {
      en: 'I have cats or dogs — what should I avoid?',
      ar: 'لدي قطط أو كلاب — ماذا أتجنّب؟',
    },
    a: {
      en: 'Some popular plants (like certain pothos and philodendrons) can upset pets if chewed. Keep tempting leaves out of reach, or ask us on WhatsApp for pet-friendlier picks before you order.',
      ar: 'بعض النباتات الشائعة (مثل أنواع من البثوس والفيلوديندرون) قد تزعج الحيوانات إن مُضغت. أبعد الأوراق عن المتناول، أو اسألنا عبر واتساب عن خيارات ألطف للحيوانات قبل الطلب.',
    },
    shop: '/contact',
  },
  {
    id: 'outdoor',
    q: {
      en: 'What thrives on an Alexandria balcony?',
      ar: 'ماذا ينجح على شرفة في الإسكندرية؟',
    },
    a: {
      en: 'Sun-loving outdoor plants and herbs love our coastal light — watch harsh midday summer sun. Outdoor Plants on the shop is the best starting aisle.',
      ar: 'نباتات الخارج المحبّة للشمس والأعشاب تحب ضوء الساحل — احذر شمس الظهيرة الحادة صيفاً. قسم النباتات الخارجية في المتجر هو أفضل بداية.',
    },
    shop: '/shop?category=Outdoor%20Plants',
  },
  {
    id: 'indoor',
    q: {
      en: 'Best plants for a calm living room',
      ar: 'أفضل نباتات لغرفة معيشة هادئة',
    },
    a: {
      en: 'Soft foliage indoor plants — pothos, snake plant, leafy greens — settle beautifully away from AC drafts. Browse Indoor Plants and Bestsellers for proven favorites.',
      ar: 'نباتات داخلية بأوراق ناعمة — بثوس، نبتة الثعبان، خضرة مورقة — تبدو رائعة بعيداً عن تيارات التكييف. تصفّح النباتات الداخلية والأكثر مبيعاً.',
    },
    shop: '/shop?category=Indoor%20Plants',
  },
  {
    id: 'succulents',
    q: {
      en: 'Tell me about succulents',
      ar: 'أخبرني عن الصباريات',
    },
    a: {
      en: 'Succulents store water in their leaves — bright light, rare watering, and a pot with drainage. Perfect if you travel or forget the watering can.',
      ar: 'الصباريات تخزّن الماء في أوراقها — ضوء ساطع، ري نادر، وأصيص بتصريف. مثالية إن كنت تسافر أو تنسى الري.',
    },
    shop: '/shop?category=Succulent',
  },
  {
    id: 'yellow-leaves',
    q: {
      en: 'Why are my plant’s leaves turning yellow?',
      ar: 'لماذا تتحول أوراق نبتتي إلى الأصفر؟',
    },
    a: {
      en: 'Usually too much water, or not enough light. Let soil dry deeper, empty saucers, and move closer to a bright window (not scorching glass). One yellow leaf can also be normal aging.',
      ar: 'غالباً ري زائد أو ضوء قليل. اترك التربة تجف أكثر، وأفرغ الصحن، وقرّبها من نافذة مضيئة (لا زجاج محرق). ورقة صفراء واحدة قد تكون شيخوخة طبيعية.',
    },
  },
  {
    id: 'how-often-water',
    q: {
      en: 'How often should I water?',
      ar: 'كم مرة أسقي؟',
    },
    a: {
      en: 'There is no universal day count. Finger-test the top 2–3 cm: dry → water thoroughly until excess drains; still damp → wait. Hot, dry rooms need more; cool shady rooms need less.',
      ar: 'لا يوجد عدد أيام ثابت. اختبر أعلى ٢–٣ سم بإصبعك: جاف ← اروِ جيداً حتى يخرج الماء؛ رطب ← انتظر. الغرف الحارة تحتاج أكثر؛ الظليلة الأقل.',
    },
  },
  {
    id: 'repot',
    q: {
      en: 'When should I repot?',
      ar: 'متى أعيد الزراعة في أصيص أكبر؟',
    },
    a: {
      en: 'When roots circle the pot, water rushes straight through, or growth stalls for months. Go only 2–4 cm wider — too big a pot holds soggy soil.',
      ar: 'عندما تدور الجذور في الأصيص، أو يمر الماء بسرعة، أو يتوقف النمو شهوراً. كبّر بـ ٢–٤ سم فقط — الأصيص الأكبر بكثير يحبس رطوبة زائدة.',
    },
  },
  {
    id: 'delivery',
    q: {
      en: 'Do you deliver in Alexandria?',
      ar: 'هل توصلون داخل الإسكندرية؟',
    },
    a: {
      en: 'Yes — نبات delivers within Alexandria. Shipping is shown at checkout. Pack plants carefully so they arrive healthy and ready for your space.',
      ar: 'نعم — نبات يوصل داخل الإسكندرية. رسوم الشحن تظهر عند إتمام الطلب. نعبّئ النباتات بعناية لتصل بصحة وجاهزة لمساحتك.',
    },
    shop: '/shop',
  },
  {
    id: 'promo',
    q: {
      en: 'Is there a first-order discount?',
      ar: 'هل يوجد خصم على أول طلب؟',
    },
    a: {
      en: 'Yes — promocode MEH10 gives 10% off your first order when you’re signed in. Guests can still checkout; sign in to redeem the code.',
      ar: 'نعم — كود MEH10 يعطيك خصم ١٠٪ على أول طلب عند تسجيل الدخول. يمكن الطلب كزائر؛ سجّل الدخول لاستبدال الكود.',
    },
    shop: '/checkout',
  },
  {
    id: 'bundles',
    q: {
      en: 'What’s the difference between a single plant and a bundle?',
      ar: 'ما الفرق بين نبتة واحدة وباقة؟',
    },
    a: {
      en: 'Bundles & offers are curated sets at a smarter combined price — great when you want a styled corner in one go. See Bundles & offers on the homepage.',
      ar: 'الباقات والعروض مجموعات مختارة بسعر إجمالي أذكى — مثالية إن أردت ركناً منسّقاً دفعة واحدة. شاهد باقات وعروض في الصفحة الرئيسية.',
    },
    shop: '/#',
  },
  {
    id: 'office',
    q: {
      en: 'Something small for a desk or office',
      ar: 'شيء صغير للمكتب',
    },
    a: {
      en: 'Compact succulents and small snake plants handle office light and irregular watering well. Keep them off AC vents and wipe dust monthly.',
      ar: 'صباريات صغيرة ونبتة ثعبان مدمجة تتحمل ضوء المكتب والري غير المنتظم. أبعدها عن فتحات التكييف وامسح الغبار شهرياً.',
    },
    shop: '/shop?care=easy',
  },
  {
    id: 'humidity',
    q: {
      en: 'Alexandria is humid / dry AC — does that matter?',
      ar: 'الإسكندرية رطبة / التكييف يجفّف — هل يهم؟',
    },
    a: {
      en: 'Coastal humidity helps many greens; strong AC dries leaf tips. Keep plants off direct vents, group them, and don’t overwater just because air feels dry.',
      ar: 'رطوبة الساحل تساعد كثيراً من الخضرة؛ التكييف القوي يجفّف أطراف الأوراق. أبعد النباتات عن الفتحات، واجمعها معاً، ولا تُفرط في الري لأن الهواء يبدو جافاً.',
    },
  },
];
