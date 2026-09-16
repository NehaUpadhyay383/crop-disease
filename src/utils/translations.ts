import { SupportedLanguage } from '../types';

export interface TranslationStrings {
  appName: string;
  tagline: string;
  reportProblem: string;
  nearbyAlerts: string;
  actionCards: string;
  expertQueue: string;
  switchRole: string;
  farmerView: string;
  expertView: string;
  similarCasesNearYou: string;
  suspectedIssue: string;
  notConfirmedDisclaimer: string;
  askAnExpert: string;
  iWillTryThis: string;
  myFieldHasThisToo: string;
  verifiedByExpert: string;
  pendingReview: string;
  urgentOutbreak: string;
  filterByCrop: string;
  allCrops: string;
  timeFilter: string;
  last24h: string;
  last72h: string;
  allTime: string;
  listView: string;
  mapView: string;
  uploadPhoto: string;
  takePhoto: string;
  chooseGallery: string;
  selectCrop: string;
  partAffected: string;
  daysNoticed: string;
  notesPlaceholder: string;
  approxLocationNotice: string;
  submitting: string;
  submitReport: string;
  feedbackBannerPrompt: string;
  yesClearly: string;
  noNotReally: string;
  notSure: string;
  outbreakAlert: string;
}

export const translations: Record<SupportedLanguage, TranslationStrings> = {
  en: {
    appName: 'PestWatch Network',
    tagline: 'Hyper-local Crop Disease & Pest Early Surveillance',
    reportProblem: 'Report a Crop Problem',
    nearbyAlerts: 'Nearby Community Alerts',
    actionCards: 'Action Cards Library',
    expertQueue: 'Expert Review Queue',
    switchRole: 'Switch Role',
    farmerView: 'Farmer Mode',
    expertView: 'Extension Expert Mode',
    similarCasesNearYou: 'Similar Cases Near You',
    suspectedIssue: 'Likely Problem (Suspected)',
    notConfirmedDisclaimer: 'Safe first response. Not a final lab diagnosis.',
    askAnExpert: 'Ask an Expert / Request Review',
    iWillTryThis: 'I will try this action',
    myFieldHasThisToo: 'My field has this too',
    verifiedByExpert: 'Verified by Extension Officer',
    pendingReview: 'Awaiting Expert Review',
    urgentOutbreak: 'Urgent Outbreak',
    filterByCrop: 'Filter by Crop',
    allCrops: 'All Crops',
    timeFilter: 'Time Period',
    last24h: 'Last 24 Hours',
    last72h: 'Last 72 Hours',
    allTime: 'All Reports',
    listView: 'List View',
    mapView: 'Outbreak Map',
    uploadPhoto: 'Upload or Capture Symptom Photo',
    takePhoto: 'Take Photo',
    chooseGallery: 'Choose from Gallery',
    selectCrop: 'Select Crop',
    partAffected: 'Part Affected',
    daysNoticed: 'Days since first noticed',
    notesPlaceholder: 'Describe symptoms (e.g., spread quickly after humid night, yellow concentric rings)...',
    approxLocationNotice: 'We only show village-level clusters to protect field privacy.',
    submitting: 'Processing & clustering report...',
    submitReport: 'Submit Symptom Report',
    feedbackBannerPrompt: 'Quick Check: Did the recommended action help your crop?',
    yesClearly: 'Yes, clearly improved',
    noNotReally: 'No, not really',
    notSure: 'Not sure yet',
    outbreakAlert: 'Area Outbreak Warning',
  },
  hi: {
    appName: 'पेस्टवॉच नेटवर्क',
    tagline: 'फसल रोग एवं कीट पूर्व चेतावनी नेटवर्क',
    reportProblem: 'फसल समस्या की रिपोर्ट करें',
    nearbyAlerts: 'आस-पास के सामुदायिक अलर्ट',
    actionCards: 'कार्रवाई कार्ड (Action Cards)',
    expertQueue: 'विशेषज्ञ समीक्षा कतार',
    switchRole: 'भूमिका बदलें',
    farmerView: 'किसान मोड',
    expertView: 'कृषि विशेषज्ञ मोड',
    similarCasesNearYou: 'आपके पास इसी तरह के मामले',
    suspectedIssue: 'संभावित समस्या (संदेहास्पद)',
    notConfirmedDisclaimer: 'सुरक्षित प्राथमिक उपाय। अंतिम लैब पुष्टि नहीं।',
    askAnExpert: 'विशेषज्ञ से पूछें / समीक्षा का अनुरोध',
    iWillTryThis: 'मैं यह उपाय आजमाऊंगा',
    myFieldHasThisToo: 'मेरे खेत में भी यह लक्षण है',
    verifiedByExpert: 'विशेषज्ञ द्वारा सत्यापित',
    pendingReview: 'विशेषज्ञ समीक्षा प्रतीक्षित',
    urgentOutbreak: 'गंभीर प्रकोप अलर्ट',
    filterByCrop: 'फसल अनुसार फ़िल्टर',
    allCrops: 'सभी फसलें',
    timeFilter: 'समय अवधि',
    last24h: 'पिछले 24 घंटे',
    last72h: 'पिछले 72 घंटे',
    allTime: 'सभी रिपोर्ट',
    listView: 'सूची दृश्य',
    mapView: 'प्रकोप मानचित्र',
    uploadPhoto: 'लक्षण की फोटो लें या अपलोड करें',
    takePhoto: 'कैमरा खोलें',
    chooseGallery: 'गैलरी से चुनें',
    selectCrop: 'फसल चुनें',
    partAffected: 'प्रभावित भाग',
    daysNoticed: 'लक्षण दिखे कितने दिन हुए',
    notesPlaceholder: 'लक्षणों का विवरण दें (जैसे: बारिश के बाद तेजी से फैला, पत्तियों पर भूरे धब्बे)...',
    approxLocationNotice: 'हम आपकी गोपनीयता की सुरक्षा के लिए केवल ग्राम-स्तरीय क्लस्टर दिखाते हैं।',
    submitting: 'रिपोर्ट दर्ज और मिलान की जा रही है...',
    submitReport: 'रिपोर्ट सबमिट करें',
    feedbackBannerPrompt: 'त्वरित जांच: क्या अनुशंसित उपाय से आपकी फसल में सुधार हुआ?',
    yesClearly: 'हाँ, स्पष्ट सुधार हुआ',
    noNotReally: 'नहीं, खास नहीं',
    notSure: 'अभी सुनिश्चित नहीं',
    outbreakAlert: 'क्षेत्रीय प्रकोप चेतावनी',
  },
  sw: {
    appName: 'PestWatch Network',
    tagline: 'Uangalizi wa Haraka wa Wadudu na Magonjwa ya Mazao',
    reportProblem: 'Ripoti Shida ya Zao',
    nearbyAlerts: 'Taarifa za Karibu',
    actionCards: 'Kadi za Hatua za Haraka',
    expertQueue: 'Foleni ya Wataalamu',
    switchRole: 'Badilisha Nafasi',
    farmerView: 'Hali ya Mkulima',
    expertView: 'Hali ya Mtaalamu',
    similarCasesNearYou: 'Kesi Zinazofanana Karibu Nawe',
    suspectedIssue: 'Shida Inayoshukiwa',
    notConfirmedDisclaimer: 'Hatua salama ya kwanza. Si utambuzi wa mwisho wa maabara.',
    askAnExpert: 'Uliza Mtaalamu wa Kilimo',
    iWillTryThis: 'Nitajaribu hatua hii',
    myFieldHasThisToo: 'Shamba langu pia lina tatizo hili',
    verifiedByExpert: 'Imethibitishwa na Mtaalamu',
    pendingReview: 'Inasubiri Uhakiki wa Mtaalamu',
    urgentOutbreak: 'Mlipuko wa Dharura',
    filterByCrop: 'Chuja kwa Zao',
    allCrops: 'Mazao Yote',
    timeFilter: 'Muda',
    last24h: 'Masaa 24 Yaliyopita',
    last72h: 'Masaa 72 Yaliyopita',
    allTime: 'Ripoti Zote',
    listView: 'Orodha',
    mapView: 'Ramani ya Mlipuko',
    uploadPhoto: 'Pakia Picha ya Dalili',
    takePhoto: 'Piga Picha',
    chooseGallery: 'Chagua kutoka Matunzio',
    selectCrop: 'Chagua Zao',
    partAffected: 'Sehemu Iliyoathirika',
    daysNoticed: 'Siku tangu dalili zilipoanza',
    notesPlaceholder: 'Eleza dalili unazoziona...',
    approxLocationNotice: 'Tunaonyesha eneo la kijiji tu kulinda faragha ya shamba lako.',
    submitting: 'Inachakata na kuunganisha ripoti...',
    submitReport: 'Wasilisha Ripoti',
    feedbackBannerPrompt: 'Uchunguzi wa Haraka: Je, ushauri uliopendekezwa ulisaidia zao lako?',
    yesClearly: 'Ndiyo, ilisaidia wazi',
    noNotReally: 'Hapana, haikusaidia',
    notSure: 'Bado sina uhakika',
    outbreakAlert: 'Tahadhari ya Mlipuko Eneo Hili',
  },
  es: {
    appName: 'PestWatch Network',
    tagline: 'Vigilancia Hiperlocal de Plagas y Enfermedades Agrícolas',
    reportProblem: 'Reportar Problema de Cultivo',
    nearbyAlerts: 'Alertas Comunitarias Cercanas',
    actionCards: 'Tarjetas de Acción',
    expertQueue: 'Cola de Expertos',
    switchRole: 'Cambiar Rol',
    farmerView: 'Modo Agricultor',
    expertView: 'Modo Especialista Agrónomo',
    similarCasesNearYou: 'Casos Similares Cerca de Ti',
    suspectedIssue: 'Problema Probable (Sospechoso)',
    notConfirmedDisclaimer: 'Primera respuesta segura. No es diagnóstico final de laboratorio.',
    askAnExpert: 'Consultar a un Experto',
    iWillTryThis: 'Probaré esta medida',
    myFieldHasThisToo: 'Mi campo también tiene esto',
    verifiedByExpert: 'Verificado por Especialista',
    pendingReview: 'Pendiente de Revisión',
    urgentOutbreak: 'Brote Urgente',
    filterByCrop: 'Filtrar por Cultivo',
    allCrops: 'Todos los Cultivos',
    timeFilter: 'Período',
    last24h: 'Últimas 24 Horas',
    last72h: 'Últimas 72 Horas',
    allTime: 'Todos los Reportes',
    listView: 'Vista de Lista',
    mapView: 'Mapa de Brotes',
    uploadPhoto: 'Subir o Tomar Foto del Síntoma',
    takePhoto: 'Tomar Foto',
    chooseGallery: 'Elegir de Galería',
    selectCrop: 'Seleccionar Cultivo',
    partAffected: 'Parte Afectada',
    daysNoticed: 'Días desde los primeros síntomas',
    notesPlaceholder: 'Describe los síntomas (ej. manchas circulares, avance tras lluvia)...',
    approxLocationNotice: 'Solo mostramos áreas a nivel de aldea para proteger la privacidad.',
    submitting: 'Procesando y agrupando reporte...',
    submitReport: 'Enviar Reporte',
    feedbackBannerPrompt: 'Verificación Rápida: ¿La recomendación ayudó a su cultivo?',
    yesClearly: 'Sí, claramente mejoró',
    noNotReally: 'No realmente',
    notSure: 'Aún no estoy seguro',
    outbreakAlert: 'Alerta de Brote en la Zona',
  },
};
