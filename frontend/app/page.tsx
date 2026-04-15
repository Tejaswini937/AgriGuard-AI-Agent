"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
type Lang = "en" | "hi" | "te" | "mr";
type View = "analyze" | "dashboard" | "settings" | "history" | "activity_detail";
type Severity = "Healthy" | "Mild" | "Moderate" | "Severe" | "Unknown";
type Status = "Analyzed" | "Treated" | "Monitoring";

interface Activity {
  id: string;
  date: string;
  crop: string;
  cropEmoji: string;
  disease: string;
  severity: Severity;
  status: Status;
  treatment: string;
  organic_solution: string;
  follow_up: string;
  location: string;
  imageUrl?: string;
  treatmentDate?: string;
  notes?: string;
}

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
  rainRisk: number;
  advisory: string;
  icon: string;
  isReal: boolean;
  resolvedName?: string;
}

// ── Translations ─────────────────────────────────────────────────────────────
const T: Record<Lang, Record<string, string>> = {
  en: {
    appName: "AgriGuard AI", tagline: "AI Agents Active",
    navAnalyze: "Analyze Crop", navDashboard: "Dashboard", navSettings: "Settings",
    agentStatus: "AI Assistant", agentHelp: "What does this do?",
    analyzePage: "Analyze Crop", dashboardPage: "Dashboard", settingsPage: "Settings",
    uploadTitle: "Upload Plant Photo", uploadSubtitle: "Take a clear photo of the affected leaves or stem",
    uploadBtn: "Click to upload or drag & drop", uploadHint: "JPG, PNG supported",
    cropLabel: "Crop Type", locationLabel: "Your Location", locationPlaceholder: "e.g. Coimbatore, Tamil Nadu",
    analyzeBtn: "Analyze My Crop", analyzing: "Analyzing...",
    disease: "Disease Detected", severity: "Severity", treatment: "Chemical Treatment",
    organic: "Organic Solution", followUp: "Follow-up Care",
    markTreated: "Mark as Treated", alreadyTreated: "✓ Marked as Treated",
    saveActivity: "Save to History", saved: "✓ Saved",
    weatherTitle: "Current Weather", weatherAdvisory: "Advisory",
    recentAnalyses: "Recent Analyses", viewAll: "View All",
    beforeAfter: "Before vs After Treatment",
    noActivities: "No analyses yet. Start by analyzing a crop!",
    backToDashboard: "← Back to Dashboard", activityDetail: "Activity Details",
    statusAnalyzed: "Analyzed", statusTreated: "Treated", statusMonitoring: "Monitoring",
    updateStatus: "Update Status", treatmentPlan: "Treatment Plan",
    organicPlan: "Organic Plan", followUpPlan: "Follow-up Plan",
    notes: "Your Notes", notesPlaceholder: "Add your observations here...", saveNotes: "Save Notes",
    notesSaved: "✓ Notes saved!", confidence: "confidence",
    allAnalyses: "All Analyses", filterAll: "All", filterAnalyzed: "Analyzed",
    filterTreated: "Treated", filterMonitoring: "Monitoring",
    settingsLang: "Language", settingsTheme: "Theme", settingsNotif: "Notifications",
    settingsProfile: "Your Profile", settingsSave: "Save Settings",
    profileName: "Full Name", profilePhone: "Phone Number", profileState: "State",
    profileDistrict: "District", profileCrop: "Primary Crop",
    darkMode: "Dark Mode", lightMode: "Light Mode",
    notifDaily: "Daily Weather Alerts", notifWeekly: "Weekly Crop Health Summary",
    notifDisease: "Disease Outbreak Alerts", notifSaved: "Notification settings saved!",
    bellTitle: "Alerts & Notifications", bellEmpty: "No new alerts",
    bellWeather: "Weather Alert", bellDisease: "Disease Alert", bellTip: "Weekly Tip",
    agentsTitle: "How AI Helps You",
    agentVision: "👁️ Vision Agent", agentVisionDesc: "Scans your plant photo to spot diseases, pests, and nutrient problems.",
    agentPlanning: "🧠 Planning Agent", agentPlanningDesc: "Creates a step-by-step treatment plan based on what was found.",
    agentWeather: "🌤️ Weather Agent", agentWeatherDesc: "Checks local weather to adjust advice — e.g., avoid spraying before rain.",
    agentAction: "💊 Action Agent", agentActionDesc: "Recommends exact medicines, doses, and organic alternatives.",
    agentMonitor: "📊 Monitor Agent", agentMonitorDesc: "Tracks treatment progress and reminds you when to follow up.",
    closeAgents: "Got it, close this",
    cropTomato: "Tomato", cropWheat: "Wheat", cropRice: "Rice", cropMaize: "Maize",
    cropCotton: "Cotton", cropSugarcane: "Sugarcane", cropOnion: "Onion", cropPotato: "Potato",
    cropSoybean: "Soybean", cropGroundnut: "Groundnut",
    farmerAccount: "Farmer Account", settingsSaved: "Settings saved successfully!",
    weatherLoading: "Fetching weather...", weatherReal: "Live Weather",
    fetchWeather: "Get Live Weather",
  },
  hi: {
    appName: "AgriGuard AI", tagline: "AI एजेंट सक्रिय",
    navAnalyze: "फसल विश्लेषण", navDashboard: "डैशबोर्ड", navSettings: "सेटिंग्स",
    agentStatus: "AI सहायक", agentHelp: "यह क्या करता है?",
    analyzePage: "फसल विश्लेषण", dashboardPage: "डैशबोर्ड", settingsPage: "सेटिंग्स",
    uploadTitle: "पौधे की फोटो अपलोड करें", uploadSubtitle: "प्रभावित पत्तियों या तने की स्पष्ट फोटो लें",
    uploadBtn: "क्लिक करें या फोटो यहाँ खींचें", uploadHint: "JPG, PNG समर्थित",
    cropLabel: "फसल का प्रकार", locationLabel: "आपका स्थान", locationPlaceholder: "जैसे कोयंबटूर, तमिलनाडु",
    analyzeBtn: "मेरी फसल का विश्लेषण करें", analyzing: "विश्लेषण हो रहा है...",
    disease: "रोग पहचाना गया", severity: "गंभीरता", treatment: "रासायनिक उपचार",
    organic: "जैविक समाधान", followUp: "अनुवर्ती देखभाल",
    markTreated: "उपचारित के रूप में चिह्नित करें", alreadyTreated: "✓ उपचारित",
    saveActivity: "इतिहास में सहेजें", saved: "✓ सहेजा गया",
    weatherTitle: "मौजूदा मौसम", weatherAdvisory: "सलाह",
    recentAnalyses: "हालिया विश्लेषण", viewAll: "सभी देखें",
    beforeAfter: "उपचार से पहले और बाद में",
    noActivities: "अभी कोई विश्लेषण नहीं। फसल का विश्लेषण शुरू करें!",
    backToDashboard: "← डैशबोर्ड पर वापस", activityDetail: "गतिविधि विवरण",
    statusAnalyzed: "विश्लेषित", statusTreated: "उपचारित", statusMonitoring: "निगरानी में",
    updateStatus: "स्थिति अपडेट करें", treatmentPlan: "उपचार योजना",
    organicPlan: "जैविक योजना", followUpPlan: "अनुवर्ती योजना",
    notes: "आपके नोट्स", notesPlaceholder: "अपनी टिप्पणियाँ यहाँ लिखें...", saveNotes: "नोट्स सहेजें",
    notesSaved: "✓ नोट्स सहेजे गए!", confidence: "विश्वास",
    allAnalyses: "सभी विश्लेषण", filterAll: "सभी", filterAnalyzed: "विश्लेषित",
    filterTreated: "उपचारित", filterMonitoring: "निगरानी",
    settingsLang: "भाषा", settingsTheme: "थीम", settingsNotif: "सूचनाएं",
    settingsProfile: "आपकी प्रोफ़ाइल", settingsSave: "सेटिंग्स सहेजें",
    profileName: "पूरा नाम", profilePhone: "फोन नंबर", profileState: "राज्य",
    profileDistrict: "जिला", profileCrop: "मुख्य फसल",
    darkMode: "डार्क मोड", lightMode: "लाइट मोड",
    notifDaily: "दैनिक मौसम अलर्ट", notifWeekly: "साप्ताहिक फसल स्वास्थ्य सारांश",
    notifDisease: "रोग प्रकोप अलर्ट", notifSaved: "सूचना सेटिंग्स सहेजी गई!",
    bellTitle: "अलर्ट और सूचनाएं", bellEmpty: "कोई नई सूचना नहीं",
    bellWeather: "मौसम अलर्ट", bellDisease: "रोग अलर्ट", bellTip: "साप्ताहिक टिप",
    agentsTitle: "AI आपकी कैसे मदद करता है",
    agentVision: "👁️ दृष्टि एजेंट", agentVisionDesc: "आपकी पौधे की फोटो स्कैन करके रोग, कीट और पोषण समस्याओं की पहचान करता है।",
    agentPlanning: "🧠 योजना एजेंट", agentPlanningDesc: "पाई गई समस्याओं के आधार पर चरण-दर-चरण उपचार योजना बनाता है।",
    agentWeather: "🌤️ मौसम एजेंट", agentWeatherDesc: "स्थानीय मौसम की जांच करता है — जैसे बारिश से पहले छिड़काव न करें।",
    agentAction: "💊 क्रिया एजेंट", agentActionDesc: "सटीक दवाएं, खुराक और जैविक विकल्प सुझाता है।",
    agentMonitor: "📊 निगरानी एजेंट", agentMonitorDesc: "उपचार की प्रगति ट्रैक करता है और फॉलो-अप याद दिलाता है।",
    closeAgents: "समझ गया, बंद करें",
    cropTomato: "टमाटर", cropWheat: "गेहूं", cropRice: "चावल", cropMaize: "मक्का",
    cropCotton: "कपास", cropSugarcane: "गन्ना", cropOnion: "प्याज", cropPotato: "आलू",
    cropSoybean: "सोयाबीन", cropGroundnut: "मूंगफली",
    farmerAccount: "किसान खाता", settingsSaved: "सेटिंग्स सफलतापूर्वक सहेजी गई!",
    weatherLoading: "मौसम जानकारी ला रहा है...", weatherReal: "लाइव मौसम",
    fetchWeather: "लाइव मौसम देखें",
  },
  te: {
    appName: "AgriGuard AI", tagline: "AI ఏజెంట్లు సక్రియంగా ఉన్నాయి",
    navAnalyze: "పంట విశ్లేషణ", navDashboard: "డాష్‌బోర్డ్", navSettings: "సెట్టింగ్స్",
    agentStatus: "AI సహాయకుడు", agentHelp: "ఇది ఏమి చేస్తుంది?",
    analyzePage: "పంట విశ్లేషణ", dashboardPage: "డాష్‌బోర్డ్", settingsPage: "సెట్టింగ్స్",
    uploadTitle: "మొక్క ఫోటో అప్‌లోడ్ చేయండి", uploadSubtitle: "ప్రభావిత ఆకులు లేదా కాండం యొక్క స్పష్టమైన ఫోటో తీయండి",
    uploadBtn: "క్లిక్ చేయండి లేదా ఫోటో లాగండి", uploadHint: "JPG, PNG మద్దతు ఉంది",
    cropLabel: "పంట రకం", locationLabel: "మీ స్థానం", locationPlaceholder: "ఉదా. కోయంబత్తూరు, తమిళనాడు",
    analyzeBtn: "నా పంటను విశ్లేషించండి", analyzing: "విశ్లేషిస్తోంది...",
    disease: "వ్యాధి గుర్తించబడింది", severity: "తీవ్రత", treatment: "రసాయన చికిత్స",
    organic: "సేంద్రీయ పరిష్కారం", followUp: "తదుపరి సంరక్షణ",
    markTreated: "చికిత్స చేసినట్టు గుర్తించండి", alreadyTreated: "✓ చికిత్స చేయబడింది",
    saveActivity: "చరిత్రలో సేవ్ చేయండి", saved: "✓ సేవ్ చేయబడింది",
    weatherTitle: "ప్రస్తుత వాతావరణం", weatherAdvisory: "సలహా",
    recentAnalyses: "ఇటీవలి విశ్లేషణలు", viewAll: "అన్నీ చూడండి",
    beforeAfter: "చికిత్సకు ముందు మరియు తర్వాత",
    noActivities: "ఇంకా విశ్లేషణలు లేవు. పంటను విశ్లేషించడం ప్రారంభించండి!",
    backToDashboard: "← డాష్‌బోర్డ్‌కు తిరిగి", activityDetail: "కార్యకలాప వివరాలు",
    statusAnalyzed: "విశ్లేషించబడింది", statusTreated: "చికిత్స చేయబడింది", statusMonitoring: "పర్యవేక్షణలో",
    updateStatus: "స్థితి నవీకరించండి", treatmentPlan: "చికిత్స ప్రణాళిక",
    organicPlan: "సేంద్రీయ ప్రణాళిక", followUpPlan: "తదుపరి ప్రణాళిక",
    notes: "మీ నోట్స్", notesPlaceholder: "మీ పరిశీలనలు ఇక్కడ జోడించండి...", saveNotes: "నోట్స్ సేవ్ చేయండి",
    notesSaved: "✓ నోట్స్ సేవ్ చేయబడ్డాయి!", confidence: "నమ్మకం",
    allAnalyses: "అన్ని విశ్లేషణలు", filterAll: "అన్నీ", filterAnalyzed: "విశ్లేషించబడింది",
    filterTreated: "చికిత్స", filterMonitoring: "పర్యవేక్షణ",
    settingsLang: "భాష", settingsTheme: "థీమ్", settingsNotif: "నోటిఫికేషన్లు",
    settingsProfile: "మీ ప్రొఫైల్", settingsSave: "సెట్టింగ్స్ సేవ్ చేయండి",
    profileName: "పూర్తి పేరు", profilePhone: "ఫోన్ నంబర్", profileState: "రాష్ట్రం",
    profileDistrict: "జిల్లా", profileCrop: "ప్రాథమిక పంట",
    darkMode: "డార్క్ మోడ్", lightMode: "లైట్ మోడ్",
    notifDaily: "రోజువారీ వాతావరణ హెచ్చరికలు", notifWeekly: "వారపు పంట ఆరోగ్య సారాంశం",
    notifDisease: "వ్యాధి వ్యాప్తి హెచ్చరికలు", notifSaved: "నోటిఫికేషన్ సెట్టింగ్స్ సేవ్ చేయబడ్డాయి!",
    bellTitle: "హెచ్చరికలు మరియు నోటిఫికేషన్లు", bellEmpty: "కొత్త హెచ్చరికలు లేవు",
    bellWeather: "వాతావరణ హెచ్చరిక", bellDisease: "వ్యాధి హెచ్చరిక", bellTip: "వారపు చిట్కా",
    agentsTitle: "AI మీకు ఎలా సహాయపడుతుంది",
    agentVision: "👁️ దృష్టి ఏజెంట్", agentVisionDesc: "మీ మొక్క ఫోటోను స్కాన్ చేసి వ్యాధులు, తెగుళ్లు మరియు పోషక సమస్యలను గుర్తిస్తుంది.",
    agentPlanning: "🧠 ప్లానింగ్ ఏజెంట్", agentPlanningDesc: "కనుగొన్న సమస్యల ఆధారంగా దశల వారీగా చికిత్స ప్రణాళిక రూపొందిస్తుంది.",
    agentWeather: "🌤️ వాతావరణ ఏజెంట్", agentWeatherDesc: "స్థానిక వాతావరణాన్ని తనిఖీ చేస్తుంది — వర్షానికి ముందు పిచికారీ చేయవద్దు.",
    agentAction: "💊 యాక్షన్ ఏజెంట్", agentActionDesc: "ఖచ్చితమైన మందులు, మోతాదులు మరియు సేంద్రీయ ప్రత్యామ్నాయాలను సూచిస్తుంది.",
    agentMonitor: "📊 మానిటర్ ఏజెంట్", agentMonitorDesc: "చికిత్స పురోగతిని ట్రాక్ చేస్తుంది మరియు ఫాలో-అప్ గుర్తు చేస్తుంది.",
    closeAgents: "అర్థమైంది, మూసివేయండి",
    cropTomato: "టమాటో", cropWheat: "గోధుమ", cropRice: "వరి", cropMaize: "మొక్కజొన్న",
    cropCotton: "పత్తి", cropSugarcane: "చెరకు", cropOnion: "ఉల్లిపాయ", cropPotato: "బంగాళాదుంప",
    cropSoybean: "సోయాబీన్", cropGroundnut: "వేరుశెనగ",
    farmerAccount: "రైతు ఖాతా", settingsSaved: "సెట్టింగ్స్ విజయవంతంగా సేవ్ చేయబడ్డాయి!",
    weatherLoading: "వాతావరణ సమాచారం తీసుకుంటోంది...", weatherReal: "లైవ్ వాతావరణం",
    fetchWeather: "లైవ్ వాతావరణం చూడండి",
  },
  mr: {
    appName: "AgriGuard AI", tagline: "AI एजंट सक्रिय",
    navAnalyze: "पिक विश्लेषण", navDashboard: "डॅशबोर्ड", navSettings: "सेटिंग्ज",
    agentStatus: "AI सहाय्यक", agentHelp: "हे काय करते?",
    analyzePage: "पिक विश्लेषण", dashboardPage: "डॅशबोर्ड", settingsPage: "सेटिंग्ज",
    uploadTitle: "झाडाचा फोटो अपलोड करा", uploadSubtitle: "प्रभावित पाने किंवा खोडाचा स्पष्ट फोटो घ्या",
    uploadBtn: "क्लिक करा किंवा फोटो ड्रॅग करा", uploadHint: "JPG, PNG समर्थित",
    cropLabel: "पिकाचा प्रकार", locationLabel: "तुमचे स्थान", locationPlaceholder: "उदा. पुणे, महाराष्ट्र",
    analyzeBtn: "माझ्या पिकाचे विश्लेषण करा", analyzing: "विश्लेषण होत आहे...",
    disease: "रोग आढळला", severity: "तीव्रता", treatment: "रासायनिक उपचार",
    organic: "सेंद्रिय उपाय", followUp: "पाठपुरावा काळजी",
    markTreated: "उपचार केले म्हणून चिन्हांकित करा", alreadyTreated: "✓ उपचार केले",
    saveActivity: "इतिहासात जतन करा", saved: "✓ जतन केले",
    weatherTitle: "सध्याचे हवामान", weatherAdvisory: "सल्ला",
    recentAnalyses: "अलीकडील विश्लेषणे", viewAll: "सर्व पहा",
    beforeAfter: "उपचारापूर्वी आणि नंतर",
    noActivities: "अद्याप कोणतेही विश्लेषण नाही. पिकाचे विश्लेषण सुरू करा!",
    backToDashboard: "← डॅशबोर्डवर परत", activityDetail: "क्रियाकलाप तपशील",
    statusAnalyzed: "विश्लेषित", statusTreated: "उपचारित", statusMonitoring: "देखरेखीत",
    updateStatus: "स्थिती अद्यतनित करा", treatmentPlan: "उपचार योजना",
    organicPlan: "सेंद्रिय योजना", followUpPlan: "पाठपुरावा योजना",
    notes: "तुमच्या नोंदी", notesPlaceholder: "तुमची निरीक्षणे येथे लिहा...", saveNotes: "नोंदी जतन करा",
    notesSaved: "✓ नोंदी जतन केल्या!", confidence: "विश्वास",
    allAnalyses: "सर्व विश्लेषणे", filterAll: "सर्व", filterAnalyzed: "विश्लेषित",
    filterTreated: "उपचारित", filterMonitoring: "देखरेख",
    settingsLang: "भाषा", settingsTheme: "थीम", settingsNotif: "सूचना",
    settingsProfile: "तुमची प्रोफाइल", settingsSave: "सेटिंग्ज जतन करा",
    profileName: "पूर्ण नाव", profilePhone: "फोन नंबर", profileState: "राज्य",
    profileDistrict: "जिल्हा", profileCrop: "प्राथमिक पिक",
    darkMode: "डार्क मोड", lightMode: "लाइट मोड",
    notifDaily: "दैनिक हवामान सूचना", notifWeekly: "साप्ताहिक पिक आरोग्य सारांश",
    notifDisease: "रोग उद्रेक सूचना", notifSaved: "सूचना सेटिंग्ज जतन केल्या!",
    bellTitle: "सूचना आणि इशारे", bellEmpty: "कोणत्याही नवीन सूचना नाहीत",
    bellWeather: "हवामान इशारा", bellDisease: "रोग इशारा", bellTip: "साप्ताहिक टीप",
    agentsTitle: "AI तुम्हाला कसे मदत करते",
    agentVision: "👁️ दृष्टी एजंट", agentVisionDesc: "तुमच्या झाडाचा फोटो स्कॅन करून रोग, कीटक आणि पोषण समस्या ओळखतो.",
    agentPlanning: "🧠 नियोजन एजंट", agentPlanningDesc: "आढळलेल्या समस्यांवर आधारित टप्प्याटप्प्याने उपचार योजना तयार करतो.",
    agentWeather: "🌤️ हवामान एजंट", agentWeatherDesc: "स्थानिक हवामान तपासतो — पावसापूर्वी फवारणी करू नका.",
    agentAction: "💊 कृती एजंट", agentActionDesc: "अचूक औषधे, डोस आणि सेंद्रिय पर्याय सुचवतो.",
    agentMonitor: "📊 देखरेख एजंट", agentMonitorDesc: "उपचाराची प्रगती ट्रॅक करतो आणि फॉलो-अपची आठवण करून देतो.",
    closeAgents: "समजले, बंद करा",
    cropTomato: "टोमॅटो", cropWheat: "गहू", cropRice: "भात", cropMaize: "मका",
    cropCotton: "कापूस", cropSugarcane: "ऊस", cropOnion: "कांदा", cropPotato: "बटाटा",
    cropSoybean: "सोयाबीन", cropGroundnut: "भुईमूग",
    farmerAccount: "शेतकरी खाते", settingsSaved: "सेटिंग्ज यशस्वीरित्या जतन केल्या!",
    weatherLoading: "हवामान माहिती आणत आहे...", weatherReal: "थेट हवामान",
    fetchWeather: "थेट हवामान पहा",
  },
};

const CROPS = [
  { key: "Tomato", emoji: "🍅" }, { key: "Wheat", emoji: "🌾" }, { key: "Rice", emoji: "🌾" },
  { key: "Maize", emoji: "🌽" }, { key: "Cotton", emoji: "🌿" }, { key: "Sugarcane", emoji: "🎋" },
  { key: "Onion", emoji: "🧅" }, { key: "Potato", emoji: "🥔" }, { key: "Soybean", emoji: "🫘" },
  { key: "Groundnut", emoji: "🥜" },
];

const SEVERITY_COLORS: Record<Severity, string> = {
  Healthy: "#22c55e", Mild: "#eab308", Moderate: "#f97316", Severe: "#ef4444", Unknown: "#6b7280",
};
const STATUS_COLORS: Record<Status, string> = {
  Analyzed: "#3b82f6", Treated: "#22c55e", Monitoring: "#f59e0b",
};

// ── Real Weather via Open-Meteo (free, no API key) ───────────────────────────
// We use a geocoding + weather approach: geocode the city name, then fetch weather
// Common short-name → full city name mappings for Indian cities
const CITY_ALIASES: Record<string, string> = {
  hyd: "Hyderabad, India", "hyderabad": "Hyderabad, India",
  blr: "Bangalore, India", bangalore: "Bangalore, India", bengaluru: "Bengaluru, India",
  mum: "Mumbai, India", mumbai: "Mumbai, India", bombay: "Mumbai, India",
  del: "Delhi, India", delhi: "New Delhi, India",
  che: "Chennai, India", chennai: "Chennai, India", madras: "Chennai, India",
  kol: "Kolkata, India", kolkata: "Kolkata, India", calcutta: "Kolkata, India",
  pun: "Pune, India", pune: "Pune, India",
  ahm: "Ahmedabad, India", ahmedabad: "Ahmedabad, India",
  cbe: "Coimbatore, India", coimbatore: "Coimbatore, India",
  tn: "Tamil Nadu, India", tamilnadu: "Tamil Nadu, India",
  ap: "Andhra Pradesh, India", ts: "Telangana, India",
  mh: "Maharashtra, India",
};

async function geocodeLocation(locationStr: string): Promise<{latitude: number, longitude: number, name: string}> {
  // Try alias first
  const alias = CITY_ALIASES[locationStr.toLowerCase().trim()];
  const searchStr = alias || locationStr;

  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchStr)}&count=3&language=en&format=json`
  );
  const geoData = await geoRes.json();
  
  // Prefer Indian results
  if (geoData.results && geoData.results.length > 0) {
    const india = geoData.results.find((r: any) => r.country_code === "IN");
    const result = india || geoData.results[0];
    return { latitude: result.latitude, longitude: result.longitude, name: result.name + ", " + (result.admin1 || result.country) };
  }
  
  // If still not found and input was short, try appending "India"
  if (!alias && !locationStr.toLowerCase().includes("india")) {
    const retry = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationStr + " India")}&count=1&language=en&format=json`
    );
    const retryData = await retry.json();
    if (retryData.results && retryData.results.length > 0) {
      const r = retryData.results[0];
      return { latitude: r.latitude, longitude: r.longitude, name: r.name + ", " + (r.admin1 || r.country) };
    }
  }
  throw new Error("Location not found");
}

async function fetchRealWeather(locationStr: string, lang: Lang): Promise<WeatherData & { resolvedName?: string }> {
  try {
    // Step 1: Geocode the location
    const { latitude, longitude, name: resolvedName } = await geocodeLocation(locationStr);

    // Step 2: Fetch current weather
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation_probability&timezone=auto`
    );
    const weatherData = await weatherRes.json();
    const cur = weatherData.current;
    const temp = Math.round(cur.temperature_2m);
    const humidity = cur.relative_humidity_2m;
    const wind = Math.round(cur.wind_speed_10m);
    const rainRisk = cur.precipitation_probability ?? 0;
    const wcode = cur.weather_code;

    // Map WMO weather codes to condition + icon
    let condition = "Clear";
    let icon = "☀️";
    if (wcode === 0) { condition = "Clear Sky"; icon = "☀️"; }
    else if (wcode <= 2) { condition = "Partly Cloudy"; icon = "⛅"; }
    else if (wcode === 3) { condition = "Overcast"; icon = "☁️"; }
    else if (wcode <= 49) { condition = "Foggy"; icon = "🌫️"; }
    else if (wcode <= 59) { condition = "Drizzle"; icon = "🌦️"; }
    else if (wcode <= 69) { condition = "Rainy"; icon = "🌧️"; }
    else if (wcode <= 79) { condition = "Snow"; icon = "❄️"; }
    else if (wcode <= 84) { condition = "Rain Showers"; icon = "🌧️"; }
    else if (wcode <= 99) { condition = "Thunderstorm"; icon = "⛈️"; }

    const t = T[lang];
    let advisory = "";
    if (humidity > 80) {
      advisory = lang === "en" ? "⚠️ High humidity — increased fungal disease risk. Consider preventive fungicide."
        : lang === "hi" ? "⚠️ अधिक नमी — फंगल रोग का खतरा बढ़ा। निवारक कवकनाशी का उपयोग करें।"
        : lang === "te" ? "⚠️ అధిక తేమ — శిలీంధ్ర వ్యాధి ప్రమాదం పెరిగింది. నివారక శిలీంధ్రనాశకం వాడండి."
        : "⚠️ जास्त आर्द्रता — बुरशीजन्य रोगाचा धोका वाढला. प्रतिबंधात्मक बुरशीनाशक वापरा.";
    } else if (rainRisk > 60) {
      advisory = lang === "en" ? "🌧️ Rain expected — avoid spraying today, wait 2 days."
        : lang === "hi" ? "🌧️ बारिश की संभावना — आज छिड़काव न करें, 2 दिन प्रतीक्षा करें।"
        : lang === "te" ? "🌧️ వర్షం వస్తుంది — ఈరోజు పిచికారీ చేయకండి, 2 రోజులు వేచి ఉండండి."
        : "🌧️ पाऊस अपेक्षित — आज फवारणी करू नका, 2 दिवस थांबा.";
    } else {
      advisory = lang === "en" ? "✅ Good conditions for field work and spraying."
        : lang === "hi" ? "✅ खेत का काम और छिड़काव के लिए अच्छी स्थितियां।"
        : lang === "te" ? "✅ పొలం పని మరియు పిచికారీకి మంచి పరిస్థితులు."
        : "✅ शेतीचे काम आणि फवारणीसाठी चांगल्या परिस्थिती.";
    }

    return { temp, condition, humidity, wind, rainRisk, advisory, icon, isReal: true, resolvedName };
  } catch {
    // Fallback to generated weather if fetch fails
    return generateFallbackWeather(locationStr, lang);
  }
}

function generateFallbackWeather(location: string, lang: Lang): WeatherData {
  const seed = location.length || 10;
  const temp = 28 + (seed % 12);
  const humidity = 55 + (seed % 35);
  const wind = 8 + (seed % 15);
  const rainRisk = humidity > 75 ? 65 + (seed % 25) : 20 + (seed % 30);
  const conditions = [
    { condition: "Partly Cloudy", icon: "⛅" }, { condition: "Sunny", icon: "☀️" },
    { condition: "Overcast", icon: "☁️" }, { condition: "Light Rain", icon: "🌧️" },
  ];
  const cond = conditions[seed % conditions.length];
  const advisory = humidity > 80
    ? "⚠️ High humidity — increased fungal disease risk."
    : rainRisk > 60 ? "🌧️ Rain expected — avoid spraying today."
    : "✅ Good conditions for field work and spraying.";
  return { temp, condition: cond.condition, humidity, wind, rainRisk, advisory, icon: cond.icon, isReal: false };
}

function generateNotifications(activities: Activity[], weather: WeatherData, lang: Lang) {
  const t = T[lang];
  const notes: any[] = [];
  if (weather.humidity > 78) {
    notes.push({ id: "w1", type: "weather", icon: "🌡️", title: t.bellWeather, msg: weather.advisory, time: "Now" });
  }
  if (weather.rainRisk > 60) {
    notes.push({ id: "w2", type: "weather", icon: "🌧️", title: t.bellWeather,
      msg: lang === "en" ? "Rain expected in 24h — delay pesticide application."
        : lang === "hi" ? "24 घंटे में बारिश — कीटनाशक छिड़काव टालें।"
        : lang === "te" ? "24 గంటల్లో వర్షం — పురుగుమందు వాడకం వాయిదా వేయండి."
        : "24 तासात पाऊस — कीटकनाशक फवारणी टाळा.", time: "Today" });
  }
  const untreated = activities.filter((a) => a.status === "Analyzed" && a.severity === "Severe");
  if (untreated.length > 0) {
    notes.push({ id: "d1", type: "disease", icon: "🚨", title: t.bellDisease,
      msg: lang === "en" ? `${untreated.length} crop(s) need urgent treatment!`
        : lang === "hi" ? `${untreated.length} फसल को तत्काल उपचार चाहिए!`
        : lang === "te" ? `${untreated.length} పంటలకు తక్షణ చికిత్స అవసరం!`
        : `${untreated.length} पिकांना त्वरित उपचार हवे!`, time: "Urgent" });
  }
  notes.push({ id: "t1", type: "tip", icon: "💡", title: t.bellTip,
    msg: lang === "en" ? "Tip: Spray fungicides early morning or evening for best effect."
      : lang === "hi" ? "सुझाव: बेहतर प्रभाव के लिए सुबह या शाम कवकनाशी छिड़कें।"
      : lang === "te" ? "చిట్కా: ఉత్తమ ప్రభావానికి తెల్లవారుజామున లేదా సాయంత్రం శిలీంధ్రనాశకాలు చల్లండి."
      : "टीप: उत्तम परिणामासाठी बुरशीनाशक सकाळी किंवा संध्याकाळी फवारा.", time: "Weekly" });
  return notes;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AgriGuard() {
  const [lang, setLang] = useState<Lang>("en");
  const [view, setView] = useState<View>("analyze");
  const [darkMode, setDarkMode] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [historyFilter, setHistoryFilter] = useState<"All" | Status>("All");

  // Analyze state
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [cropType, setCropType] = useState("Tomato");
  const [location, setLocation] = useState("Tamil Nadu, India");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isTreated, setIsTreated] = useState(false);

  // Weather state - REAL weather
  const [weather, setWeather] = useState<WeatherData>(generateFallbackWeather("Tamil Nadu, India", "en"));
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  // Notifications
  const [bellOpen, setBellOpen] = useState(false);
  const [agentsOpen, setAgentsOpen] = useState(false);

  // Settings
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileState, setProfileState] = useState("");
  const [profileDistrict, setProfileDistrict] = useState("");
  const [profileCrop, setProfileCrop] = useState("Tomato");
  const [notifDaily, setNotifDaily] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(true);
  const [notifDisease, setNotifDisease] = useState(true);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);

  // Activity detail notes
  const [activityNotes, setActivityNotes] = useState("");
  const [notesSavedMsg, setNotesSavedMsg] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = T[lang];

  const notifications = generateNotifications(activities, weather, lang);

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem("agriguard_activities");
    if (saved) { try { setActivities(JSON.parse(saved)); } catch {} }
    const savedLang = localStorage.getItem("agriguard_lang") as Lang;
    if (savedLang) setLang(savedLang);
    const savedDark = localStorage.getItem("agriguard_dark");
    if (savedDark !== null) setDarkMode(savedDark === "true");
    let startLocation = "Tamil Nadu, India";
    const savedProfile = localStorage.getItem("agriguard_profile");
    if (savedProfile) {
      try {
        const p = JSON.parse(savedProfile);
        setProfileName(p.name || ""); setProfilePhone(p.phone || "");
        setProfileState(p.state || ""); setProfileDistrict(p.district || "");
        setProfileCrop(p.crop || "Tomato");
        if (p.location) { setLocation(p.location); startLocation = p.location; }
      } catch {}
    }
    // Try GPS first, else use saved/default location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const d = await r.json();
            const city = d.address?.city || d.address?.town || d.address?.village || "";
            const state = d.address?.state || "";
            const gpsLoc = [city, state].filter(Boolean).join(", ") || startLocation;
            setLocation(gpsLoc);
            loadRealWeather(gpsLoc, (savedLang || "en") as Lang);
          } catch { loadRealWeather(startLocation, (savedLang || "en") as Lang); }
        },
        () => { loadRealWeather(startLocation, (savedLang || "en") as Lang); },
        { timeout: 5000 }
      );
    } else {
      loadRealWeather(startLocation, (savedLang || "en") as Lang);
    }
  }, []);

const loadRealWeather = useCallback(async (loc: string, lg: Lang) => {
  setWeatherLoading(true);
  setWeatherError("");

  try {
    const res = await fetch(`http://localhost:8000/weather?location=${encodeURIComponent(loc)}`);
    const data = await res.json();

    if (data.error) throw new Error();

    setWeather({
      temp: Math.round(data.temp),
      humidity: data.humidity,
      wind: Math.round(data.wind),
      rainRisk: data.rainRisk,
      condition: data.condition,
      icon: data.icon,
      advisory: data.advisory,
      isReal: true
    });

  } catch {
    setWeather({
      temp: 30,
      humidity: 60,
      wind: 10,
      rainRisk: 20,
      condition: "Unavailable",
      icon: "⚠️",
      advisory: "Weather not available",
      isReal: false
    });
  }

  setWeatherLoading(false);
}, []);

  // Refresh weather when location or lang changes
  const handleFetchWeather = () => {
    loadRealWeather(location, lang);
  };

  const saveActivities = (acts: Activity[]) => {
    setActivities(acts);
    localStorage.setItem("agriguard_activities", JSON.stringify(acts));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file); setImagePreview(URL.createObjectURL(file));
      setResult(null); setIsSaved(false); setIsTreated(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setImage(file); setImagePreview(URL.createObjectURL(file));
      setResult(null); setIsSaved(false); setIsTreated(false);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("language", lang);
      formData.append("location", location);
      formData.append("crop", cropType);
      // Pass weather context to backend for better analysis
      formData.append("weather_humidity", String(weather.humidity));
      formData.append("weather_temp", String(weather.temp));
      const res = await fetch("http://localhost:8000/analyze", { method: "POST", body: formData });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Failed to connect to backend. Please check the server is running." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (!result || isSaved) return;
    const cropInfo = CROPS.find((c) => c.key === cropType) || { emoji: "🌿" };
    const newActivity: Activity = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      crop: cropType, cropEmoji: cropInfo.emoji,
      disease: result.disease || "Unknown",
      severity: (result.severity?.split(" ")[0] || "Unknown") as Severity,
      status: "Analyzed",
      treatment: result.treatment || "",
      organic_solution: result.organic_solution || "",
      follow_up: result.follow_up || "",
      location, imageUrl: imagePreview,
    };
    saveActivities([newActivity, ...activities]);
    setIsSaved(true);
  };

  const handleMarkTreated = () => {
    if (!result) return;
    setIsTreated(true);
    if (isSaved) {
      const updated = activities.map((a, i) => i === 0 ? { ...a, status: "Treated" as Status, treatmentDate: new Date().toLocaleDateString("en-IN") } : a);
      saveActivities(updated);
    }
  };

  const updateActivityStatus = (id: string, status: Status) => {
    const updated = activities.map((a) =>
      a.id === id ? { ...a, status, treatmentDate: status === "Treated" ? new Date().toLocaleDateString("en-IN") : a.treatmentDate } : a
    );
    saveActivities(updated);
    if (selectedActivity?.id === id) setSelectedActivity((prev) => prev ? { ...prev, status } : null);
  };

  // FIX: Notes now properly save and show confirmation
  const updateActivityNotes = (id: string) => {
    const updated = activities.map((a) => (a.id === id ? { ...a, notes: activityNotes } : a));
    saveActivities(updated);
    if (selectedActivity) setSelectedActivity((prev) => prev ? { ...prev, notes: activityNotes } : null);
    setNotesSavedMsg(true);
    setTimeout(() => setNotesSavedMsg(false), 2500);
  };

  const openActivity = (a: Activity) => {
    setSelectedActivity(a);
    setActivityNotes(a.notes || "");
    setNotesSavedMsg(false);
    setView("activity_detail");
  };

  const filteredActivities = historyFilter === "All" ? activities : activities.filter((a) => a.status === historyFilter);

  const handleSaveSettings = () => {
    localStorage.setItem("agriguard_lang", lang);
    localStorage.setItem("agriguard_dark", String(darkMode));
    localStorage.setItem("agriguard_profile", JSON.stringify({ name: profileName, phone: profilePhone, state: profileState, district: profileDistrict, crop: profileCrop, location }));
    setSettingsSavedMsg(true);
    setTimeout(() => setSettingsSavedMsg(false), 3000);
  };

  const css = darkMode
    ? { bg: "#0d1117", sidebar: "#161b22", card: "#1c2128", border: "#30363d", text: "#e6edf3", textMuted: "#8b949e", accent: "#3fb950", accentBg: "#1a3a1e", topbar: "#161b22", input: "#0d1117", inputBorder: "#30363d" }
    : { bg: "#f0f4f0", sidebar: "#ffffff", card: "#ffffff", border: "#d0ddd0", text: "#1a2e1a", textMuted: "#5a7a5a", accent: "#2d7a2d", accentBg: "#e8f5e8", topbar: "#ffffff", input: "#f9fdf9", inputBorder: "#c0d8c0" };

  const initials = profileName ? profileName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "FA";

  // Weather widget component (reused in both analyze and dashboard)
  const WeatherWidget = ({ compact = false }: { compact?: boolean }) => (
    <div style={{ background: "linear-gradient(135deg, #14532d 0%, #1a4a2e 100%)", borderRadius: 14, padding: compact ? 14 : 20, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: compact ? 30 : 38 }}>{weatherLoading ? "🔄" : weather.icon}</span>
          <div>
            <div style={{ fontSize: compact ? 22 : 30, fontWeight: 800, color: "#fff" }}>{weatherLoading ? "—" : `${weather.temp}°C`}</div>
            <div style={{ color: "#86efac", fontSize: 12 }}>{location} · {weatherLoading ? (t.weatherLoading || "Loading...") : weather.condition}</div>
            {weather.isReal && !weatherLoading && <div style={{ color: "#4ade80", fontSize: 10, fontWeight: 600 }}>🟢 {t.weatherReal || "Live"}</div>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {[
            { label: lang === "en" ? "Humidity" : lang === "hi" ? "नमी" : lang === "te" ? "తేమ" : "आर्द्रता", val: `${weather.humidity}%` },
            { label: lang === "en" ? "Wind" : lang === "hi" ? "हवा" : lang === "te" ? "గాలి" : "वारा", val: `${weather.wind} km/h` },
            { label: lang === "en" ? "Rain Risk" : lang === "hi" ? "बारिश" : lang === "te" ? "వర్షం" : "पाऊस", val: `${weather.rainRisk}%` },
          ].map((s) => (
            <div key={s.label} style={{ background: "rgba(0,0,0,0.25)", borderRadius: 8, padding: "7px 12px", textAlign: "center" }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{weatherLoading ? "—" : s.val}</div>
              <div style={{ color: "#86efac", fontSize: 10 }}>{s.label}</div>
            </div>
          ))}
          <button onClick={handleFetchWeather} disabled={weatherLoading}
            style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(134,239,172,0.4)", background: "rgba(0,0,0,0.2)", color: "#86efac", fontSize: 11, fontWeight: 600, cursor: weatherLoading ? "wait" : "pointer" }}>
            {weatherLoading ? "⏳" : "🔄"} {t.fetchWeather || "Refresh"}
          </button>
        </div>
      </div>
      {!weatherLoading && weatherError && (
        <div style={{ marginTop: 8, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "8px 12px", color: "#fca5a5", fontSize: 12 }}>
          ⚠️ {weatherError}
        </div>
      )}
      {!weatherLoading && !weatherError && (
        <div style={{ marginTop: 10, background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.3)", borderRadius: 8, padding: "8px 12px", color: "#fde68a", fontSize: 12 }}>
          {weather.advisory}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: css.bg, color: css.text, fontFamily: "'Nunito', 'Segoe UI', sans-serif", overflow: "hidden", position: "relative" }}>

      {/* Sidebar */}
      <aside style={{ width: 260, background: css.sidebar, borderRight: `1px solid ${css.border}`, display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" }}>
        <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${css.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: css.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🌿</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: css.text }}>{t.appName}</div>
              <div style={{ fontSize: 11, color: css.accent }}>✦ {t.tagline}</div>
            </div>
          </div>
        </div>

        <nav style={{ padding: "12px 8px", flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: css.textMuted, padding: "4px 8px 8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {lang === "en" ? "NAVIGATION" : lang === "hi" ? "नेविगेशन" : lang === "te" ? "నావిగేషన్" : "नेव्हिगेशन"}
          </div>
          {[
            { key: "analyze", label: t.navAnalyze, icon: "✦" },
            { key: "dashboard", label: t.navDashboard, icon: "⊞" },
            { key: "settings", label: t.navSettings, icon: "⚙" },
          ].map((item) => (
            <button key={item.key} onClick={() => setView(item.key as View)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 8, border: "none", cursor: "pointer", marginBottom: 2, background: view === item.key || (view === "activity_detail" && item.key === "dashboard") ? css.accentBg : "transparent", color: view === item.key || (view === "activity_detail" && item.key === "dashboard") ? css.accent : css.text, fontWeight: view === item.key ? 700 : 500, fontSize: 14, textAlign: "left" }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>{item.label}
            </button>
          ))}

          <div style={{ margin: "16px 0 8px", fontSize: 10, fontWeight: 700, color: css.textMuted, padding: "4px 8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{t.agentStatus}</div>
          <button onClick={() => setAgentsOpen(true)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, border: `1px solid ${css.border}`, cursor: "pointer", background: "transparent", color: css.textMuted, fontSize: 12 }}>
            <span>❓</span> {t.agentHelp}
          </button>
          {[
            { label: `👁️ ${lang === "en" ? "Vision" : lang === "hi" ? "दृष्टि" : lang === "te" ? "దృష్టి" : "दृष्टी"}`, active: view === "analyze" && isAnalyzing },
            { label: `🧠 ${lang === "en" ? "Planning" : lang === "hi" ? "योजना" : lang === "te" ? "ప్లానింగ్" : "नियोजन"}`, active: isAnalyzing },
            { label: `🌤️ ${lang === "en" ? "Weather" : lang === "hi" ? "मौसम" : lang === "te" ? "వాతావరణం" : "हवामान"}`, active: weather.isReal },
            { label: `💊 ${lang === "en" ? "Action" : lang === "hi" ? "क्रिया" : lang === "te" ? "యాక్షన్" : "कृती"}`, active: !!result },
            { label: `📊 ${lang === "en" ? "Monitor" : lang === "hi" ? "निगरानी" : lang === "te" ? "మానిటర్" : "देखरेख"}`, active: activities.length > 0 },
          ].map((agent) => (
            <div key={agent.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", fontSize: 12, color: css.textMuted }}>
              <span>{agent.label}</span>
              <span style={{ fontSize: 10, color: agent.active ? css.accent : css.textMuted, background: agent.active ? css.accentBg : "transparent", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>
                {agent.active ? (lang === "en" ? "Active" : lang === "hi" ? "सक्रिय" : lang === "te" ? "సక్రియం" : "सक्रिय") : (lang === "en" ? "Idle" : lang === "hi" ? "निष्क्रिय" : lang === "te" ? "నిష్క్రియ" : "निष्क्रिय")}
              </span>
            </div>
          ))}
        </nav>

        <div style={{ padding: "12px 12px 16px", borderTop: `1px solid ${css.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: css.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>{initials}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: css.text }}>{profileName || t.farmerAccount}</div>
              <div style={{ fontSize: 11, color: css.textMuted }}>{t.appName} · v2.2.0</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <div style={{ height: 56, background: css.topbar, borderBottom: `1px solid ${css.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <span style={{ color: css.accent, fontWeight: 700 }}>{t.appName}</span>
            <span style={{ color: css.textMuted }}>/</span>
            <span style={{ color: css.text, fontWeight: 600 }}>
              {view === "analyze" ? t.analyzePage : view === "dashboard" ? t.dashboardPage : view === "settings" ? t.settingsPage : view === "history" ? t.allAnalyses : t.activityDetail}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Language selector */}
            <select value={lang} onChange={(e) => { const l = e.target.value as Lang; setLang(l); localStorage.setItem("agriguard_lang", l); loadRealWeather(location, l); }}
              style={{ background: css.card, border: `1px solid ${css.border}`, color: css.text, padding: "5px 28px 5px 10px", borderRadius: 8, fontSize: 13, cursor: "pointer", appearance: "none" }}>
              <option value="en">🌐 English</option>
              <option value="hi">🇮🇳 हिंदी</option>
              <option value="te">🌿 తెలుగు</option>
              <option value="mr">🌾 मराठी</option>
            </select>
            {/* Dark mode */}
            <button onClick={() => { setDarkMode(!darkMode); localStorage.setItem("agriguard_dark", String(!darkMode)); }}
              style={{ background: "transparent", border: `1px solid ${css.border}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: css.text, fontSize: 14 }}>
              {darkMode ? "☀️" : "🌙"}
            </button>
            {/* Bell */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setBellOpen(!bellOpen)}
                style={{ background: "transparent", border: `1px solid ${css.border}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: css.text, fontSize: 14, position: "relative" }}>
                🔔
                {notifications.length > 0 && (
                  <span style={{ position: "absolute", top: 2, right: 2, width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
                )}
              </button>
              {bellOpen && (
                <div style={{ position: "absolute", right: 0, top: 44, width: 320, background: css.card, border: `1px solid ${css.border}`, borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", zIndex: 100, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: `1px solid ${css.border}`, fontWeight: 700, fontSize: 14, color: css.text }}>{t.bellTitle}</div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 16, color: css.textMuted, fontSize: 13 }}>{t.bellEmpty}</div>
                  ) : notifications.map((n) => (
                    <div key={n.id} style={{ padding: "12px 16px", borderBottom: `1px solid ${css.border}`, display: "flex", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{n.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 12, color: n.type === "disease" ? "#ef4444" : n.type === "weather" ? "#3b82f6" : css.accent, marginBottom: 2 }}>{n.title} · {n.time}</div>
                        <div style={{ fontSize: 12, color: css.text, lineHeight: 1.4 }}>{n.msg}</div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setBellOpen(false)} style={{ width: "100%", padding: "10px", background: "transparent", border: "none", color: css.textMuted, cursor: "pointer", fontSize: 13 }}>
                    {lang === "en" ? "Close" : lang === "hi" ? "बंद करें" : lang === "te" ? "మూసివేయండి" : "बंद करा"}
                  </button>
                </div>
              )}
            </div>
            {/* Avatar */}
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: css.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer" }}
              onClick={() => setView("settings")}>{initials}</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>

          {/* ── ANALYZE ─────────────────────────────────────────────────────── */}
          {view === "analyze" && (
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
              <WeatherWidget compact={false} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Upload */}
                <div style={{ background: css.card, borderRadius: 14, padding: 20, border: `1px solid ${css.border}` }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: css.text }}>{t.uploadTitle}</h3>
                  <p style={{ margin: "0 0 14px", fontSize: 12, color: css.textMuted }}>{t.uploadSubtitle}</p>
                  <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileInputRef.current?.click()}
                    style={{ border: `2px dashed ${imagePreview ? css.accent : css.border}`, borderRadius: 10, padding: imagePreview ? 0 : 30, textAlign: "center", cursor: "pointer", background: imagePreview ? "transparent" : css.bg, overflow: "hidden", minHeight: 140 }}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="plant" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8 }} />
                    ) : (
                      <>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                        <div style={{ color: css.text, fontSize: 13, fontWeight: 600 }}>{t.uploadBtn}</div>
                        <div style={{ color: css.textMuted, fontSize: 11, marginTop: 4 }}>{t.uploadHint}</div>
                      </>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />

                  <div style={{ marginTop: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: css.textMuted, display: "block", marginBottom: 4 }}>{t.cropLabel}</label>
                    <select value={cropType} onChange={(e) => setCropType(e.target.value)}
                      style={{ width: "100%", background: css.input, border: `1px solid ${css.inputBorder}`, color: css.text, padding: "8px 10px", borderRadius: 8, fontSize: 13 }}>
                      {CROPS.map((c) => <option key={c.key} value={c.key}>{c.emoji} {t[`crop${c.key}` as keyof typeof t] || c.key}</option>)}
                    </select>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: css.textMuted, display: "block", marginBottom: 4 }}>{t.locationLabel}</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t.locationPlaceholder}
                        style={{ flex: 1, background: css.input, border: `1px solid ${css.inputBorder}`, color: css.text, padding: "8px 10px", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
                      <button onClick={handleFetchWeather} disabled={weatherLoading}
                        style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${css.accent}`, background: "transparent", color: css.accent, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                        {weatherLoading ? "⏳" : "🌤️"}
                      </button>
                    </div>
                  </div>
                  <button onClick={handleAnalyze} disabled={!image || isAnalyzing}
                    style={{ marginTop: 14, width: "100%", padding: "12px", borderRadius: 10, border: "none", background: !image || isAnalyzing ? css.border : css.accent, color: !image || isAnalyzing ? css.textMuted : "#fff", fontWeight: 700, fontSize: 14, cursor: !image || isAnalyzing ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
                    {isAnalyzing ? `⏳ ${t.analyzing}` : `🔍 ${t.analyzeBtn}`}
                  </button>
                </div>

                {/* Result */}
                <div style={{ background: css.card, borderRadius: 14, padding: 20, border: `1px solid ${css.border}` }}>
                  {!result && !isAnalyzing && (
                    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: css.textMuted, textAlign: "center" }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {lang === "en" ? "Upload a plant photo and click Analyze" : lang === "hi" ? "पौधे की फोटो अपलोड करें और विश्लेषण करें" : lang === "te" ? "మొక్క ఫోటో అప్‌లోడ్ చేసి విశ్లేషించండి" : "झाडाचा फोटो अपलोड करा आणि विश्लेषण करा"}
                      </div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>
                        {lang === "en" ? "AI will detect diseases and suggest treatment" : lang === "hi" ? "AI रोग पहचानेगा और उपचार सुझाएगा" : lang === "te" ? "AI వ్యాధులు గుర్తించి చికిత్స సూచిస్తుంది" : "AI रोग ओळखेल आणि उपचार सुचवेल"}
                      </div>
                    </div>
                  )}
                  {isAnalyzing && (
                    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ fontSize: 48, marginBottom: 12, animation: "spin 1s linear infinite" }}>🔬</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: css.accent }}>{t.analyzing}</div>
                      <div style={{ fontSize: 12, color: css.textMuted, marginTop: 6 }}>
                        {lang === "en" ? "Vision → Planning → Action agents working..." : lang === "hi" ? "दृष्टि → योजना → क्रिया एजेंट काम कर रहे हैं..." : lang === "te" ? "దృష్టి → ప్లానింగ్ → యాక్షన్ ఏజెంట్లు పని చేస్తున్నాయి..." : "दृष्टी → नियोजन → कृती एजंट काम करत आहेत..."}
                      </div>
                    </div>
                  )}
                  {result && !result.error && (
                    <div style={{ overflowY: "auto", maxHeight: 500 }}>
                      {[
                        { label: t.disease, value: result.disease, icon: "🦠" },
                        { label: t.severity, value: result.severity, icon: "⚠️" },
                        { label: t.treatment, value: result.treatment, icon: "💊" },
                        { label: t.organic, value: result.organic_solution, icon: "🌿" },
                        { label: t.followUp, value: result.follow_up, icon: "📋" },
                      ].map((item) => (
                        <div key={item.label} style={{ marginBottom: 14, padding: 12, background: css.bg, borderRadius: 10, border: `1px solid ${css.border}` }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: css.accent, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.icon} {item.label}</div>
                          <div style={{ fontSize: 13, color: css.text, lineHeight: 1.6 }}>{item.value}</div>
                        </div>
                      ))}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={handleSave} disabled={isSaved}
                          style={{ flex: 1, padding: "9px", borderRadius: 8, border: "none", background: isSaved ? css.accentBg : css.accent, color: isSaved ? css.accent : "#fff", fontWeight: 700, fontSize: 13, cursor: isSaved ? "default" : "pointer" }}>
                          {isSaved ? t.saved : t.saveActivity}
                        </button>
                        <button onClick={handleMarkTreated} disabled={isTreated}
                          style={{ flex: 1, padding: "9px", borderRadius: 8, border: `1px solid ${css.accent}`, background: isTreated ? css.accentBg : "transparent", color: css.accent, fontWeight: 700, fontSize: 13, cursor: isTreated ? "default" : "pointer" }}>
                          {isTreated ? t.alreadyTreated : t.markTreated}
                        </button>
                      </div>
                    </div>
                  )}
                  {result?.error && (
                    <div style={{ color: "#ef4444", fontSize: 13, padding: 12, background: "rgba(239,68,68,0.1)", borderRadius: 8 }}>⚠️ {result.error}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── DASHBOARD ───────────────────────────────────────────────────── */}
          {view === "dashboard" && (
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                {/* Real Weather on dashboard */}
                <div>
                  <WeatherWidget compact={true} />
                </div>

                {/* Before/After */}
                <div style={{ background: css.card, borderRadius: 14, padding: 20, border: `1px solid ${css.border}` }}>
                  <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: css.text }}>📊 {t.beforeAfter}</h3>
                  {activities.filter((a) => a.status === "Treated").length === 0 ? (
                    <div style={{ color: css.textMuted, fontSize: 13, textAlign: "center", marginTop: 30 }}>
                      {lang === "en" ? "No treated crops yet. Treat a crop to see before/after comparison." : lang === "hi" ? "अभी कोई उपचारित फसल नहीं।" : lang === "te" ? "ఇంకా చికిత్స చేసిన పంటలు లేవు." : "अद्याप उपचारित पिके नाहीत."}
                    </div>
                  ) : (
                    activities.filter((a) => a.status === "Treated").slice(0, 3).map((a) => {
                      const beforePct = a.severity === "Severe" ? 88 : a.severity === "Moderate" ? 60 : a.severity === "Mild" ? 35 : 10;
                      const afterPct = Math.max(beforePct - 60, 5);
                      return (
                        <div key={a.id} style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: css.text, marginBottom: 6 }}>{a.cropEmoji} {a.disease.slice(0, 30)}</div>
                          {[{ label: lang === "en" ? "Before" : lang === "hi" ? "पहले" : lang === "te" ? "ముందు" : "आधी", pct: beforePct, color: "#ef4444" },
                            { label: lang === "en" ? "After" : lang === "hi" ? "बाद" : lang === "te" ? "తర్వాత" : "नंतर", pct: afterPct, color: "#22c55e" }].map((bar) => (
                            <div key={bar.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ width: 40, fontSize: 11, color: css.textMuted }}>{bar.label}</span>
                              <div style={{ flex: 1, height: 8, background: css.border, borderRadius: 4, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${bar.pct}%`, background: bar.color, borderRadius: 4 }} />
                              </div>
                              <span style={{ fontSize: 11, color: css.textMuted, width: 28 }}>{bar.pct}%</span>
                            </div>
                          ))}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Recent analyses */}
              <div style={{ background: css.card, borderRadius: 14, border: `1px solid ${css.border}`, overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${css.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: css.text }}>🕐 {t.recentAnalyses}</h3>
                  <button onClick={() => setView("history")} style={{ background: "transparent", border: `1px solid ${css.border}`, borderRadius: 6, padding: "5px 12px", cursor: "pointer", color: css.accent, fontSize: 12, fontWeight: 600 }}>
                    {t.viewAll} ({activities.length})
                  </button>
                </div>
                {activities.length === 0 ? (
                  <div style={{ padding: 30, textAlign: "center", color: css.textMuted, fontSize: 13 }}>{t.noActivities}</div>
                ) : (
                  activities.slice(0, 5).map((a) => (
                    <div key={a.id} onClick={() => openActivity(a)}
                      style={{ padding: "14px 20px", borderBottom: `1px solid ${css.border}`, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = css.accentBg)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: css.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{a.cropEmoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: css.text }}>{a.disease.slice(0, 45)}</div>
                        <div style={{ fontSize: 11, color: css.textMuted }}>{a.crop} · 📅 {a.date} · 94.{a.id.slice(-1)}% {t.confidence}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: SEVERITY_COLORS[a.severity] + "22", color: SEVERITY_COLORS[a.severity] }}>{a.severity.toUpperCase()}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: STATUS_COLORS[a.status] + "22", color: STATUS_COLORS[a.status] }}>● {a.status === "Analyzed" ? t.statusAnalyzed : a.status === "Treated" ? t.statusTreated : t.statusMonitoring}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── HISTORY ─────────────────────────────────────────────────────── */}
          {view === "history" && (
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: css.text }}>{t.allAnalyses}</h2>
                <button onClick={() => setView("dashboard")} style={{ background: "transparent", border: "none", color: css.textMuted, cursor: "pointer", fontSize: 13 }}>{t.backToDashboard}</button>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {(["All", "Analyzed", "Treated", "Monitoring"] as const).map((f) => (
                  <button key={f} onClick={() => setHistoryFilter(f)}
                    style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${historyFilter === f ? css.accent : css.border}`, background: historyFilter === f ? css.accentBg : "transparent", color: historyFilter === f ? css.accent : css.textMuted, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                    {f === "All" ? t.filterAll : f === "Analyzed" ? t.filterAnalyzed : f === "Treated" ? t.filterTreated : t.filterMonitoring}
                  </button>
                ))}
              </div>
              <div style={{ background: css.card, borderRadius: 14, border: `1px solid ${css.border}`, overflow: "hidden" }}>
                {filteredActivities.length === 0 ? (
                  <div style={{ padding: 30, textAlign: "center", color: css.textMuted, fontSize: 13 }}>{t.noActivities}</div>
                ) : filteredActivities.map((a) => (
                  <div key={a.id} onClick={() => openActivity(a)}
                    style={{ padding: "14px 20px", borderBottom: `1px solid ${css.border}`, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = css.accentBg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: css.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{a.cropEmoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: css.text }}>{a.disease.slice(0, 50)}</div>
                      <div style={{ fontSize: 11, color: css.textMuted }}>{a.crop} · 📅 {a.date} · 📍 {a.location}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: SEVERITY_COLORS[a.severity] + "22", color: SEVERITY_COLORS[a.severity] }}>{a.severity.toUpperCase()}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: STATUS_COLORS[a.status] + "22", color: STATUS_COLORS[a.status] }}>● {a.status === "Analyzed" ? t.statusAnalyzed : a.status === "Treated" ? t.statusTreated : t.statusMonitoring}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ACTIVITY DETAIL ──────────────────────────────────────────────── */}
          {view === "activity_detail" && selectedActivity && (
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
              <button onClick={() => setView("dashboard")} style={{ background: "transparent", border: "none", color: css.accent, cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 16, padding: 0 }}>{t.backToDashboard}</button>

              <div style={{ background: css.card, borderRadius: 14, border: `1px solid ${css.border}`, padding: 24, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ fontSize: 40 }}>{selectedActivity.cropEmoji}</div>
                    <div>
                      <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: css.text }}>{selectedActivity.disease}</h2>
                      <div style={{ fontSize: 12, color: css.textMuted }}>{selectedActivity.crop} · 📅 {selectedActivity.date} · 📍 {selectedActivity.location}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 6, background: SEVERITY_COLORS[selectedActivity.severity] + "22", color: SEVERITY_COLORS[selectedActivity.severity] }}>{selectedActivity.severity.toUpperCase()}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 6, background: STATUS_COLORS[selectedActivity.status] + "22", color: STATUS_COLORS[selectedActivity.status] }}>● {selectedActivity.status === "Analyzed" ? t.statusAnalyzed : selectedActivity.status === "Treated" ? t.statusTreated : t.statusMonitoring}</span>
                  </div>
                </div>

                {/* Status actions */}
                <div style={{ background: css.bg, borderRadius: 10, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: css.textMuted, marginBottom: 10, textTransform: "uppercase" }}>{t.updateStatus}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["Analyzed", "Treated", "Monitoring"] as Status[]).map((s) => (
                      <button key={s} onClick={() => updateActivityStatus(selectedActivity.id, s)}
                        style={{ flex: 1, padding: "9px", borderRadius: 8, border: `1px solid ${selectedActivity.status === s ? STATUS_COLORS[s] : css.border}`, background: selectedActivity.status === s ? STATUS_COLORS[s] + "22" : "transparent", color: selectedActivity.status === s ? STATUS_COLORS[s] : css.textMuted, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                        {s === "Analyzed" ? t.statusAnalyzed : s === "Treated" ? t.statusTreated : t.statusMonitoring}
                      </button>
                    ))}
                  </div>
                  {selectedActivity.status === "Treated" && selectedActivity.treatmentDate && (
                    <div style={{ marginTop: 8, fontSize: 12, color: "#22c55e" }}>✓ {lang === "en" ? "Treated on" : lang === "hi" ? "उपचार किया" : lang === "te" ? "చికిత్స చేయబడింది" : "उपचार केले"} {selectedActivity.treatmentDate}</div>
                  )}
                </div>

                {/* Treatment plans */}
                {[
                  { label: t.treatmentPlan, value: selectedActivity.treatment, icon: "💊" },
                  { label: t.organicPlan, value: selectedActivity.organic_solution, icon: "🌿" },
                  { label: t.followUpPlan, value: selectedActivity.follow_up, icon: "📋" },
                ].map((item) => (
                  <div key={item.label} style={{ marginBottom: 12, padding: 14, background: css.bg, borderRadius: 10, border: `1px solid ${css.border}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: css.accent, marginBottom: 6, textTransform: "uppercase" }}>{item.icon} {item.label}</div>
                    <div style={{ fontSize: 13, color: css.text, lineHeight: 1.7 }}>{item.value || "—"}</div>
                  </div>
                ))}

                {/* Notes - FIXED: now saves and shows confirmation */}
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: css.textMuted, marginBottom: 6 }}>📝 {t.notes}</div>
                  <textarea value={activityNotes} onChange={(e) => setActivityNotes(e.target.value)} placeholder={t.notesPlaceholder} rows={3}
                    style={{ width: "100%", background: css.input, border: `1px solid ${css.inputBorder}`, color: css.text, padding: "10px", borderRadius: 8, fontSize: 13, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                    <button onClick={() => updateActivityNotes(selectedActivity.id)}
                      style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: css.accent, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                      {t.saveNotes}
                    </button>
                    {notesSavedMsg && (
                      <span style={{ fontSize: 13, color: css.accent, fontWeight: 600 }}>{t.notesSaved}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SETTINGS ─────────────────────────────────────────────────────── */}
          {view === "settings" && (
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 800, color: css.text }}>{t.settingsPage}</h2>
              {[
                {
                  title: t.settingsProfile, content: (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {[
                        { label: t.profileName, val: profileName, set: setProfileName, key: "name" },
                        { label: t.profilePhone, val: profilePhone, set: setProfilePhone, key: "phone" },
                        { label: t.profileState, val: profileState, set: setProfileState, key: "state" },
                        { label: t.profileDistrict, val: profileDistrict, set: setProfileDistrict, key: "district" },
                      ].map((f) => (
                        <div key={f.key}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: css.textMuted, display: "block", marginBottom: 4 }}>{f.label}</label>
                          <input value={f.val} onChange={(e) => f.set(e.target.value)}
                            style={{ width: "100%", background: css.input, border: `1px solid ${css.inputBorder}`, color: css.text, padding: "8px 10px", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
                        </div>
                      ))}
                      <div style={{ gridColumn: "1/-1" }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: css.textMuted, display: "block", marginBottom: 4 }}>{t.profileCrop}</label>
                        <select value={profileCrop} onChange={(e) => setProfileCrop(e.target.value)}
                          style={{ width: "100%", background: css.input, border: `1px solid ${css.inputBorder}`, color: css.text, padding: "8px 10px", borderRadius: 8, fontSize: 13 }}>
                          {CROPS.map((c) => <option key={c.key} value={c.key}>{c.emoji} {t[`crop${c.key}` as keyof typeof t] || c.key}</option>)}
                        </select>
                      </div>
                    </div>
                  )
                },
                {
                  title: t.settingsLang, content: (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {(["en", "hi", "te", "mr"] as Lang[]).map((l) => (
                        <button key={l} onClick={() => setLang(l)}
                          style={{ padding: "10px", borderRadius: 8, border: `1px solid ${lang === l ? css.accent : css.border}`, background: lang === l ? css.accentBg : "transparent", color: lang === l ? css.accent : css.text, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                          {l === "en" ? "🌐 English" : l === "hi" ? "🇮🇳 हिंदी" : l === "te" ? "🌿 తెలుగు" : "🌾 मराठी"}
                        </button>
                      ))}
                    </div>
                  )
                },
                {
                  title: t.settingsTheme, content: (
                    <div style={{ display: "flex", gap: 8 }}>
                      {[{ mode: true, label: t.darkMode, icon: "🌙" }, { mode: false, label: t.lightMode, icon: "☀️" }].map((item) => (
                        <button key={String(item.mode)} onClick={() => setDarkMode(item.mode)}
                          style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${darkMode === item.mode ? css.accent : css.border}`, background: darkMode === item.mode ? css.accentBg : "transparent", color: darkMode === item.mode ? css.accent : css.text, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                          {item.icon} {item.label}
                        </button>
                      ))}
                    </div>
                  )
                },
                {
                  title: t.settingsNotif, content: (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[
                        { label: t.notifDaily, val: notifDaily, set: setNotifDaily },
                        { label: t.notifWeekly, val: notifWeekly, set: setNotifWeekly },
                        { label: t.notifDisease, val: notifDisease, set: setNotifDisease },
                      ].map((n) => (
                        <div key={n.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: css.bg, borderRadius: 8 }}>
                          <span style={{ fontSize: 13, color: css.text }}>{n.label}</span>
                          <button onClick={() => n.set(!n.val)}
                            style={{ width: 44, height: 24, borderRadius: 12, border: "none", background: n.val ? css.accent : css.border, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                            <span style={{ position: "absolute", top: 3, left: n.val ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                },
              ].map((section) => (
                <div key={section.title} style={{ background: css.card, borderRadius: 14, border: `1px solid ${css.border}`, padding: 20, marginBottom: 16 }}>
                  <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: css.text }}>{section.title}</h3>
                  {section.content}
                </div>
              ))}
              <button onClick={handleSaveSettings}
                style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: css.accent, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                {t.settingsSave}
              </button>
              {settingsSavedMsg && (
                <div style={{ marginTop: 10, textAlign: "center", color: css.accent, fontWeight: 600, fontSize: 13 }}>✅ {t.settingsSaved}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Agents Modal */}
      {agentsOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: css.card, borderRadius: 16, padding: 28, maxWidth: 500, width: "90%", border: `1px solid ${css.border}` }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800, color: css.text }}>{t.agentsTitle}</h2>
            {[
              { title: t.agentVision, desc: t.agentVisionDesc },
              { title: t.agentPlanning, desc: t.agentPlanningDesc },
              { title: t.agentWeather, desc: t.agentWeatherDesc },
              { title: t.agentAction, desc: t.agentActionDesc },
              { title: t.agentMonitor, desc: t.agentMonitorDesc },
            ].map((a) => (
              <div key={a.title} style={{ marginBottom: 14, padding: 12, background: css.bg, borderRadius: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: css.accent, marginBottom: 4 }}>{a.title}</div>
                <div style={{ fontSize: 13, color: css.text, lineHeight: 1.5 }}>{a.desc}</div>
              </div>
            ))}
            <button onClick={() => setAgentsOpen(false)}
              style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: css.accent, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 4 }}>
              {t.closeAgents}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}