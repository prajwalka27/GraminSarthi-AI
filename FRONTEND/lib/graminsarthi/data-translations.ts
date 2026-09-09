import { Lang } from './i18n'
import type { ShopProfileKey, ShopProfile, Scheme } from './data'

export const TRADE_CATEGORIES_TRANSLATIONS: Record<Lang, string[]> = {
  en: [
    'Retail Provisions',
    'Dairy & Animal Husbandry',
    'Food & Beverage Service',
    'Tailoring & Textiles',
    'Handicrafts & Artisanal',
    'Poultry & Fisheries',
    'Agri Inputs & Produce',
  ],
  hi: [
    'खुदरा प्रावधान (किराना)',
    'डेयरी और पशुपालन',
    'खाद्य और पेय सेवा',
    'सिलाई और कपड़े',
    'हस्तशिल्प और कारीगरी',
    'मुर्गी पालन और मत्स्य पालन',
    'कृषि इनपुट और उपज',
  ],
  ta: [
    'சில்லறை பொருட்கள்',
    'பால் மற்றும் கால்நடை',
    'உணவு மற்றும் பான சேவை',
    'தையல் மற்றும் ஜவுளி',
    'கைவினைப்பொருட்கள்',
    'கோழி மற்றும் மீன்வளம்',
    'விவசாய உள்ளீடுகள்',
  ],
  te: [
    'రిటైల్ సరుకులు',
    'పాడి మరియు పశుపోషణ',
    'ఆహారం మరియు పానీయాల సేవ',
    'టైలరింగ్ మరియు వస్త్రాలు',
    'హస్తకళలు',
    'పౌల్ట్రీ మరియు మత్స్య సంపద',
    'వ్యవసాయ ఉత్పాదకాలు',
  ],
  kn: [
    'ಚಿಲ್ಲರೆ ದಿನಸಿ',
    'ಹೈನುಗಾರಿಕೆ ಮತ್ತು ಪಶುಸಂಗೋಪನೆ',
    'ಆಹಾರ ಮತ್ತು ಪಾನೀಯ ಸೇವೆ',
    'ಟೈಲರಿಂಗ್ ಮತ್ತು ಜವಳಿ',
    'ಕರಕುಶಲ ವಸ್ತುಗಳು',
    'ಕೋಳಿ ಮತ್ತು ಮೀನುಗಾರಿಕೆ',
    'ಕೃಷಿ ಒಳಹರಿವು',
  ],
  ml: [
    'റീട്ടെയിൽ സാധനങ്ങൾ',
    'ക്ഷീര, മൃഗസംരക്ഷണം',
    'ഭക്ഷണ പാനീയ സേവനം',
    'തയ്യൽ, തുണിത്തരങ്ങൾ',
    'കരകൗശല വസ്തുക്കൾ',
    'കോഴി വളർത്തലും മത്സ്യബന്ധനവും',
    'കാർഷിക ഉൽപ്പന്നങ്ങൾ',
  ]
}

export const SCHEMES_TRANSLATIONS: Record<Lang, Omit<Scheme, 'appliesTo'>[]> = {
  en: [
    {
      id: 'mudra',
      name: 'PM Mudra Yojana (Shishu & Kishore)',
      range: '₹50,000 – ₹5,00,000',
      note: 'Collateral-free working capital & term loan for micro-enterprises.',
    },
    {
      id: 'svanidhi',
      name: 'PM SVANidhi',
      range: '₹10,000 – ₹50,000',
      note: 'Working capital with 7% interest subsidy + UPI digital repayment cashback.',
    },
    {
      id: 'nabard',
      name: 'NDDB / NABARD Animal Husbandry Infrastructure Subsidy',
      range: '25% – 33.3% capital subsidy',
      note: 'Capital subsidy for chillers, sheds & dairy value-addition equipment.',
    },
  ],
  hi: [
    {
      id: 'mudra',
      name: 'पीएम मुद्रा योजना (शिशु और किशोर)',
      range: '₹50,000 – ₹5,00,000',
      note: 'सूक्ष्म उद्यमों के लिए संपार्श्विक-मुक्त कार्यशील पूंजी और सावधि ऋण।',
    },
    {
      id: 'svanidhi',
      name: 'पीएम स्वनिधि',
      range: '₹10,000 – ₹50,000',
      note: '7% ब्याज सब्सिडी के साथ कार्यशील पूंजी + यूपीआई डिजिटल पुनर्भुगतान कैशबैक।',
    },
    {
      id: 'nabard',
      name: 'एनडीडीबी / नाबार्ड पशुपालन अवसंरचना सब्सिडी',
      range: '25% – 33.3% पूंजीगत सब्सिडी',
      note: 'चिलर, शेड और डेयरी मूल्यवर्धन उपकरणों के लिए पूंजीगत सब्सिडी।',
    },
  ],
  ta: [
    {
      id: 'mudra',
      name: 'பிஎம் முத்ரா யோஜனா (சிசு & கிஷோர்)',
      range: '₹50,000 – ₹5,00,000',
      note: 'குறு நிறுவனங்களுக்கு பிணையமில்லா மூலதனம் மற்றும் காலக் கடன்.',
    },
    {
      id: 'svanidhi',
      name: 'பிஎம் ஸ்வநிதி',
      range: '₹10,000 – ₹50,000',
      note: '7% வட்டி மானியத்துடன் மூலதனம் + UPI டிஜிட்டல் திருப்பிச் செலுத்தும் கேஷ்பேக்.',
    },
    {
      id: 'nabard',
      name: 'NDDB / நபார்டு கால்நடை பராமரிப்பு உள்கட்டமைப்பு மானியம்',
      range: '25% – 33.3% மூலதன மானியம்',
      note: 'குளிர்விப்பான்கள் மற்றும் கொட்டகைகளுக்கான மூலதன மானியம்.',
    },
  ],
  te: [
    {
      id: 'mudra',
      name: 'పీఎం ముద్రా యోజన (శిశు & కిషోర్)',
      range: '₹50,000 – ₹5,00,000',
      note: 'సూక్ష్మ పరిశ్రమలకు పూచీకత్తు లేని మూలధనం మరియు టర్మ్ లోన్.',
    },
    {
      id: 'svanidhi',
      name: 'పీఎం స్వనిధి',
      range: '₹10,000 – ₹50,000',
      note: '7% వడ్డీ రాయితీతో మూలధనం + UPI డిజిటల్ క్యాష్‌బ్యాక్.',
    },
    {
      id: 'nabard',
      name: 'NDDB / నాబార్డ్ పశుపోషణ మౌలిక సదుపాయాల సబ్సిడీ',
      range: '25% – 33.3% మూలధన సబ్సిడీ',
      note: 'చిల్లర్లు మరియు షెడ్ల కొరకు మూలధన సబ్సిడీ.',
    },
  ],
  kn: [
    {
      id: 'mudra',
      name: 'ಪಿಎಂ ಮುದ್ರಾ ಯೋಜನೆ (ಶಿಶು ಮತ್ತು ಕಿಶೋರ್)',
      range: '₹50,000 – ₹5,00,000',
      note: 'ಸೂಕ್ಷ್ಮ ಉದ್ಯಮಗಳಿಗೆ ಮೇಲಾಧಾರ ರಹಿತ ದುಡಿಯುವ ಬಂಡವಾಳ ಮತ್ತು ಸಾಲ.',
    },
    {
      id: 'svanidhi',
      name: 'ಪಿಎಂ ಸ್ವನಿಧಿ',
      range: '₹10,000 – ₹50,000',
      note: '7% ಬಡ್ಡಿ ಸಹಾಯಧನದೊಂದಿಗೆ ದುಡಿಯುವ ಬಂಡವಾಳ + UPI ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್.',
    },
    {
      id: 'nabard',
      name: 'NDDB / ನಬಾರ್ಡ್ ಪಶುಸಂಗೋಪನೆ ಮೂಲಸೌಕರ್ಯ ಸಬ್ಸಿಡಿ',
      range: '25% – 33.3% ಬಂಡವಾಳ ಸಬ್ಸಿಡಿ',
      note: 'ಚಿಲ್ಲರ್‌ಗಳು ಮತ್ತು ಶೆಡ್‌ಗಳಿಗೆ ಬಂಡವಾಳ ಸಬ್ಸಿಡಿ.',
    },
  ],
  ml: [
    {
      id: 'mudra',
      name: 'പിഎം മുദ്രാ യോജന (ശിശു & കിഷോർ)',
      range: '₹50,000 – ₹5,00,000',
      note: 'ചെറുകിട സംരംഭങ്ങൾക്ക് ഈടില്ലാത്ത പ്രവർത്തന മൂലധനവും ടേം ലോണും.',
    },
    {
      id: 'svanidhi',
      name: 'പിഎം സ്വനിധി',
      range: '₹10,000 – ₹50,000',
      note: '7% പലിശ സബ്സിഡിയുള്ള പ്രവർത്തന മൂലധനം + UPI ഡിജിറ്റൽ ക്യാഷ്ബാക്ക്.',
    },
    {
      id: 'nabard',
      name: 'എൻ‌ഡി‌ഡി‌ബി / നബാർഡ് മൃഗസംരക്ഷണ ഇൻഫ്രാസ്ട്രക്ചർ സബ്സിഡി',
      range: '25% – 33.3% മൂലധന സബ്സിഡി',
      note: 'ചില്ലറുകൾക്കും ഷെഡുകൾക്കുമുള്ള മൂലധന സബ്സിഡി.',
    },
  ],
}

export const REMEDIATION_TRANSLATIONS: Record<Lang, Record<ShopProfileKey, string>> = {
  en: {
    kirana: 'Pool wholesale buying with nearby shops and cut low-margin branded stock to bring raw-material spend under 60% of sales.',
    dairy: 'Stop routing all raw milk to the cooling center — value-add 15-20% into paneer/curd to lift realization above feed cost.',
    tea: 'Trim over-ordering of packaged goods and switch to fresh made-to-order snacks with lower spoilage.',
    tailor: 'Batch fabric/thread purchases and prioritize bulk stitching contracts over thin one-off retail.',
    handicraft: 'Reduce middleman-routed raw sales and bundle branded pieces to sell direct at higher realization.',
  },
  hi: {
    kirana: 'आसपास की दुकानों के साथ मिलकर थोक खरीदारी करें और कच्चे माल का खर्च 60% से कम करने के लिए कम मार्जिन वाले स्टॉक को कम करें।',
    dairy: 'सारा कच्चा दूध कूलिंग सेंटर न भेजें — 15-20% को पनीर/दही में बदलकर आय बढ़ाएं।',
    tea: 'पैक किए गए सामान का अधिक ऑर्डर देना कम करें और ताज़ा स्नैक्स पर ध्यान दें।',
    tailor: 'कपड़े/धागे की थोक खरीदारी करें और खुदरा सिलाई की तुलना में थोक सिलाई अनुबंधों को प्राथमिकता दें।',
    handicraft: 'बिचौलियों की बिक्री कम करें और उच्च कीमत पर सीधे बेचने के लिए उत्पादों को बंडल करें।',
  },
  ta: {
    kirana: 'அருகிலுள்ள கடைகளுடன் மொத்தமாக கொள்முதல் செய்யுங்கள், குறைந்த லாபம் தரும் பொருட்களைக் குறைக்கவும்.',
    dairy: 'அனைத்து பாலையும் நேரடியாக விற்காமல், 15-20% பன்னீர்/தயிராக மாற்றி லாபத்தை அதிகரிக்கவும்.',
    tea: 'பாக்கெட் பொருட்களை அதிகம் வாங்குவதைத் தவிர்த்து, புதிதாக செய்யப்படும் தின்பண்டங்களுக்கு மாறவும்.',
    tailor: 'துணிகளை மொத்தமாக வாங்கி, சில்லறை தையலை விட மொத்த ஒப்பந்தங்களுக்கு முன்னுரிமை கொடுங்கள்.',
    handicraft: 'இடைத்தரகர்களை குறைத்து, அதிக விலைக்கு நேரடியாக விற்க பொருட்களை தொகுக்கவும்.',
  },
  te: {
    kirana: 'సమీప దుకాణాలతో కలిసి టోకు కొనుగోలు చేయండి, తక్కువ లాభం ఇచ్చే వస్తువులను తగ్గించండి.',
    dairy: 'పాలను నేరుగా అమ్మకుండా, 15-20% పనీర్/పెరుగుగా మార్చి లాభాలను పెంచుకోండి.',
    tea: 'ప్యాకెట్ వస్తువుల ఆర్డర్‌ను తగ్గించి, తాజాగా వండే స్నాక్స్‌పై దృష్టి పెట్టండి.',
    tailor: 'బట్టలు/దారాలను టోకుగా కొనండి మరియు సింగిల్ ఆర్డర్ల కంటే బల్క్ ఆర్డర్లకు ప్రాధాన్యత ఇవ్వండి.',
    handicraft: 'మధ్యవర్తులను తగ్గించి, నేరుగా ఎక్కువ ధరకు అమ్మడానికి వస్తువులను ప్యాక్ చేయండి.',
  },
  kn: {
    kirana: 'ಹತ್ತಿರದ ಅಂಗಡಿಗಳೊಂದಿಗೆ ಸಗಟು ಖರೀದಿ ಮಾಡಿ ಮತ್ತು ಕಡಿಮೆ ಲಾಭದ ವಸ್ತುಗಳನ್ನು ಕಡಿಮೆ ಮಾಡಿ.',
    dairy: 'ಎಲ್ಲಾ ಹಾಲನ್ನು ನೇರವಾಗಿ ಮಾರಾಟ ಮಾಡಬೇಡಿ — 15-20% ಪನೀರ್/ಮೊಸರು ಮಾಡಿ ಲಾಭ ಹೆಚ್ಚಿಸಿ.',
    tea: 'ಪ್ಯಾಕ್ ಮಾಡಿದ ವಸ್ತುಗಳ ಖರೀದಿಯನ್ನು ಕಡಿಮೆ ಮಾಡಿ ಮತ್ತು ತಾಜಾ ತಿಂಡಿಗಳಿಗೆ ಆದ್ಯತೆ ನೀಡಿ.',
    tailor: 'ಬಟ್ಟೆ/ದಾರವನ್ನು ಸಗಟು ಖರೀದಿಸಿ ಮತ್ತು ಬಿಡಿ ಹೊಲಿಗೆಗಿಂತ ಬಲ್ಕ್ ಒಪ್ಪಂದಗಳಿಗೆ ಆದ್ಯತೆ ನೀಡಿ.',
    handicraft: 'ಮಧ್ಯವರ್ತಿಗಳನ್ನು ಕಡಿಮೆ ಮಾಡಿ ಮತ್ತು ನೇರವಾಗಿ ಹೆಚ್ಚಿನ ಬೆಲೆಗೆ ಮಾರಾಟ ಮಾಡಿ.',
  },
  ml: {
    kirana: 'അടുത്തുള്ള കടകളുമായി ചേർന്ന് മൊത്തമായി സാധനങ്ങൾ വാങ്ങുക, കുറഞ്ഞ ലാഭമുള്ള ഉൽപ്പന്നങ്ങൾ ഒഴിവാക്കുക.',
    dairy: 'എല്ലാ പാലും നേരിട്ട് വിൽക്കാതെ, 15-20% പനീർ/തൈര് ആക്കി മാറ്റി ലാഭം വർദ്ധിപ്പിക്കുക.',
    tea: 'പാക്കറ്റ് സാധനങ്ങൾ അമിതമായി വാങ്ങുന്നത് കുറച്ച്, പുതിയ പലഹാരങ്ങളിലേക്ക് മാറുക.',
    tailor: 'തുണികൾ മൊത്തമായി വാങ്ങുക, സാധാരണ തയ്യലിനേക്കാൾ മൊത്ത കരാറുകൾക്ക് മുൻഗണന നൽകുക.',
    handicraft: 'ഇടനിലക്കാരെ ഒഴിവാക്കി, കൂടുതൽ വിലയ്ക്ക് നേരിട്ട് വിൽക്കാൻ ഉൽപ്പന്നങ്ങൾ ബണ്ടിൽ ചെയ്യുക.',
  }
}

const EN_PROFILES = {
  kirana: {
    key: 'kirana' as const,
    name: 'Village Kirana / General Provision Store',
    emoji: '🛒',
    tradeCategory: 'Retail Provisions',
    dailySales: 6800,
    dailyExpenses: 4600,
    monthlyInvestment: 18000,
    underperformingItems: [
      'Branded factory wafers/biscuits (3-5% margin)',
      'Packaged commercial soft drinks',
      'Low-turn branded shampoo sachets',
    ],
    starProduct: 'Loose grains, fresh atta & local spices',
    opportunities: [
      {
        label: 'Swap factory biscuits with fresh bakery rusk & local peanut chikki',
        gain: 3600,
        detail: 'Replace low-margin branded biscuits (3-5%) with locally sourced rusk & chikki at +30% margin. Shelf space stays the same, margin triples.',
      },
      {
        label: 'Add loose spice & atta refilling counter',
        gain: 2400,
        detail: 'Buy in bulk from the mandi, sell loose by weight. Cuts packaging cost and captures 18-22% margin vs 6% on packaged goods.',
      },
      {
        label: 'Local egg & fresh vegetable micro-corner',
        gain: 1800,
        detail: 'Source daily from nearby farmers on consignment. High footfall driver with 15% margin and near-zero holding risk.',
      },
    ],
    actionSteps: [
      'Pool procurement with 3 neighboring kirana shops to unlock wholesale slabs',
      'Install a UPI QR soundbox to build a digital credit-score trail',
      'Bundle daily essentials (atta + oil + spice) into a fixed-price combo',
      'Shift 20% of shelf space from branded snacks to fresh local goods',
    ],
  },
  dairy: {
    key: 'dairy' as const,
    name: 'Rural Dairy & Country Poultry Stall',
    emoji: '🐄',
    tradeCategory: 'Dairy & Animal Husbandry',
    dailySales: 9200,
    dailyExpenses: 6400,
    monthlyInvestment: 22000,
    underperformingItems: [
      'Raw milk sold to cooling-center intermediary at baseline rate',
      'Unsorted table eggs at wholesale',
      'Bulk unbranded curd to resellers',
    ],
    starProduct: 'Fresh cow milk & buttermilk',
    opportunities: [
      {
        label: 'Divert 15L to fresh paneer/curd for local dhabas',
        gain: 4800,
        detail: 'Instead of selling raw milk to the cooling center at baseline, convert 15L/day to paneer & set curd for local dhabas and homes. Value addition adds ~₹4,800/mo.',
      },
      {
        label: 'Ghee & flavored buttermilk retail packs',
        gain: 3200,
        detail: 'Small-batch ghee and spiced chaas in reusable pouches capture 35-40% margin vs raw milk baseline.',
      },
      {
        label: 'Direct farm-to-home morning delivery subscription',
        gain: 2600,
        detail: 'Fixed monthly subscription removes the intermediary cut entirely and locks in predictable cash flow.',
      },
    ],
    actionSteps: [
      'Value-add 15-20% of daily milk into paneer/curd before it hits the cooling center',
      'Form a 5-farmer collective to negotiate feed/fodder at bulk rates',
      'Apply for NABARD animal-husbandry infrastructure subsidy for a chiller',
      'Start a UPI subscription route for guaranteed morning demand',
    ],
  },
  tea: {
    key: 'tea' as const,
    name: 'Tea Stall & Morning Tiffin Center',
    emoji: '☕',
    tradeCategory: 'Food & Beverage Service',
    dailySales: 4200,
    dailyExpenses: 2600,
    monthlyInvestment: 12000,
    underperformingItems: [
      'Packaged commercial chips locking shelf space',
      'Bottled cold drinks with thin margin',
      'Ready-made packaged biscuits',
    ],
    starProduct: 'Filter coffee & fresh morning batter',
    opportunities: [
      {
        label: 'Replace packaged chips with hot fresh vada & bonda',
        gain: 3400,
        detail: 'Free the shelf from thin-margin packaged chips and serve fresh fried snacks at 45% margin during peak tea hours.',
      },
      {
        label: 'Fresh idli/dosa batter retail packs',
        gain: 2800,
        detail: 'Sell your morning batter as take-home packs to nearby homes — a high-margin add-on using existing prep.',
      },
      {
        label: 'Tiffin subscription for local workers & students',
        gain: 2200,
        detail: 'Fixed monthly tiffin plans smooth demand and cut wastage, adding predictable recurring revenue.',
      },
    ],
    actionSteps: [
      'Swap packaged chips shelf for a fresh hot-snacks counter at peak hours',
      'Launch a weekly tiffin subscription for nearby shops and students',
      'Buy tea, milk & oil jointly with 2 nearby stalls for better rates',
      'Add a UPI QR soundbox to speed up the morning rush and log sales',
    ],
  },
  tailor: {
    key: 'tailor' as const,
    name: 'Tailoring & Apparel Repairs',
    emoji: '🧵',
    tradeCategory: 'Tailoring & Textiles',
    dailySales: 2800,
    dailyExpenses: 1400,
    monthlyInvestment: 9000,
    underperformingItems: [
      'Low-margin thread & button retail sales',
      'One-off minor repair jobs',
      'Reselling ready-made trims',
    ],
    starProduct: 'Custom blouse & school-uniform stitching',
    opportunities: [
      {
        label: 'Batch school-uniform & SHG bulk-stitch contracts',
        gain: 3000,
        detail: 'Move from one-off repairs to bulk uniform/SHG contracts — steady volume at a stronger blended margin.',
      },
      {
        label: 'Value-added embroidery & alteration express service',
        gain: 2000,
        detail: 'Premium express and embroidery add-ons command 40%+ margins over plain stitching.',
      },
      {
        label: 'Ready-to-wear festival collection micro-batch',
        gain: 2400,
        detail: 'Pre-stitch a small festival collection to sell directly instead of waiting for custom orders.',
      },
    ],
    actionSteps: [
      'Secure a recurring school-uniform or SHG bulk-stitch contract',
      'Introduce priced express-alteration and embroidery add-ons',
      'Buy fabric and thread jointly with nearby tailors at wholesale slabs',
      'Apply for a Mudra Shishu loan for a second machine and overlock',
    ],
  },
  handicraft: {
    key: 'handicraft' as const,
    name: 'Handicrafts, Weaving & Terracotta',
    emoji: '🏺',
    tradeCategory: 'Handicrafts & Artisanal',
    dailySales: 3600,
    dailyExpenses: 1900,
    monthlyInvestment: 11000,
    underperformingItems: [
      'Bulk raw pieces sold to middlemen at baseline',
      'Undifferentiated commodity terracotta pots',
      'Loose weaving output without branding',
    ],
    starProduct: 'Signature handwoven & terracotta décor',
    opportunities: [
      {
        label: 'Direct-to-buyer curated décor bundles',
        gain: 3200,
        detail: 'Skip the middleman and sell curated décor sets directly to buyers and local resorts at 3-4x the baseline piece rate.',
      },
      {
        label: 'Festival & wedding gifting collection',
        gain: 2600,
        detail: 'Seasonal gifting sets with packaging capture premium pricing and repeat bulk orders.',
      },
      {
        label: 'GI-tag / SHG cluster branded listing',
        gain: 2000,
        detail: 'Branded cluster listing under an SHG improves trust and unlocks better per-piece realization.',
      },
    ],
    actionSteps: [
      'Bundle and brand pieces to sell direct instead of via middlemen',
      'Join an SHG artisan cluster for shared marketing and bulk raw material',
      'Build a festival/wedding gifting line with premium packaging',
      'Apply for NSFDC / Stand-Up India working capital for scaling',
    ],
  },
}

const HI_PROFILES: Record<ShopProfileKey, ShopProfile> = {
  ...EN_PROFILES,
  kirana: {
    ...EN_PROFILES.kirana,
    name: 'ग्रामीण किराना / जनरल प्रोविजन स्टोर',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.hi[0],
    underperformingItems: [
      'ब्रांडेड फैक्ट्री वेफर्स/बिस्कुट (3-5% मार्जिन)',
      'पैक किए गए कोल्ड ड्रिंक्स',
      'कम बिकने वाले शैम्पू सैशे',
    ],
    starProduct: 'खुला अनाज, ताजा आटा और स्थानीय मसाले',
    opportunities: [
      {
        label: 'फैक्ट्री बिस्कुट की जगह ताज़ा रस्क और मूंगफली चिक्की लाएं',
        gain: 3600,
        detail: 'कम मार्जिन वाले बिस्कुट की जगह स्थानीय चिक्की बेचें जिससे मार्जिन तीन गुना हो जाएगा।',
      },
      {
        label: 'खुला मसाला और आटा रिफिलिंग काउंटर जोड़ें',
        gain: 2400,
        detail: 'थोक में खरीदें और वजन के हिसाब से बेचें। पैकेजिंग लागत कम करता है और 18-22% मार्जिन देता है।',
      },
      {
        label: 'अंडे और ताजी सब्जियों का माइक्रो-कॉर्नर',
        gain: 1800,
        detail: 'किसानों से दैनिक स्रोत। 15% मार्जिन और जोखिम के बिना ज्यादा ग्राहकों को आकर्षित करता है।',
      },
    ],
    actionSteps: [
      'थोक दर प्राप्त करने के लिए 3 पड़ोसी दुकानों के साथ मिलकर खरीदारी करें',
      'डिजिटल क्रेडिट स्कोर बनाने के लिए UPI QR साउंडबॉक्स लगाएं',
      'दैनिक आवश्यक वस्तुओं (आटा + तेल + मसाला) का एक निश्चित मूल्य का कॉम्बो बनाएं',
      'ब्रांडेड स्नैक्स से 20% शेल्फ स्पेस हटाकर स्थानीय ताजे उत्पाद रखें',
    ]
  },
  dairy: {
    ...EN_PROFILES.dairy,
    name: 'ग्रामीण डेयरी और मुर्गी पालन',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.hi[1],
    underperformingItems: [
      'कूलिंग सेंटर को सीधे बेचा गया कच्चा दूध',
      'थोक में अंडे',
      'बिना ब्रांड का थोक दही',
    ],
    starProduct: 'ताजा गाय का दूध और छाछ',
    opportunities: [
      {
        label: '15 लीटर दूध को ताजे पनीर/दही में बदलें',
        gain: 4800,
        detail: 'कच्चा दूध बेचने के बजाय पनीर और दही बनाएं, जिससे प्रति माह ~₹4,800 अतिरिक्त मिलेंगे।',
      },
      {
        label: 'घी और छाछ के छोटे रिटेल पैक',
        gain: 3200,
        detail: 'छोटे पाउच में घी और मसालेदार छाछ 35-40% मार्जिन देते हैं।',
      },
      {
        label: 'घर-घर सुबह की सीधी डिलीवरी',
        gain: 2600,
        detail: 'मासिक सदस्यता बिचौलियों को हटाती है और नकद प्रवाह सुरक्षित करती है।',
      },
    ],
    actionSteps: [
      'कूलिंग सेंटर में देने से पहले 15-20% दूध से पनीर/दही बनाएं',
      'चारे के लिए मोलभाव करने के लिए 5 किसानों का समूह बनाएं',
      'चिलर के लिए नाबार्ड सब्सिडी हेतु आवेदन करें',
      'सुबह की मांग के लिए UPI सदस्यता मार्ग शुरू करें',
    ]
  },
  tea: {
    ...EN_PROFILES.tea,
    name: 'चाय की दुकान और सुबह का टिफिन सेंटर',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.hi[2],
    underperformingItems: [
      'पैकेज्ड चिप्स जो जगह घेरते हैं',
      'कम मार्जिन वाले कोल्ड ड्रिंक्स',
      'पैकेज्ड बिस्कुट',
    ],
    starProduct: 'फिल्टर कॉफी और ताज़ा इडली बैटर',
    opportunities: [
      {
        label: 'चिप्स की जगह ताज़ा वड़ा और बोंडा रखें',
        gain: 3400,
        detail: 'भीड़ के समय 45% मार्जिन के साथ ताज़े स्नैक्स परोसें।',
      },
      {
        label: 'ताज़ा इडली/डोसा बैटर रिटेल पैक',
        gain: 2800,
        detail: 'पास के घरों के लिए टेक-होम पैक के रूप में बैटर बेचें।',
      },
      {
        label: 'स्थानीय श्रमिकों के लिए टिफिन सदस्यता',
        gain: 2200,
        detail: 'निश्चित मासिक टिफिन योजनाएं बर्बादी कम करती हैं और आय बढ़ाती हैं।',
      },
    ],
    actionSteps: [
      'भीड़ के समय चिप्स की जगह ताज़े स्नैक्स काउंटर लगाएं',
      'छात्रों और दुकानों के लिए साप्ताहिक टिफिन सदस्यता शुरू करें',
      'बेहतर दरों के लिए अन्य 2 स्टालों के साथ चाय, दूध और तेल खरीदें',
      'बिक्री दर्ज करने और तेज़ी के लिए UPI साउंडबॉक्स जोड़ें',
    ]
  },
  tailor: {
    ...EN_PROFILES.tailor,
    name: 'सिलाई और कपड़े की मरम्मत',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.hi[3],
    underperformingItems: [
      'कम मार्जिन वाले धागे और बटन की खुदरा बिक्री',
      'एक-बार की छोटी मरम्मत',
      'रेडीमेड ट्रिम्स फिर से बेचना',
    ],
    starProduct: 'कस्टम ब्लाउज और स्कूल-यूनिफॉर्म सिलाई',
    opportunities: [
      {
        label: 'स्कूल-यूनिफॉर्म और एसएचजी सिलाई अनुबंध लें',
        gain: 3000,
        detail: 'छोटी मरम्मत के बजाय थोक अनुबंधों से स्थिर आय प्राप्त करें।',
      },
      {
        label: 'एम्ब्रॉयडरी और एक्सप्रेस सर्विस',
        gain: 2000,
        detail: 'प्रीमियम एक्सप्रेस और एम्ब्रॉयडरी सर्विस सामान्य सिलाई पर 40%+ मार्जिन देती हैं।',
      },
      {
        label: 'रेडी-टू-वियर त्यौहार कलेक्शन',
        gain: 2400,
        detail: 'त्यौहारों के लिए पहले से कपड़े सिल कर सीधे बेचें।',
      },
    ],
    actionSteps: [
      'स्कूल यूनिफॉर्म या एसएचजी सिलाई का नियमित अनुबंध सुरक्षित करें',
      'मूल्यवान एक्सप्रेस सिलाई और एम्ब्रॉयडरी सर्विस शुरू करें',
      'आसपास के दर्जियों के साथ मिलकर कपड़े और धागे थोक में खरीदें',
      'दूसरी मशीन के लिए मुद्रा शिशु ऋण हेतु आवेदन करें',
    ]
  },
  handicraft: {
    ...EN_PROFILES.handicraft,
    name: 'हस्तशिल्प और टेराकोटा',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.hi[4],
    underperformingItems: [
      'बिचौलियों को बेचे गए कच्चे सामान',
      'सामान्य टेराकोटा के बर्तन',
      'बिना ब्रांड के बुने हुए उत्पाद',
    ],
    starProduct: 'हथकरघा और टेराकोटा सजावट',
    opportunities: [
      {
        label: 'सजावटी बंडल सीधे खरीदारों को',
        gain: 3200,
        detail: 'बिचौलियों को छोड़ें और सीधे खरीदारों व रिसॉर्ट्स को 3-4 गुना कीमत पर बेचें।',
      },
      {
        label: 'त्यौहार और शादी के गिफ्ट कलेक्शन',
        gain: 2600,
        detail: 'आकर्षक पैकेजिंग के साथ गिफ्ट सेट प्रीमियम कीमत दिलाते हैं।',
      },
      {
        label: 'जीआई-टैग / एसएचजी ब्रांडेड लिस्टिंग',
        gain: 2000,
        detail: 'एसएचजी के तहत ब्रांडिंग विश्वास बढ़ाती है और बेहतर कीमत दिलाती है।',
      },
    ],
    actionSteps: [
      'बिचौलियों की बजाय सीधे बेचने के लिए उत्पादों को बंडल करें',
      'मार्केटिंग के लिए एसएचजी शिल्पकार क्लस्टर से जुड़ें',
      'प्रीमियम पैकेजिंग के साथ त्यौहार/गिफ्ट लाइन तैयार करें',
      'विस्तार के लिए एनएसएफडीसी ऋण हेतु आवेदन करें',
    ]
  }
}

const TA_PROFILES: Record<ShopProfileKey, ShopProfile> = {
  ...EN_PROFILES,
  kirana: {
    ...EN_PROFILES.kirana,
    name: 'கிராம மளிகை கடை',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.ta[0],
    underperformingItems: [
      'குறைந்த லாபம் தரும் பிஸ்கட் பாக்கெட்டுகள்',
      'குளிர்பான பாக்கெட்டுகள்',
      'ஷாம்பூ பாக்கெட்டுகள்',
    ],
    starProduct: 'மளிகை பொருட்கள் மற்றும் மசாலாக்கள்',
    opportunities: [
      {
        label: 'ரஸ்க் மற்றும் கடலை மிட்டாய்களை விற்கவும்',
        gain: 3600,
        detail: 'குறைந்த லாபம் தரும் பொருட்களுக்குப் பதிலாக உள்ளூர் மிட்டாய்களை விற்று லாபத்தை அதிகரிக்கவும்.',
      },
      {
        label: 'மசாலா மற்றும் மாவு பிரிவைச் சேர்க்கவும்',
        gain: 2400,
        detail: 'மொத்தமாக வாங்கி எடையின் அடிப்படையில் விற்கவும்.',
      },
      {
        label: 'முட்டை மற்றும் காய்கறி மூலை',
        gain: 1800,
        detail: 'விவசாயிகளிடமிருந்து நேரடியாக வாங்கி விற்கவும்.',
      },
    ],
    actionSteps: [
      'அருகிலுள்ள 3 கடைகளுடன் இணைந்து மொத்தமாக கொள்முதல் செய்யவும்',
      'UPI QR இயந்திரத்தை நிறுவவும்',
      'தினசரி தேவையான பொருட்களை ஒரே விலையில் விற்கவும்',
      '20% இடத்தை உள்ளூர் பொருட்களுக்காக ஒதுக்கவும்',
    ]
  },
  dairy: {
    ...EN_PROFILES.dairy,
    name: 'பால் மற்றும் பண்ணை கடை',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.ta[1],
    underperformingItems: [
      'நேரடியாக விற்கப்படும் பால்',
      'மொத்தமாக விற்கப்படும் முட்டைகள்',
      'மொத்த தயிர் விற்பனை',
    ],
    starProduct: 'தூய்மையான பசும்பால் மற்றும் மோர்',
    opportunities: [
      {
        label: 'பன்னீர் மற்றும் தயிர் தயாரிக்கவும்',
        gain: 4800,
        detail: 'பாலை நேரடியாக விற்பதற்குப் பதிலாக பன்னீராக மாற்றி லாபம் பெறவும்.',
      },
      {
        label: 'நெய் மற்றும் மோர் பாக்கெட்டுகள்',
        gain: 3200,
        detail: 'சிறிய அளவில் நெய் மற்றும் மோர் விற்பனை.',
      },
      {
        label: 'நேரடி பால் விநியோகம்',
        gain: 2600,
        detail: 'இடைத்தரகர்களைத் தவிர்த்து நேரடியாக வாடிக்கையாளர்களுக்கு விற்கவும்.',
      },
    ],
    actionSteps: [
      '15-20% பாலை தயிராக அல்லது பன்னீராக மாற்றவும்',
      'தீவனங்களை மொத்தமாக வாங்க 5 விவசாயிகளுடன் சேரவும்',
      'நபார்டு மானியத்திற்கு விண்ணப்பிக்கவும்',
      'காலை பால் விநியோகத்திற்கு UPI சந்தாவைத் தொடங்கவும்',
    ]
  },
  tea: {
    ...EN_PROFILES.tea,
    name: 'டீ கடை மற்றும் டிபன் சென்டர்',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.ta[2],
    underperformingItems: [
      'சிப்ஸ் பாக்கெட்டுகள்',
      'குளிர்பானங்கள்',
      'பிஸ்கட்டுகள்',
    ],
    starProduct: 'பில்டர் காபி மற்றும் இட்லி மாவு',
    opportunities: [
      {
        label: 'போண்டா மற்றும் வடை விற்கவும்',
        gain: 3400,
        detail: 'சிப்ஸ் பாக்கெட்டுகளுக்குப் பதிலாக சூடான தின்பண்டங்களை விற்கவும்.',
      },
      {
        label: 'இட்லி மாவு விற்பனை',
        gain: 2800,
        detail: 'அருகிலுள்ள வீடுகளுக்கு இட்லி மாவை பாக்கெட்டுகளில் விற்கவும்.',
      },
      {
        label: 'மாதாந்திர டிபன் சந்தா',
        gain: 2200,
        detail: 'தொழிலாளர்களுக்கான மாதாந்திர உணவு திட்டம்.',
      },
    ],
    actionSteps: [
      'காலை நேரத்தில் சூடான தின்பண்டங்களை விற்கவும்',
      'மாணவர்களுக்கு வாராந்திர டிபன் சந்தாவை தொடங்கவும்',
      'அருகிலுள்ள கடைகளுடன் இணைந்து டீத்தூள் வாங்கவும்',
      'பணப்பரிவர்த்தனைக்கு UPI இயந்திரத்தை பயன்படுத்தவும்',
    ]
  },
  tailor: {
    ...EN_PROFILES.tailor,
    name: 'தையல் கடை',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.ta[3],
    underperformingItems: [
      'நூல் மற்றும் பட்டன் விற்பனை',
      'சிறு தையல் வேலைகள்',
      'ரெடிமேட் பொருட்கள்',
    ],
    starProduct: 'பிளவுஸ் மற்றும் பள்ளி சீருடை தையல்',
    opportunities: [
      {
        label: 'பள்ளி சீருடை ஒப்பந்தங்கள்',
        gain: 3000,
        detail: 'சிறு வேலைகளைத் தவிர்த்து மொத்த சீருடை தையல்களைப் பெறவும்.',
      },
      {
        label: 'எம்ப்ராய்டரி மற்றும் விரைவான தையல்',
        gain: 2000,
        detail: 'கூடுதல் கட்டணத்துடன் விரைவான தையல் சேவை.',
      },
      {
        label: 'பண்டிகை கால ஆயத்த ஆடைகள்',
        gain: 2400,
        detail: 'பண்டிகைகளுக்காக முன்கூட்டியே துணிகளை தைத்து விற்கவும்.',
      },
    ],
    actionSteps: [
      'பள்ளி அல்லது SHG குழுவின் மொத்த தையல் ஒப்பந்தத்தைப் பெறவும்',
      'விரைவான எம்ப்ராய்டரி சேவையைத் தொடங்கவும்',
      'அருகிலுள்ள தையல்காரர்களுடன் இணைந்து துணிகளை வாங்கவும்',
      'புதிய இயந்திரத்திற்கு முத்ரா கடன் பெறவும்',
    ]
  },
  handicraft: {
    ...EN_PROFILES.handicraft,
    name: 'கைவினைப் பொருட்கள்',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.ta[4],
    underperformingItems: [
      'இடைத்தரகர்களுக்கு விற்கப்படும் பொருட்கள்',
      'சாதாரண மண்பாண்டங்கள்',
      'பிராண்ட் இல்லாத துணிகள்',
    ],
    starProduct: 'கைத்தறி மற்றும் அலங்கார பொருட்கள்',
    opportunities: [
      {
        label: 'நேரடி அலங்கார பொருட்கள் விற்பனை',
        gain: 3200,
        detail: 'இடைத்தரகர்களைத் தவிர்த்து வாடிக்கையாளர்களுக்கு நேரடியாக விற்கவும்.',
      },
      {
        label: 'பரிசு பொருட்கள் விற்பனை',
        gain: 2600,
        detail: 'திருமணம் மற்றும் பண்டிகைக்கான சிறப்பு பரிசுப் பொருட்கள்.',
      },
      {
        label: 'SHG குழுவின் கீழ் விற்பனை',
        gain: 2000,
        detail: 'ஒரு குழுவாக இணைந்து சிறந்த விலையைப் பெறவும்.',
      },
    ],
    actionSteps: [
      'இடைத்தரகர்களைத் தவிர்த்து பொருட்களை நேரடியாக விற்கவும்',
      'ஒருங்கிணைந்த விற்பனைக்கு SHG குழுவில் இணையவும்',
      'பரிசு பொருட்களைத் தயாரிக்கவும்',
      'தொழில் வளர்ச்சிக்காக கடன் உதவி பெறவும்',
    ]
  }
}

const TE_PROFILES: Record<ShopProfileKey, ShopProfile> = {
  ...EN_PROFILES,
  kirana: {
    ...EN_PROFILES.kirana,
    name: 'గ్రామీణ కిరాణా దుకాణం',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.te[0],
    underperformingItems: [
      'తక్కువ లాభం వచ్చే బిస్కెట్లు',
      'కూల్ డ్రింక్స్',
      'షాంపూ ప్యాకెట్లు',
    ],
    starProduct: 'తాజా పిండి మరియు మసాలాలు',
    opportunities: [
      {
        label: 'బిస్కెట్ల స్థానంలో రస్క్ మరియు పల్లీ పట్టీ అమ్మండి',
        gain: 3600,
        detail: 'తక్కువ లాభం వచ్చే వస్తువుల స్థానంలో స్థానిక స్నాక్స్ అమ్మడం ద్వారా లాభాన్ని పెంచుకోండి.',
      },
      {
        label: 'మసాలా మరియు పిండి విభాగం',
        gain: 2400,
        detail: 'టోకుగా కొనుగోలు చేసి బరువు ప్రకారం అమ్మండి.',
      },
      {
        label: 'గుడ్లు మరియు కూరగాయల విభాగం',
        gain: 1800,
        detail: 'రైతుల నుండి నేరుగా కొనుగోలు చేసి అమ్మండి.',
      },
    ],
    actionSteps: [
      'సమీపంలోని 3 దుకాణాలతో కలిసి టోకుగా కొనుగోలు చేయండి',
      'UPI క్యూఆర్ యంత్రాన్ని ఏర్పాటు చేయండి',
      'నిత్యావసర వస్తువులను ఒకే ధరకు కాంబోగా అమ్మండి',
      '20% స్థలాన్ని స్థానిక వస్తువుల కోసం కేటాయించండి',
    ]
  },
  dairy: {
    ...EN_PROFILES.dairy,
    name: 'పాడి మరియు కోళ్ళ ఫారం',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.te[1],
    underperformingItems: [
      'నేరుగా అమ్మే పాలు',
      'టోకుగా అమ్మే గుడ్లు',
      'పెరుగు టోకు అమ్మకం',
    ],
    starProduct: 'స్వచ్ఛమైన ఆవు పాలు మరియు మజ్జిగ',
    opportunities: [
      {
        label: 'పనీర్ మరియు పెరుగు తయారు చేయండి',
        gain: 4800,
        detail: 'పాలను నేరుగా అమ్మకుండా పనీర్/పెరుగుగా మార్చి లాభం పొందండి.',
      },
      {
        label: 'నెయ్యి మరియు మజ్జిగ ప్యాకెట్లు',
        gain: 3200,
        detail: 'చిన్న ప్యాకెట్లలో నెయ్యి, మజ్జిగ అమ్మకం.',
      },
      {
        label: 'నేరుగా ఇంటికి పాల పంపిణీ',
        gain: 2600,
        detail: 'మధ్యవర్తులను నివారించి నేరుగా వినియోగదారులకు అమ్మండి.',
      },
    ],
    actionSteps: [
      '15-20% పాలను పెరుగు/పనీర్‌గా మార్చండి',
      'మేత కొనుగోలుకు 5 మంది రైతులు కలిసి బృందంగా ఏర్పడండి',
      'నాబార్డ్ సబ్సిడీ కోసం దరఖాస్తు చేసుకోండి',
      'ఉదయం పంపిణీ కోసం UPI సబ్‌స్క్రిప్షన్ ప్రారంభించండి',
    ]
  },
  tea: {
    ...EN_PROFILES.tea,
    name: 'టీ స్టాల్ మరియు టిఫిన్ సెంటర్',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.te[2],
    underperformingItems: [
      'చిప్స్ ప్యాకెట్లు',
      'కూల్ డ్రింక్స్',
      'బిస్కెట్లు',
    ],
    starProduct: 'ఫిల్టర్ కాఫీ మరియు ఇడ్లీ పిండి',
    opportunities: [
      {
        label: 'వేడి బోండా మరియు బజ్జీలు అమ్మండి',
        gain: 3400,
        detail: 'చిప్స్ ప్యాకెట్ల స్థానంలో వేడి స్నాక్స్ అమ్మండి.',
      },
      {
        label: 'ఇడ్లీ పిండి ప్యాకెట్ల అమ్మకం',
        gain: 2800,
        detail: 'సమీపంలోని ఇళ్లకు ఇడ్లీ పిండి ప్యాకెట్లలో అమ్మండి.',
      },
      {
        label: 'నెలవారీ టిఫిన్ సబ్‌స్క్రిప్షన్',
        gain: 2200,
        detail: 'కార్మికులు మరియు విద్యార్థులకు నెలవారీ భోజన పథకం.',
      },
    ],
    actionSteps: [
      'ఉదయం పూట వేడి స్నాక్స్ కౌంటర్‌ను ఏర్పాటు చేయండి',
      'నెలవారీ టిఫిన్ సబ్‌స్క్రిప్షన్‌ను ప్రారంభించండి',
      'ఇతర దుకాణాలతో కలిసి టీ పొడి కొనుగోలు చేయండి',
      'డబ్బు చెల్లింపుల కోసం UPI ని ఉపయోగించండి',
    ]
  },
  tailor: {
    ...EN_PROFILES.tailor,
    name: 'టైలరింగ్ దుకాణం',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.te[3],
    underperformingItems: [
      'దారం మరియు బటన్ల అమ్మకం',
      'చిన్న రిపేర్లు',
      'రెడీమేడ్ వస్తువులు',
    ],
    starProduct: 'బ్లౌజ్ మరియు స్కూల్ యూనిఫాం కుట్టడం',
    opportunities: [
      {
        label: 'స్కూల్ యూనిఫాం కాంట్రాక్టులు',
        gain: 3000,
        detail: 'చిన్న పనుల కన్నా బల్క్ యూనిఫాం ఆర్డర్లపై దృష్టి పెట్టండి.',
      },
      {
        label: 'ఎంబ్రాయిడరీ మరియు ఎక్స్‌ప్రెస్ సర్వీస్',
        gain: 2000,
        detail: 'అదనపు ఛార్జీలతో వేగవంతమైన టైలరింగ్ సేవ.',
      },
      {
        label: 'పండుగ కోసం రెడీమేడ్ దుస్తులు',
        gain: 2400,
        detail: 'పండుగల కోసం ముందుగానే దుస్తులు కుట్టి అమ్మండి.',
      },
    ],
    actionSteps: [
      'స్కూల్ లేదా SHG గ్రూపుల బల్క్ కుట్టు ఆర్డర్ పొందండి',
      'వేగవంతమైన ఎంబ్రాయిడరీ సేవను ప్రారంభించండి',
      'సమీప టైలర్లతో కలిసి టోకుగా బట్టలు కొనండి',
      'కొత్త మిషన్ కోసం ముద్రా లోన్ దరఖాస్తు చేయండి',
    ]
  },
  handicraft: {
    ...EN_PROFILES.handicraft,
    name: 'హస్తకళలు',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.te[4],
    underperformingItems: [
      'మధ్యవర్తులకు అమ్మిన వస్తువులు',
      'సాధారణ మట్టి కుండలు',
      'బ్రాండ్ లేని బట్టలు',
    ],
    starProduct: 'చేనేత మరియు అలంకరణ వస్తువులు',
    opportunities: [
      {
        label: 'అలంకరణ వస్తువుల నేరుగా అమ్మకం',
        gain: 3200,
        detail: 'మధ్యవర్తులను నివారించి నేరుగా వినియోగదారులకు అమ్మండి.',
      },
      {
        label: 'బహుమతి వస్తువుల అమ్మకం',
        gain: 2600,
        detail: 'పెళ్లిళ్లు మరియు పండుగల కోసం ప్రత్యేక బహుమతులు.',
      },
      {
        label: 'SHG గ్రూప్ ద్వారా అమ్మకం',
        gain: 2000,
        detail: 'గ్రూపుగా కలిసి మెరుగైన ధర పొందండి.',
      },
    ],
    actionSteps: [
      'మధ్యవర్తులను నివారించి నేరుగా అమ్మండి',
      'కలిసి అమ్మకాల కోసం SHG లో చేరండి',
      'బహుమతి ప్యాకేజీలు తయారు చేయండి',
      'వ్యాపార విస్తరణ కోసం లోన్ పొందండి',
    ]
  }
}

const KN_PROFILES: Record<ShopProfileKey, ShopProfile> = {
  ...EN_PROFILES,
  kirana: {
    ...EN_PROFILES.kirana,
    name: 'ಗ್ರಾಮೀಣ ಕಿರಾಣಿ ಅಂಗಡಿ',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.kn[0],
    underperformingItems: [
      'ಕಡಿಮೆ ಲಾಭದ ಬಿಸ್ಕತ್ತುಗಳು',
      'ತಂಪು ಪಾನೀಯಗಳು',
      'ಶಾಂಪೂ ಪ್ಯಾಕೆಟ್‌ಗಳು',
    ],
    starProduct: 'ತಾಜಾ ಹಿಟ್ಟು ಮತ್ತು ಮಸಾಲೆಗಳು',
    opportunities: [
      {
        label: 'ಬಿಸ್ಕತ್ತುಗಳ ಬದಲಿಗೆ ರಸ್ಕ್ ಮತ್ತು ಕಡಲೆ ಮಿಠಾಯಿ ಮಾರಾಟ ಮಾಡಿ',
        gain: 3600,
        detail: 'ಕಡಿಮೆ ಲಾಭದ ವಸ್ತುಗಳ ಬದಲಿಗೆ ಸ್ಥಳೀಯ ತಿಂಡಿಗಳನ್ನು ಮಾರಿ ಲಾಭ ಹೆಚ್ಚಿಸಿ.',
      },
      {
        label: 'ಮಸಾಲೆ ಮತ್ತು ಹಿಟ್ಟು ವಿಭಾಗ',
        gain: 2400,
        detail: 'ಸಗಟು ಖರೀದಿಸಿ ತೂಕದ ಆಧಾರದ ಮೇಲೆ ಮಾರಾಟ ಮಾಡಿ.',
      },
      {
        label: 'ಮೊಟ್ಟೆ ಮತ್ತು ತರಕಾರಿ ವಿಭಾಗ',
        gain: 1800,
        detail: 'ರೈತರಿಂದ ನೇರವಾಗಿ ಖರೀದಿಸಿ ಮಾರಿ.',
      },
    ],
    actionSteps: [
      'ಹತ್ತಿರದ 3 ಅಂಗಡಿಗಳೊಂದಿಗೆ ಸಗಟು ಖರೀದಿ ಮಾಡಿ',
      'UPI ಕ್ಯೂಆರ್ ಯಂತ್ರವನ್ನು ಅಳವಡಿಸಿ',
      'ದೈನಂದಿನ ಅಗತ್ಯ ವಸ್ತುಗಳನ್ನು ಒಂದೇ ಬೆಲೆಗೆ ಮಾರಾಟ ಮಾಡಿ',
      '20% ಜಾಗವನ್ನು ಸ್ಥಳೀಯ ವಸ್ತುಗಳಿಗೆ ಮೀಸಲಿಡಿ',
    ]
  },
  dairy: {
    ...EN_PROFILES.dairy,
    name: 'ಹೈನುಗಾರಿಕೆ ಮತ್ತು ಕೋಳಿ ಫಾರ್ಮ್',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.kn[1],
    underperformingItems: [
      'ನೇರವಾಗಿ ಮಾರುವ ಹಾಲು',
      'ಸಗಟು ಮೊಟ್ಟೆಗಳು',
      'ಮೊಸರು ಸಗಟು ಮಾರಾಟ',
    ],
    starProduct: 'ಶುದ್ಧ ಹಸುವಿನ ಹಾಲು ಮತ್ತು ಮಜ್ಜಿಗೆ',
    opportunities: [
      {
        label: 'ಪನೀರ್ ಮತ್ತು ಮೊಸರು ತಯಾರಿಸಿ',
        gain: 4800,
        detail: 'ಹಾಲನ್ನು ನೇರವಾಗಿ ಮಾರದೆ ಪನೀರ್/ಮೊಸರು ಮಾಡಿ ಲಾಭ ಪಡೆಯಿರಿ.',
      },
      {
        label: 'ತುಪ್ಪ ಮತ್ತು ಮಜ್ಜಿಗೆ ಪ್ಯಾಕೆಟ್‌ಗಳು',
        gain: 3200,
        detail: 'ಸಣ್ಣ ಪ್ಯಾಕೆಟ್‌ಗಳಲ್ಲಿ ತುಪ್ಪ, ಮಜ್ಜಿಗೆ ಮಾರಾಟ.',
      },
      {
        label: 'ನೇರವಾಗಿ ಮನೆಗೆ ಹಾಲು ವಿತರಣೆ',
        gain: 2600,
        detail: 'ಮಧ್ಯವರ್ತಿಗಳನ್ನು ತಪ್ಪಿಸಿ ನೇರವಾಗಿ ಗ್ರಾಹಕರಿಗೆ ಮಾರಿ.',
      },
    ],
    actionSteps: [
      '15-20% ಹಾಲನ್ನು ಮೊಸರು/ಪನೀರ್ ಮಾಡಿ',
      'ಮೇವು ಖರೀದಿಸಲು 5 ರೈತರು ಸೇರಿ ಗುಂಪು ಮಾಡಿ',
      'ನಬಾರ್ಡ್ ಸಬ್ಸಿಡಿಗಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ',
      'ಬೆಳಗ್ಗಿನ ವಿತರಣೆಗಾಗಿ UPI ಚಂದಾದಾರಿಕೆ ಪ್ರಾರಂಭಿಸಿ',
    ]
  },
  tea: {
    ...EN_PROFILES.tea,
    name: 'ಟೀ ಸ್ಟಾಲ್ ಮತ್ತು ಟಿಫಿನ್ ಸೆಂಟರ್',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.kn[2],
    underperformingItems: [
      'ಚಿಪ್ಸ್ ಪ್ಯಾಕೆಟ್‌ಗಳು',
      'ತಂಪು ಪಾನೀಯಗಳು',
      'ಬಿಸ್ಕತ್ತುಗಳು',
    ],
    starProduct: 'ಫಿಲ್ಟರ್ ಕಾಫಿ ಮತ್ತು ಇಡ್ಲಿ ಹಿಟ್ಟು',
    opportunities: [
      {
        label: 'ಬಿಸಿ ಬೋಂಡಾ ಮತ್ತು ಬಜ್ಜಿ ಮಾರಿ',
        gain: 3400,
        detail: 'ಚಿಪ್ಸ್ ಪ್ಯಾಕೆಟ್‌ಗಳ ಬದಲಿಗೆ ಬಿಸಿ ತಿಂಡಿಗಳನ್ನು ಮಾರಿ.',
      },
      {
        label: 'ಇಡ್ಲಿ ಹಿಟ್ಟಿನ ಪ್ಯಾಕೆಟ್ ಮಾರಾಟ',
        gain: 2800,
        detail: 'ಹತ್ತಿರದ ಮನೆಗಳಿಗೆ ಇಡ್ಲಿ ಹಿಟ್ಟನ್ನು ಪ್ಯಾಕೆಟ್‌ನಲ್ಲಿ ಮಾರಿ.',
      },
      {
        label: 'ಮಾಸಿಕ ಟಿಫಿನ್ ಚಂದಾದಾರಿಕೆ',
        gain: 2200,
        detail: 'ಕಾರ್ಮಿಕರು ಮತ್ತು ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮಾಸಿಕ ಊಟದ ಯೋಜನೆ.',
      },
    ],
    actionSteps: [
      'ಬೆಳಿಗ್ಗೆ ಬಿಸಿ ತಿಂಡಿಗಳ ಕೌಂಟರ್ ತೆರೆಯಿರಿ',
      'ಮಾಸಿಕ ಟಿಫಿನ್ ಚಂದಾದಾರಿಕೆ ಪ್ರಾರಂಭಿಸಿ',
      'ಇತರ ಅಂಗಡಿಗಳೊಂದಿಗೆ ಟೀ ಪುಡಿ ಖರೀದಿಸಿ',
      'ಹಣ ಪಾವತಿಗಾಗಿ UPI ಬಳಸಿ',
    ]
  },
  tailor: {
    ...EN_PROFILES.tailor,
    name: 'ಟೈಲರಿಂಗ್ ಅಂಗಡಿ',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.kn[3],
    underperformingItems: [
      'ದಾರ ಮತ್ತು ಬಟನ್‌ಗಳ ಮಾರಾಟ',
      'ಸಣ್ಣ ರಿಪೇರಿಗಳು',
      'ರೆಡಿಮೇಡ್ ವಸ್ತುಗಳು',
    ],
    starProduct: 'ಬ್ಲೌಸ್ ಮತ್ತು ಶಾಲಾ ಸಮವಸ್ತ್ರ ಹೊಲಿಯುವುದು',
    opportunities: [
      {
        label: 'ಶಾಲಾ ಸಮವಸ್ತ್ರ ಗುತ್ತಿಗೆಗಳು',
        gain: 3000,
        detail: 'ಸಣ್ಣ ಕೆಲಸಗಳಿಗಿಂತ ಬಲ್ಕ್ ಆರ್ಡರ್‌ಗಳ ಮೇಲೆ ಗಮನ ಹರಿಸಿ.',
      },
      {
        label: 'ಎಂಬ್ರಾಯ್ಡರಿ ಮತ್ತು ಎಕ್ಸ್‌ಪ್ರೆಸ್ ಸೇವೆ',
        gain: 2000,
        detail: 'ಹೆಚ್ಚುವರಿ ಶುಲ್ಕದೊಂದಿಗೆ ವೇಗದ ಟೈಲರಿಂಗ್ ಸೇವೆ.',
      },
      {
        label: 'ಹಬ್ಬಕ್ಕಾಗಿ ರೆಡಿಮೇಡ್ ಬಟ್ಟೆಗಳು',
        gain: 2400,
        detail: 'ಹಬ್ಬಗಳಿಗಾಗಿ ಮುಂಚಿತವಾಗಿ ಬಟ್ಟೆ ಹೊಲಿದು ಮಾರಿ.',
      },
    ],
    actionSteps: [
      'ಶಾಲೆ ಅಥವಾ SHG ಗುಂಪುಗಳ ಬಲ್ಕ್ ಹೊಲಿಗೆ ಆರ್ಡರ್ ಪಡೆಯಿರಿ',
      'ವೇಗದ ಎಂಬ್ರಾಯ್ಡರಿ ಸೇವೆ ಪ್ರಾರಂಭಿಸಿ',
      'ಹತ್ತಿರದ ಟೈಲರ್‌ಗಳೊಂದಿಗೆ ಸಗಟು ಬಟ್ಟೆ ಖರೀದಿಸಿ',
      'ಹೊಸ ಮಿಷನ್‌ಗಾಗಿ ಮುದ್ರಾ ಸಾಲಕ್ಕೆ ಅರ್ಜಿ ಹಾಕಿ',
    ]
  },
  handicraft: {
    ...EN_PROFILES.handicraft,
    name: 'ಕರಕುಶಲ ವಸ್ತುಗಳು',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.kn[4],
    underperformingItems: [
      'ಮಧ್ಯವರ್ತಿಗಳಿಗೆ ಮಾರಿದ ವಸ್ತುಗಳು',
      'ಸಾಮಾನ್ಯ ಮಣ್ಣಿನ ಮಡಕೆಗಳು',
      'ಬ್ರಾಂಡ್ ಇಲ್ಲದ ಬಟ್ಟೆಗಳು',
    ],
    starProduct: 'ಕೈಮಗ್ಗ ಮತ್ತು ಅಲಂಕಾರಿಕ ವಸ್ತುಗಳು',
    opportunities: [
      {
        label: 'ಅಲಂಕಾರಿಕ ವಸ್ತುಗಳ ನೇರ ಮಾರಾಟ',
        gain: 3200,
        detail: 'ಮಧ್ಯವರ್ತಿಗಳನ್ನು ತಪ್ಪಿಸಿ ನೇರವಾಗಿ ಗ್ರಾಹಕರಿಗೆ ಮಾರಿ.',
      },
      {
        label: 'ಉಡುಗೊರೆ ವಸ್ತುಗಳ ಮಾರಾಟ',
        gain: 2600,
        detail: 'ಮದುವೆ ಮತ್ತು ಹಬ್ಬಗಳಿಗಾಗಿ ವಿಶೇಷ ಉಡುಗೊರೆಗಳು.',
      },
      {
        label: 'SHG ಗುಂಪಿನ ಮೂಲಕ ಮಾರಾಟ',
        gain: 2000,
        detail: 'ಗುಂಪಾಗಿ ಸೇರಿ ಉತ್ತಮ ಬೆಲೆ ಪಡೆಯಿರಿ.',
      },
    ],
    actionSteps: [
      'ಮಧ್ಯವರ್ತಿಗಳನ್ನು ತಪ್ಪಿಸಿ ನೇರವಾಗಿ ಮಾರಿ',
      'ಒಟ್ಟಿಗೆ ಮಾರಾಟಕ್ಕಾಗಿ SHG ಸೇರಿ',
      'ಉಡುಗೊರೆ ಪ್ಯಾಕೇಜ್‌ಗಳನ್ನು ತಯಾರಿಸಿ',
      'ವ್ಯಾಪಾರ ವಿಸ್ತರಣೆಗಾಗಿ ಸಾಲ ಪಡೆಯಿರಿ',
    ]
  }
}

const ML_PROFILES: Record<ShopProfileKey, ShopProfile> = {
  ...EN_PROFILES,
  kirana: {
    ...EN_PROFILES.kirana,
    name: 'ഗ്രാമത്തിലെ പലചരക്ക് കട',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.ml[0],
    underperformingItems: [
      'കുറഞ്ഞ ലാഭമുള്ള ബിസ്കറ്റുകൾ',
      'കൂൾ ഡ്രിങ്ക്സ്',
      'ഷാംപൂ പാക്കറ്റുകൾ',
    ],
    starProduct: 'പുതിയ പൊടികളും മസാലകളും',
    opportunities: [
      {
        label: 'ബിസ്കറ്റുകൾക്ക് പകരം റസ്കും കടല മിഠായിയും വിൽക്കുക',
        gain: 3600,
        detail: 'കുറഞ്ഞ ലാഭമുള്ളവയ്ക്ക് പകരം നാടൻ ലഘുഭക്ഷണങ്ങൾ വിറ്റ് ലാഭം വർദ്ധിപ്പിക്കുക.',
      },
      {
        label: 'മസാലകൾക്കും പൊടികൾക്കുമുള്ള പ്രത്യേക കൗണ്ടർ',
        gain: 2400,
        detail: 'മൊത്തമായി വാങ്ങി തൂക്കമനുസരിച്ച് വിൽക്കുക.',
      },
      {
        label: 'മുട്ട, പച്ചക്കറി വിഭാഗം',
        gain: 1800,
        detail: 'കർഷകരിൽ നിന്ന് നേരിട്ട് വാങ്ങി വിൽക്കുക.',
      },
    ],
    actionSteps: [
      'അടുത്തുള്ള 3 കടകളുമായി ചേർന്ന് മൊത്തമായി വാങ്ങുക',
      'UPI ക്യുആർ യന്ത്രം സ്ഥാപിക്കുക',
      'നിത്യോപയോഗ സാധനങ്ങൾ കോംബോ ആയി വിൽക്കുക',
      '20% സ്ഥലം നാടൻ സാധനങ്ങൾക്കായി നീക്കിവെക്കുക',
    ]
  },
  dairy: {
    ...EN_PROFILES.dairy,
    name: 'ക്ഷീര വികസനവും കോഴിവളർത്തലും',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.ml[1],
    underperformingItems: [
      'നേരിട്ട് വിൽക്കുന്ന പാൽ',
      'മൊത്തമായി വിൽക്കുന്ന മുട്ടകൾ',
      'തൈര് മൊത്ത വിൽപ്പന',
    ],
    starProduct: 'ശുദ്ധമായ പശുവിൻ പാലും മോരും',
    opportunities: [
      {
        label: 'പനീറും തൈരും ഉണ്ടാക്കുക',
        gain: 4800,
        detail: 'പാൽ നേരിട്ട് വിൽക്കാതെ പനീർ/തൈര് ആക്കി ലാഭം നേടുക.',
      },
      {
        label: 'നെയ്യ്, മോര് പാക്കറ്റുകൾ',
        gain: 3200,
        detail: 'ചെറിയ പാക്കറ്റുകളിൽ നെയ്യ്, മോര് എന്നിവ വിൽക്കുക.',
      },
      {
        label: 'വീടുകളിലേക്ക് നേരിട്ടുള്ള പാൽ വിതരണം',
        gain: 2600,
        detail: 'ഇടനിലക്കാരെ ഒഴിവാക്കി നേരിട്ട് ഉപഭോക്താക്കൾക്ക് നൽകുക.',
      },
    ],
    actionSteps: [
      '15-20% പാൽ തൈര്/പനീർ ആക്കുക',
      'കാലിത്തീറ്റ വാങ്ങാൻ 5 കർഷകർ ചേർന്ന് ഗ്രൂപ്പ് ഉണ്ടാക്കുക',
      'നബാർഡ് സബ്സിഡിക്ക് അപേക്ഷിക്കുക',
      'രാവിലെ പാൽ വിതരണത്തിന് UPI സബ്സ്ക്രിപ്ഷൻ തുടങ്ങുക',
    ]
  },
  tea: {
    ...EN_PROFILES.tea,
    name: 'ചായക്കടയും ടിഫിൻ സെന്ററും',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.ml[2],
    underperformingItems: [
      'ചിപ്സ് പാക്കറ്റുകൾ',
      'കൂൾ ഡ്രിങ്ക്സ്',
      'ബിസ്കറ്റുകൾ',
    ],
    starProduct: 'ഫിൽട്ടർ കോഫിയും ഇഡ്ഡലി മാവും',
    opportunities: [
      {
        label: 'ചൂട് ബോണ്ടയും ബജ്ജിയും വിൽക്കുക',
        gain: 3400,
        detail: 'ചിപ്സ് പാക്കറ്റുകൾക്ക് പകരം ചൂടൻ ലഘുഭക്ഷണങ്ങൾ വിൽക്കുക.',
      },
      {
        label: 'ഇഡ്ഡലി മാവ് പാക്കറ്റ് വിൽപ്പന',
        gain: 2800,
        detail: 'അടുത്തുള്ള വീടുകളിലേക്ക് ഇഡ്ഡലി മാവ് പാക്കറ്റിലാക്കി നൽകുക.',
      },
      {
        label: 'പ്രതിമാസ ടിഫിൻ സബ്സ്ക്രിപ്ഷൻ',
        gain: 2200,
        detail: 'തൊഴിലാളികൾക്കും വിദ്യാർത്ഥികൾക്കുമുള്ള പ്രതിമാസ ഭക്ഷണ പദ്ധതി.',
      },
    ],
    actionSteps: [
      'രാവിലെ ചൂടൻ ലഘുഭക്ഷണങ്ങൾ വിൽക്കാൻ കൗണ്ടർ തുടങ്ങുക',
      'പ്രതിമാസ ടിഫിൻ സബ്സ്ക്രിപ്ഷൻ ആരംഭിക്കുക',
      'മറ്റ് കടകളുമായി ചേർന്ന് ചായപ്പൊടി വാങ്ങുക',
      'പണമിടപാടുകൾക്ക് UPI ഉപയോഗിക്കുക',
    ]
  },
  tailor: {
    ...EN_PROFILES.tailor,
    name: 'തയ്യൽ കട',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.ml[3],
    underperformingItems: [
      'നൂൽ, ബട്ടൺ വിൽപ്പന',
      'ചെറിയ അറ്റകുറ്റപ്പണികൾ',
      'റെഡിമെയ്ഡ് വസ്ത്രങ്ങൾ',
    ],
    starProduct: 'ബ്ലൗസും സ്കൂൾ യൂണിഫോമും തുന്നൽ',
    opportunities: [
      {
        label: 'സ്കൂൾ യൂണിഫോം കരാറുകൾ',
        gain: 3000,
        detail: 'ചെറിയ ജോലികൾക്ക് പകരം ബൾക്ക് യൂണിഫോം ഓർഡറുകളിൽ ശ്രദ്ധിക്കുക.',
      },
      {
        label: 'എംബ്രോയ്ഡറിയും എക്സ്പ്രസ് സേവനവും',
        gain: 2000,
        detail: 'കൂടുതൽ പണം ഈടാക്കി വേഗത്തിലുള്ള തയ്യൽ സേവനം.',
      },
      {
        label: 'ഉത്സവങ്ങൾക്കുള്ള റെഡിമെയ്ഡ് വസ്ത്രങ്ങൾ',
        gain: 2400,
        detail: 'ഉത്സവങ്ങൾക്ക് മുന്നോടിയായി വസ്ത്രങ്ങൾ തുന്നി വിൽക്കുക.',
      },
    ],
    actionSteps: [
      'സ്കൂളുകളുടെയോ SHG ഗ്രൂപ്പുകളുടെയോ ബൾക്ക് തയ്യൽ ഓർഡർ നേടുക',
      'വേഗത്തിലുള്ള എംബ്രോയ്ഡറി സേവനം ആരംഭിക്കുക',
      'അടുത്തുള്ള തയ്യൽക്കാരുമായി ചേർന്ന് മൊത്തമായി തുണി വാങ്ങുക',
      'പുതിയ മെഷീനായി മുദ്ര ലോണിന് അപേക്ഷിക്കുക',
    ]
  },
  handicraft: {
    ...EN_PROFILES.handicraft,
    name: 'കരകൗശല വസ്തുക്കൾ',
    tradeCategory: TRADE_CATEGORIES_TRANSLATIONS.ml[4],
    underperformingItems: [
      'ഇടനിലക്കാർക്ക് വിറ്റ സാധനങ്ങൾ',
      'സാധാരണ മൺപാത്രങ്ങൾ',
      'ബ്രാൻഡ് ഇല്ലാത്ത തുണിത്തരങ്ങൾ',
    ],
    starProduct: 'കൈത്തറിയും അലങ്കാര വസ്തുക്കളും',
    opportunities: [
      {
        label: 'അലങ്കാര വസ്തുക്കളുടെ നേരിട്ടുള്ള വിൽപ്പന',
        gain: 3200,
        detail: 'ഇടനിലക്കാരെ ഒഴിവാക്കി നേരിട്ട് ഉപഭോക്താക്കൾക്ക് വിൽക്കുക.',
      },
      {
        label: 'സമ്മാന വസ്തുക്കളുടെ വിൽപ്പന',
        gain: 2600,
        detail: 'വിവാഹങ്ങൾക്കും ഉത്സവങ്ങൾക്കുമുള്ള പ്രത്യേക സമ്മാനങ്ങൾ.',
      },
      {
        label: 'SHG ഗ്രൂപ്പ് വഴിയുള്ള വിൽപ്പന',
        gain: 2000,
        detail: 'ഗ്രൂപ്പായി ചേർന്ന് മികച്ച വില നേടുക.',
      },
    ],
    actionSteps: [
      'ഇടനിലക്കാരെ ഒഴിവാക്കി നേരിട്ട് വിൽക്കുക',
      'ഒരുമിച്ച് വിൽക്കാൻ SHG-ൽ ചേരുക',
      'സമ്മാന പാക്കേജുകൾ തയ്യാറാക്കുക',
      'വ്യാപാരം വിപുലീകരിക്കാൻ ലോൺ നേടുക',
    ]
  }
}

export const SHOP_PROFILES_TRANSLATIONS: Record<Lang, Record<ShopProfileKey, ShopProfile>> = {
  en: EN_PROFILES,
  hi: HI_PROFILES,
  ta: TA_PROFILES,
  te: TE_PROFILES,
  kn: KN_PROFILES,
  ml: ML_PROFILES,
}
