const hour = 60 * 60 * 1000;
const indiaLocations = Object.freeze({
  'Andhra Pradesh':['Visakhapatnam','Vijayawada'], 'Arunachal Pradesh':['Itanagar'], 'Assam':['Guwahati'], 'Bihar':['Patna','Gaya'],
  'Chhattisgarh':['Raipur'], 'Goa':['Panaji'], 'Gujarat':['Ahmedabad'], 'Haryana':['Gurugram'], 'Himachal Pradesh':['Shimla'],
  'Jharkhand':['Ranchi'], 'Karnataka':['Bengaluru'], 'Kerala':['Kochi'], 'Madhya Pradesh':['Bhopal'], 'Maharashtra':['Mumbai','Pune'],
  'Manipur':['Imphal'], 'Meghalaya':['Shillong'], 'Mizoram':['Aizawl'], 'Nagaland':['Kohima'], 'Odisha':['Bhubaneswar'],
  'Punjab':['Ludhiana'], 'Rajasthan':['Jaipur'], 'Sikkim':['Gangtok'], 'Tamil Nadu':['Chennai'], 'Telangana':['Hyderabad'],
  'Tripura':['Agartala'], 'Uttar Pradesh':['Lucknow'], 'Uttarakhand':['Dehradun'], 'West Bengal':['Kolkata','Siliguri']
});
const areas = {
  // Demo data includes recent-signal times so quiet areas naturally cool down.
  'Patna, Bihar': { state:'Bihar', city:'Patna', reports: 2, people: 3, water: 0, rain: 'Low', history: 2, lastSignalAt: Date.now() - 52 * hour },
  'Mumbai, Maharashtra': { state:'Maharashtra', city:'Mumbai', reports: 6, people: 11, water: 2, rain: 'High', history: 4, lastSignalAt: Date.now() - 16 * hour },
  'Kolkata, West Bengal': { state:'West Bengal', city:'Kolkata', reports: 17, people: 31, water: 3, rain: 'Heavy', history: 8, lastSignalAt: Date.now() - 3 * hour }
};
let selectedArea = 'Kolkata, West Bengal';
let currentLanguage = 'en';
let supabaseClient = null;
let usingSupabase = false;
const translations = {
  en: { eyebrow:'COMMUNITY EARLY-WARNING SYSTEM',heroTitle:'Spot the signal.',heroEmphasis:'Protect the community.',heroCopy:'NeerSath brings together symptom reports, unsafe-water complaints and weather signals so health workers can investigate sooner and people can be more careful regarding weather and environmental conditions.',reportIssue:'Report an issue',demoAlert:'▶ View alert!!',safety:'A risk-alert tool for human review — not a diagnosis or disease prediction system.',liveDesk:'LIVE SITUATION DESK',dashboard:'Community risk dashboard',riskByArea:'Risk by service area',live:'LIVE',priorityAlert:'PRIORITY ALERT',whyAlert:'Why this alert?',riskScore:'Risk score',reports24:'24h reports',sinceYesterday:'+8 since yesterday',peopleAffected:'People affected',notVerified:'Reported, not verified cases',waterConcerns:'Water concerns',acrossAreas:'Across 3 service areas',areasReview:'Areas needing review',highCritical:'High or critical risk',communityReport:'COMMUNITY REPORT',shareSeeing:'Share what you’re seeing.',reportPrivacy:'Your report helps flag patterns early. Do not include names, phone numbers or exact home addresses.',privacyDesign:'Privacy by design',areaOnly:'We use area-level, aggregated reports only.',formTitle:'Report a health or water issue',step:'Step 1 of 1',serviceArea:'Service area',ward1:'Ward 1',ward2:'Ward 2',ward3:'Ward 3',symptoms:'Symptoms observed',selectAll:'select all that apply',diarrhea:'Diarrhea',vomiting:'Vomiting',stomachPain:'Stomach pain',fever:'Fever',waterCondition:'Water condition',noConcern:'No concern noticed',muddy:'Muddy / smelly water',flooding:'Flooding / leakage',anythingElse:'Anything else to share?',optional:'optional',notesPlaceholder:'Example: Water looks brown near the public tap.',submitReport:'Submit community report',responseCenter:'RESPONSE CENTER',clearSteps:'Clear next steps,',notGuesswork:'not guesswork.',recommendedActions:'Recommended actions are a checklist for health-worker verification and local public-health response.',footerHuman:'Built for earlier action, with human oversight.',footerPrivacy:'Prototype · No patient data collected',critical:'CRITICAL',high:'HIGH',watch:'WATCH',low:'LOW',investigate:'Investigation recommended now',keepWatch:'Keep this area under watch',noEscalation:'No immediate escalation needed',verifyNow:'Verify the signal and begin local response within 24 hours.',monitor:'Continue local monitoring and verify changes with field checks.',whyTitle:'What is driving the risk?',waterTest:'Send water-testing team',inspect:'Inspect pipelines and public tanks',boil:'Share boil-water advisory',ors:'Stock ORS at local clinic',investigation:'Start local investigation',submitted:'Report added securely for {area}. The risk desk has been updated.',chooseSymptom:'Select at least one symptom before submitting.',giReports:'GI-symptom reports',unsafeWater:'Unsafe-water concerns',rainHistory:'Rainfall & local history',updated:'Updated',demoData:'Ecological data',symptomReports:'symptom reports',people:'people',waterIssues:'water concerns',rain:'rain' },
  hi: { eyebrow:'सामुदायिक पूर्व-चेतावनी प्रणाली',heroTitle:'संकेत पहचानें।',heroEmphasis:'समुदाय की रक्षा करें।',heroCopy:'नीरसाथ लक्षणों, असुरक्षित पानी की शिकायतों और मौसम के संकेतों को जोड़ता है, ताकि स्वास्थ्यकर्मी जल्दी जाँच कर सकें।',reportIssue:'समस्या दर्ज करें',demoAlert:'▶ डेमो अलर्ट देखें',safety:'मानवीय समीक्षा के लिए जोखिम-अलर्ट टूल — यह निदान या रोग-पूर्वानुमान प्रणाली नहीं है।',liveDesk:'लाइव स्थिति डेस्क',dashboard:'सामुदायिक जोखिम डैशबोर्ड',riskByArea:'सेवा क्षेत्र के अनुसार जोखिम',live:'लाइव',priorityAlert:'प्राथमिकता अलर्ट',whyAlert:'यह अलर्ट क्यों?',riskScore:'जोखिम अंक',reports24:'२४ घंटे की रिपोर्ट',sinceYesterday:'कल से +८',peopleAffected:'प्रभावित लोग',notVerified:'रिपोर्ट किए गए, सत्यापित मामले नहीं',waterConcerns:'पानी संबंधी चिंताएँ',acrossAreas:'३ सेवा क्षेत्रों में',areasReview:'समीक्षा वाले क्षेत्र',highCritical:'उच्च या गंभीर जोखिम',communityReport:'सामुदायिक रिपोर्ट',shareSeeing:'जो आप देख रहे हैं, साझा करें।',reportPrivacy:'आपकी रिपोर्ट पैटर्न को जल्दी पहचानने में मदद करती है। नाम, फोन नंबर या घर का सटीक पता न दें।',privacyDesign:'डिज़ाइन में गोपनीयता',areaOnly:'हम केवल क्षेत्र-स्तरीय, समेकित रिपोर्ट का उपयोग करते हैं।',formTitle:'स्वास्थ्य या पानी की समस्या दर्ज करें',step:'चरण १ / १',serviceArea:'सेवा क्षेत्र',ward1:'वार्ड १',ward2:'वार्ड २',ward3:'वार्ड ३',symptoms:'देखे गए लक्षण',selectAll:'लागू होने वाले सभी चुनें',diarrhea:'दस्त',vomiting:'उल्टी',stomachPain:'पेट दर्द',fever:'बुखार',waterCondition:'पानी की स्थिति',noConcern:'कोई चिंता नहीं दिखी',muddy:'गंदा / बदबूदार पानी',flooding:'बाढ़ / रिसाव',anythingElse:'कुछ और साझा करना है?',optional:'वैकल्पिक',notesPlaceholder:'उदाहरण: सार्वजनिक नल के पास पानी भूरा दिखता है।',submitReport:'सामुदायिक रिपोर्ट भेजें',responseCenter:'प्रतिक्रिया केंद्र',clearSteps:'स्पष्ट अगले कदम,',notGuesswork:'अनुमान नहीं।',recommendedActions:'सुझाए गए कार्य स्वास्थ्यकर्मी सत्यापन और स्थानीय सार्वजनिक-स्वास्थ्य प्रतिक्रिया के लिए एक सूची हैं।',footerHuman:'मानवीय निगरानी के साथ पहले कार्रवाई के लिए बनाया गया।',footerPrivacy:'प्रोटोटाइप · रोगी डेटा एकत्र नहीं किया जाता',critical:'गंभीर',high:'उच्च',watch:'निगरानी',low:'कम',investigate:'अब जाँच की सलाह है',keepWatch:'इस क्षेत्र पर निगरानी रखें',noEscalation:'तुरंत बढ़ाने की जरूरत नहीं',verifyNow:'संकेत की पुष्टि करें और २४ घंटे में स्थानीय प्रतिक्रिया शुरू करें।',monitor:'स्थानीय निगरानी जारी रखें और फील्ड जाँच से बदलाव की पुष्टि करें।',whyTitle:'जोखिम का कारण क्या है?',waterTest:'जल-परीक्षण टीम भेजें',inspect:'पाइपलाइन और सार्वजनिक टैंक जाँचें',boil:'पानी उबालने की सलाह साझा करें',ors:'स्थानीय क्लिनिक में ORS रखें',investigation:'स्थानीय जाँच शुरू करें',submitted:'{area} के लिए रिपोर्ट सुरक्षित रूप से जोड़ दी गई। जोखिम डेस्क अपडेट हो गया है।',chooseSymptom:'जमा करने से पहले कम से कम एक लक्षण चुनें।',giReports:'पेट के लक्षणों की रिपोर्ट',unsafeWater:'असुरक्षित पानी की शिकायतें',rainHistory:'वर्षा और स्थानीय इतिहास',updated:'अपडेट',demoData:'डेमो डेटा',lowRain:'कम वर्षा',moderateRain:'मध्यम वर्षा',heavyRain:'भारी वर्षा',symptomReports:'लक्षण रिपोर्ट',people:'लोग',waterIssues:'पानी संबंधी शिकायतें',rain:'वर्षा',points:'अंक' }
};
const t = key => translations[currentLanguage][key] || translations.en[key] || key;
Object.assign(translations.en, { trendLabel:'7-DAY TREND',trendTitle:'Symptom reports by ward',mapLabel:'SERVICE COVERAGE',mapTitle:'Ward risk map',selected:'Selected',mon:'Mon',tue:'Tue',wed:'Wed',thu:'Thu',fri:'Fri',sat:'Sat',sun:'Sun',offlineReady:'Offline-ready · reports queue securely when needed',unverifiedReport:'Unverified community report',submitReport:'Continue to verification',verification:'REPORT VERIFICATION',verifyTitle:'Help us identify trusted reports.',verifyCopy:'Verified reports help health teams prioritize follow-up. NeerSath never asks you to type, store, or share your DigiLocker ID.',safeByDesign:'Safe by design',safeCopy:'A real connection uses official DigiLocker consent and returns only a verification status—not your ID or documents.',connectDemo:'Connect DigiLocker · demo',demoOnly:'Simulates a consent-based verified badge. No data is sent.',skipVerify:'Submit as an unverified community report',verifyNote:'A verification badge improves report triage; it does not make a report medically confirmed.',howItWorks:'How NeerSath works',quickGuide:'QUICK GUIDE',helpTitle:'Signals first. Human review always.',help1:'Report area-level symptoms or water concerns.',help2:'NeerSath combines transparent risk signals.',help3:'Health workers verify before any public response.',exportCsv:'Export CSV',savePdf:'Save PDF',verified:'Verified reporter',reportSaved:'Report saved for {area}. It is now visible to the risk desk.',csvReady:'CSV summary downloaded.' });
Object.assign(translations.hi, { trendLabel:'७-दिन का रुझान',trendTitle:'वार्ड के अनुसार लक्षण रिपोर्ट',mapLabel:'सेवा कवरेज',mapTitle:'वार्ड जोखिम मानचित्र',selected:'चयनित',mon:'सोम',tue:'मंगल',wed:'बुध',thu:'गुरु',fri:'शुक्र',sat:'शनि',sun:'रवि',offlineReady:'ऑफलाइन-तैयार · जरूरत पर रिपोर्ट सुरक्षित रूप से कतार में रहेगी',unverifiedReport:'असत्यापित सामुदायिक रिपोर्ट',submitReport:'सत्यापन के लिए आगे बढ़ें',verification:'रिपोर्ट सत्यापन',verifyTitle:'विश्वसनीय रिपोर्ट की पहचान में मदद करें।',verifyCopy:'सत्यापित रिपोर्ट स्वास्थ्य टीम को प्राथमिकता तय करने में मदद करती हैं। नीरसाथ कभी भी आपका डिजिलॉकर आईडी टाइप करने, स्टोर करने या साझा करने को नहीं कहता।',safeByDesign:'डिज़ाइन में सुरक्षित',safeCopy:'वास्तविक कनेक्शन में आधिकारिक डिजिलॉकर सहमति ली जाती है और केवल सत्यापन स्थिति मिलती है—आईडी या दस्तावेज़ नहीं।',connectDemo:'डिजिलॉकर कनेक्ट करें · डेमो',demoOnly:'सहमति आधारित सत्यापित बैज का प्रदर्शन। कोई डेटा नहीं भेजा जाता।',skipVerify:'असत्यापित सामुदायिक रिपोर्ट के रूप में भेजें',verifyNote:'सत्यापन बैज रिपोर्ट छँटाई में मदद करता है; यह रिपोर्ट को चिकित्सकीय रूप से पुष्ट नहीं करता।',howItWorks:'नीरसाथ कैसे काम करता है',quickGuide:'त्वरित मार्गदर्शिका',helpTitle:'पहले संकेत। हमेशा मानवीय समीक्षा।',help1:'क्षेत्र-स्तर के लक्षण या पानी संबंधी चिंताएँ दर्ज करें।',help2:'नीरसाथ पारदर्शी जोखिम संकेतों को जोड़ता है।',help3:'सार्वजनिक प्रतिक्रिया से पहले स्वास्थ्यकर्मी सत्यापन करते हैं।',exportCsv:'CSV निर्यात',savePdf:'PDF सहेजें',verified:'सत्यापित रिपोर्टर',reportSaved:'{area} की रिपोर्ट सहेज ली गई है। यह अब जोखिम डेस्क पर दिख रही है।',csvReady:'CSV सारांश डाउनलोड हो गया।' });
Object.assign(translations.en, { connectLive:'Official DigiLocker connection required',liveUnavailable:'Live verification is unavailable until an authorized DigiLocker integration is configured.',returnToReport:'Return to report form' });
Object.assign(translations.hi, { connectLive:'आधिकारिक डिजिलॉकर कनेक्शन आवश्यक है',liveUnavailable:'अधिकृत डिजिलॉकर एकीकरण कॉन्फ़िगर होने तक लाइव सत्यापन उपलब्ध नहीं है।',returnToReport:'रिपोर्ट फ़ॉर्म पर वापस जाएँ' });
Object.assign(translations.en, { connectDemo:'Demo verification',demoOnly:'Adds a demo badge only. No government identity or personal data is checked.',skipVerify:'Continue without verification',demoVerified:'Demo-verified report' });
Object.assign(translations.hi, { connectDemo:'डेमो सत्यापन',demoOnly:'केवल डेमो बैज जोड़ा जाता है। किसी सरकारी पहचान या व्यक्तिगत डेटा की जाँच नहीं होती।',skipVerify:'बिना सत्यापन जारी रखें',demoVerified:'डेमो-सत्यापित रिपोर्ट' });
Object.assign(translations.en, { navOverview:'Overview',navLiveDesk:'Live situation desk',navCommunityReport:'Community report issue',navResponseCenter:'Response center',languageHint:'Click to switch language' });
Object.assign(translations.hi, { navOverview:'अवलोकन',navLiveDesk:'लाइव स्थिति डेस्क',navCommunityReport:'सामुदायिक समस्या रिपोर्ट',navResponseCenter:'प्रतिक्रिया केंद्र',languageHint:'भाषा बदलने के लिए क्लिक करें' });
Object.assign(translations.hi, { demoAlert:'▶ अलर्ट देखें!!',demoData:'पारिस्थितिकीय डेटा' });
Object.assign(translations.en, { areaPincode:'Area pincode',pincodePlaceholder:'Example: 110001',invalidPincode:'Enter a valid 6-digit area pincode.',darkTheme:'Dark theme',lightTheme:'Light theme',themeHint:'Click to change theme' });
Object.assign(translations.hi, { areaPincode:'क्षेत्र का पिनकोड',pincodePlaceholder:'उदाहरण: ११०००१',invalidPincode:'कृपया मान्य ६ अंकों का क्षेत्र पिनकोड दर्ज करें।',darkTheme:'डार्क थीम',lightTheme:'लाइट थीम',themeHint:'थीम बदलने के लिए क्लिक करें' });
Object.assign(translations.en, { recentRainfall:'Recent rainfall',noRain:'No rain',lowRain:'Low rain',highRain:'High rain',heavyRain:'Heavy rain' });
Object.assign(translations.hi, { recentRainfall:'हाल की वर्षा',noRain:'वर्षा नहीं',lowRain:'कम वर्षा',highRain:'अधिक वर्षा',heavyRain:'भारी वर्षा' });
Object.assign(translations.en, { readAloud:'Read page aloud',stopReading:'Stop reading',voiceHint:'Reads this screen in English' });
Object.assign(translations.hi, { readAloud:'पेज सुनें',stopReading:'पढ़ना रोकें',voiceHint:'यह स्क्रीन हिंदी में सुनें' });
Object.assign(translations.en, { contactUs:'Contact us' });
Object.assign(translations.hi, { contactUs:'संपर्क करें' });
Object.assign(translations.en, {
  aiPlanTitle:'AI-assisted action plan',
  aiPlanCopy:'Updates as the area’s risk signals change. Health-worker review required.',
  actionMonitor:'Review new area reports in the next 24 hours',
  actionCheckSources:'Check shared taps, tanks and water sources',
  actionFieldVerify:'Ask a health worker to verify the local signal',
  actionPrepareTesting:'Prepare a water-testing visit',
  actionShareAdvice:'Share safe-water and handwashing guidance',
  actionNotifyClinic:'Notify the local clinic to prepare ORS supplies',
  actionPriorityInvestigation:'Start a local public-health investigation',
  actionBoilAdvisory:'Prepare a boil-water advisory after verification'
});
Object.assign(translations.hi, {
  aiPlanTitle:'AI-सहायता प्राप्त कार्य योजना',
  aiPlanCopy:'क्षेत्र के जोखिम संकेत बदलने पर यह अपडेट होती है। स्वास्थ्यकर्मी समीक्षा आवश्यक है।',
  actionMonitor:'अगले २४ घंटों में नई क्षेत्रीय रिपोर्ट देखें',
  actionCheckSources:'साझा नल, टैंक और पानी के स्रोत जाँचें',
  actionFieldVerify:'स्वास्थ्यकर्मी से स्थानीय संकेत की पुष्टि कराएँ',
  actionPrepareTesting:'जल-परीक्षण दौरे की तैयारी करें',
  actionShareAdvice:'सुरक्षित पानी और हाथ धोने की सलाह साझा करें',
  actionNotifyClinic:'ORS की तैयारी के लिए स्थानीय क्लिनिक को सूचित करें',
  actionPriorityInvestigation:'स्थानीय सार्वजनिक-स्वास्थ्य जाँच शुरू करें',
  actionBoilAdvisory:'सत्यापन के बाद पानी उबालने की सलाह तैयार करें'
});
Object.assign(translations.en, { responseWardSelectorTitle:'Change area', aiScoreNote:'AI-assisted score · transparent signals', aiAssisted:'AI-ASSISTED' });
Object.assign(translations.hi, { responseWardSelectorTitle:'क्षेत्र बदलें', aiScoreNote:'AI-सहायता प्राप्त स्कोर · पारदर्शी संकेत', aiAssisted:'AI-सहायता प्राप्त' });
Object.assign(translations.en, { signalFreshness:'Signal freshness', activeSignal:'Active signal', coolingSignal:'Cooling signal', quietHours:'No new reports for {hours}h', quietRisk:'Risk is reducing while no new danger signals are reported.' });
Object.assign(translations.hi, { signalFreshness:'संकेत की ताज़गी', activeSignal:'सक्रिय संकेत', coolingSignal:'कम होता संकेत', quietHours:'{hours} घंटे से नई रिपोर्ट नहीं', quietRisk:'नई खतरे की रिपोर्ट न आने पर जोखिम कम हो रहा है।' });
function getRecommendedActions(data, score) {
  const waterConcern = data.water > 0;
  const heavyRain = data.rain === 'Heavy';

  if (score >= 80) return [
    'actionPriorityInvestigation', 'waterTest', 'inspect',
    ...(waterConcern || heavyRain ? ['actionBoilAdvisory'] : ['actionShareAdvice']),
    'ors'
  ];
  if (score >= 60) return [
    'actionFieldVerify',
    ...(waterConcern ? ['waterTest', 'inspect'] : ['actionPrepareTesting']),
    'actionNotifyClinic', 'actionShareAdvice'
  ];
  if (score >= 30) return [
    'actionMonitor', 'actionFieldVerify',
    ...(waterConcern ? ['actionCheckSources'] : ['actionShareAdvice'])
  ];
  return [
    'actionMonitor', 'actionShareAdvice',
    ...(waterConcern ? ['actionCheckSources'] : [])
  ];
}
Object.assign(translations.en, { selectWard:'Select a ward' });
Object.assign(translations.hi, { selectWard:'वार्ड चुनें' });
Object.assign(translations.en, { state:'State', city:'City', addLocation:'Add a state/city for this demo', newState:'New state', newCity:'New city', addLocationButton:'Add location', selectWard:'Select a location', trendTitle:'Symptom reports by location', acrossAreas:'Across monitored locations' });
Object.assign(translations.hi, { state:'राज्य', city:'शहर', addLocation:'इस डेमो के लिए राज्य/शहर जोड़ें', newState:'नया राज्य', newCity:'नया शहर', addLocationButton:'स्थान जोड़ें', selectWard:'स्थान चुनें', trendTitle:'स्थान के अनुसार लक्षण रिपोर्ट', acrossAreas:'निगरानी वाले स्थानों में' });
let pendingReport = null;
let darkTheme = false;
let voiceReading = false;
const numberFormat = value => new Intl.NumberFormat(currentLanguage === 'hi' ? 'hi-IN-u-nu-deva' : 'en-IN').format(value);
const parseLocalizedNumber = value => Number(String(value).replace(/[०-९]/g, digit => '०१२३४५६७८९'.indexOf(digit)));
const locationKey = (state, city) => `${city}, ${state}`;
const areaName = name => name;
function locationCatalog() {
  return Object.values(areas).reduce((catalog, area) => {
    if (!catalog[area.state]) catalog[area.state] = [];
    if (!catalog[area.state].includes(area.city)) catalog[area.state].push(area.city);
    return catalog;
  }, Object.fromEntries(Object.entries(indiaLocations).map(([state, cities]) => [state, [...cities]])));
}
function renderLocationOptions(selectedState, selectedCity) {
  const catalog = locationCatalog();
  const state = selectedState || Object.keys(catalog)[0];
  const city = selectedCity || catalog[state][0];
  document.getElementById('state').innerHTML = Object.keys(catalog).map(name => `<option value="${name}">${name}</option>`).join('');
  document.getElementById('state').value = state;
  document.getElementById('city').innerHTML = catalog[state].map(name => `<option value="${name}">${name}</option>`).join('');
  document.getElementById('city').value = catalog[state].includes(city) ? city : catalog[state][0];
  const selected = areas[locationKey(document.getElementById('state').value, document.getElementById('city').value)];
  if (selected) document.getElementById('rainfall').value = selected.rain === 'Moderate' ? 'High' : selected.rain;
}
const rainName = rain => {
  const keys = { None:'noRain', Low:'lowRain', Moderate:'highRain', High:'highRain', Heavy:'heavyRain' };
  return t(keys[rain] || 'noRain');
};

function riskContributions(data) {
  const hoursQuiet = Math.max(0, (Date.now() - data.lastSignalAt) / hour);
  // Signals retain full strength for one day, then smoothly decay to 20% by day five.
  // This prevents old reports from keeping an area in a permanent alert state.
  const freshness = hoursQuiet <= 24 ? 1 : Math.max(.2, 1 - ((hoursQuiet - 24) / 120));
  const weatherFreshness = hoursQuiet <= 48 ? 1 : Math.max(0, 1 - ((hoursQuiet - 48) / 72));
  const rainfall = data.rain === 'Heavy' ? 10 : (data.rain === 'High' || data.rain === 'Moderate') ? 6 : data.rain === 'Low' ? 2 : 0;
  return {
    gi: Math.round(Math.min(35, data.reports * 2.05) * freshness),
    // More people affected means a stronger early-warning signal, capped at 25/100.
    people: Math.round(Math.min(25, data.people * 1.1) * freshness),
    water: Math.round(Math.min(20, data.water * 6) * freshness),
    rain: Math.round(rainfall * weatherFreshness),
    history: Math.min(10, data.history),
    freshness,
    hoursQuiet
  };
}
function calculateRisk(data) {
  const { gi, people, water, rain, history } = riskContributions(data);
  return Math.min(100, gi + people + water + rain + history);
}
function signalStatus(data) {
  const { hoursQuiet, freshness } = riskContributions(data);
  const roundedHours = Math.max(1, Math.floor(hoursQuiet));
  if (freshness >= .98) return { className: 'active', text: t('activeSignal') };
  return { className: 'cooling', text: `${t('coolingSignal')} · ${t('quietHours').replace('{hours}', numberFormat(roundedHours))}` };
}
function label(score) { return score >= 80 ? [t('critical'), 'critical'] : score >= 60 ? [t('high'), 'high'] : score >= 30 ? [t('watch'), 'watch'] : [t('low'), 'low']; }
function getData() { return areas[selectedArea]; }
function renderAreas() {
  document.getElementById('areaCards').innerHTML = Object.entries(areas).map(([name, data]) => {
    const score = calculateRisk(data), [risk, cls] = label(score);
    const activity = signalStatus(data);
    return `<button class="area-card ${name === selectedArea ? 'selected' : ''}" data-area="${name}" type="button"><div class="area-card-head"><span>${areaName(name)}</span><span class="risk-pill ${cls}">${risk}</span></div><div class="area-score numeric">${numberFormat(score)}</div><div class="area-meta"><span class="meta-pair"><b class="numeric">${numberFormat(data.reports)}</b> ${t('symptomReports')}</span><span class="meta-pair"><b class="numeric">${numberFormat(data.people)}</b> ${t('people')}</span><br><span class="meta-pair"><b class="numeric">${numberFormat(data.water)}</b> ${t('waterIssues')}</span><span class="meta-pair">${rainName(data.rain)}</span><small class="signal-status ${activity.className}">${activity.text}</small></div></button>`;
  }).join('');
  document.querySelectorAll('[data-area]').forEach(button => button.addEventListener('click', () => { selectedArea = button.dataset.area; render(); }));
}
function renderInsights() {
  const trends = { 'Patna, Bihar':[1,1,2,1,2,2,2], 'Mumbai, Maharashtra':[2,3,3,4,5,5,6], 'Kolkata, West Bengal':[4,6,7,9,11,14,17] };
  const values = trends[selectedArea] || [1,1,1,1,1,1,1];
  document.getElementById('chartMax').textContent = numberFormat(20);
  document.getElementById('chartMid').textContent = numberFormat(10);
  document.getElementById('chartZero').textContent = numberFormat(0);
  document.getElementById('trendWard').textContent = areaName(selectedArea);
  document.getElementById('trendChart').innerHTML = values.map((value, index) => `<span class="trend-bar ${index === values.length - 1 ? 'latest' : ''}" style="height:${Math.max(12, value / 20 * 100)}%"><b class="numeric">${numberFormat(value)}</b></span>`).join('');
  document.getElementById('wardSelector').innerHTML = Object.entries(areas).map(([name, data]) => { const [risk, cls] = label(calculateRisk(data)); return `<button type="button" class="ward-selector-button ${cls} ${name === selectedArea ? 'selected' : ''}" data-area="${name}"><span>${areaName(name)}</span><small>${risk}</small></button>`; }).join('');
  document.querySelectorAll('.ward-selector-button').forEach(button => button.addEventListener('click', () => { selectedArea = button.dataset.area; render(); }));
}
function renderSelected() {
  const data = getData(), score = calculateRisk(data), [risk, cls] = label(score);
  const high = score >= 60;
  document.querySelector('.response-card').className = `response-card ${cls}`;
  document.getElementById('alertPanel').style.background = score >= 80 ? '#d94b42' : score >= 60 ? '#dc7547' : score >= 30 ? '#c39b28' : '#25816d';
  document.getElementById('alertLevel').textContent = `${risk} · ${areaName(selectedArea).toUpperCase()}`;
  document.getElementById('alertTitle').textContent = high ? t('investigate') : score >= 30 ? t('keepWatch') : t('noEscalation');
  document.getElementById('alertText').textContent = currentLanguage === 'hi' ? `२४ घंटों में ${numberFormat(data.reports)} पेट के लक्षणों की रिपोर्ट और ${numberFormat(data.people)} प्रभावित लोग${data.rain === 'Heavy' ? ', भारी वर्षा के बाद' : ''}; साथ में ${numberFormat(data.water)} पानी संबंधी चिंताएँ।` : `${numberFormat(data.reports)} GI-symptom reports and ${numberFormat(data.people)} people affected in 24 hours${data.rain === 'Heavy' ? ', after heavy rain' : ''}; with ${numberFormat(data.water)} water-condition concerns.`;
  document.getElementById('alertScore').textContent = numberFormat(score);
  document.getElementById('scoreMax').textContent = `/${numberFormat(100)}`;
  document.getElementById('responseArea').textContent = areaName(selectedArea);
  document.getElementById('responseRisk').textContent = `${risk} ${currentLanguage === 'hi' ? 'जोखिम' : 'RISK'}`;
  document.getElementById('whyTitle').textContent = t('whyTitle');
  document.getElementById('explainable').textContent = t('aiAssisted');
  const activity = signalStatus(data);
  document.getElementById('explainCopy').textContent = currentLanguage === 'hi' ? `नीरसाथ का AI-सहायता प्राप्त प्रोटोटाइप पारदर्शी संकेतों को जोड़ता है। रिपोर्ट आने पर ०–१०० स्कोर बढ़ता है और शांत अवधि में कम होता है। ${activity.className === 'cooling' ? t('quietRisk') : ''} हर अलर्ट की व्यक्ति द्वारा समीक्षा जरूरी है।` : `NeerSath’s AI-assisted prototype combines transparent signals. The 0–100 score rises with new reports and reduces during quiet periods. ${activity.className === 'cooling' ? t('quietRisk') : ''} Every alert requires human review.`;
  document.getElementById('humanReview').textContent = currentLanguage === 'hi' ? '◎ सार्वजनिक कार्रवाई से पहले स्थानीय स्वास्थ्य रिकॉर्ड, फील्ड जाँच और पानी परीक्षण से हमेशा पुष्टि करें।' : '◎ Always verify with local health records, field checks and water testing before public action.';
  document.getElementById('responseDesc').textContent = high ? t('verifyNow') : t('monitor');
  document.getElementById('aiPlanTitle').textContent = t('aiPlanTitle');
  document.getElementById('aiPlanCopy').textContent = t('aiPlanCopy');
  const recommendedActions = getRecommendedActions(data, score);
  document.getElementById('actionList').innerHTML = recommendedActions.map((action, i) => `<div class="action"><b class="numeric">${numberFormat(i + 1)}</b>${t(action)}</div>`).join('');
  document.getElementById('responseWardSelectorTitle').textContent = t('responseWardSelectorTitle');
  document.getElementById('responseWardSelector').innerHTML = Object.entries(areas).map(([name, wardData]) => {
    const wardScore = calculateRisk(wardData), [wardRisk, wardClass] = label(wardScore);
    return `<button type="button" class="response-ward-button ${wardClass} ${name === selectedArea ? 'selected' : ''}" data-response-area="${name}"><span>${areaName(name)}</span><small>${numberFormat(wardScore)}/${numberFormat(100)} · ${wardRisk}</small></button>`;
  }).join('');
  document.querySelectorAll('[data-response-area]').forEach(button => button.addEventListener('click', () => { selectedArea = button.dataset.responseArea; render(); }));
  const contribution = riskContributions(data);
  const signals = [
    [t('giReports'), contribution.gi, 35],
    [t('peopleAffected'), contribution.people, 25],
    [t('unsafeWater'), contribution.water, 20],
    [t('rainHistory'), contribution.rain + contribution.history, 20],
    [t('signalFreshness'), Math.round(contribution.freshness * 100), 100]
  ];
  document.getElementById('signalBars').innerHTML = signals.map(([name, value, max], index) => `<div class="signal"><div class="signal-label"><span>${name}</span><span class="numeric">${index === 4 ? `${numberFormat(value)}%` : `${numberFormat(value)}/${numberFormat(max)} ${currentLanguage === 'hi' ? t('points') : 'points'}`}</span></div><div class="bar"><span style="width:${value / max * 100}%"></span></div></div>`).join('');
}
function renderTotals() {
  const values = Object.values(areas), reports = values.reduce((n, d) => n + d.reports, 0), people = values.reduce((n, d) => n + d.people, 0), water = values.reduce((n, d) => n + d.water, 0), review = values.filter(d => calculateRisk(d) >= 60).length;
  document.getElementById('totalReports').textContent = numberFormat(reports); document.getElementById('totalPeople').textContent = numberFormat(people); document.getElementById('waterConcerns').textContent = numberFormat(water); document.getElementById('areasReview').textContent = numberFormat(review);
}
function render() { renderAreas(); renderSelected(); renderTotals(); renderInsights(); document.getElementById('lastUpdated').textContent = `${t('updated')} ${new Date().toLocaleTimeString(currentLanguage === 'hi' ? 'hi-IN-u-nu-deva' : 'en-IN', {hour:'2-digit', minute:'2-digit'})} · ${t('demoData')}`; }
function applyLanguage() {
  document.documentElement.lang = currentLanguage === 'hi' ? 'hi' : 'en';
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  document.getElementById('languageLabel').textContent = currentLanguage === 'en' ? 'हिंदी में देखें' : 'View in English';
  document.getElementById('languageBtn').setAttribute('aria-label', currentLanguage === 'en' ? 'हिंदी में देखें' : 'View in English');
  document.querySelector('.language-icon').textContent = currentLanguage === 'en' ? 'अ' : 'A';
  document.getElementById('languageHint').textContent = t('languageHint');
  document.getElementById('themeLabel').textContent = darkTheme ? t('lightTheme') : t('darkTheme');
  document.getElementById('themeHint').textContent = t('themeHint');
  document.getElementById('voiceLabel').textContent = voiceReading ? t('stopReading') : t('readAloud');
  document.getElementById('voiceHint').textContent = t('voiceHint');
  const peopleInput = document.getElementById('people');
  peopleInput.value = numberFormat(parseLocalizedNumber(peopleInput.value) || 1);
  document.getElementById('verificationSummary').textContent = t('unverifiedReport');
  render();
}
function toast(message) { const el = document.getElementById('toast'); el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 4200); }
function normalizeDatabaseDigits(value) {
  return String(value || '').replace(/[०-९]/g, digit => '०१२३४५६७८९'.indexOf(digit));
}
async function loadSupabaseRiskInputs() {
  if (!supabaseClient) return false;
  const { data, error } = await supabaseClient.rpc('get_area_risk_inputs');
  if (error) { console.error('Could not load NeerSath dashboard data:', error.message); return false; }
  data.forEach(row => {
    areas[row.area_name] = {
      state: row.state || row.area_name.split(', ').slice(-1)[0],
      city: row.city || row.area_name.split(', ')[0],
      reports: Number(row.reports) || 0,
      people: Number(row.people) || 0,
      water: Number(row.water) || 0,
      rain: row.rain || 'None',
      history: Number(row.history) || 0,
      lastSignalAt: row.last_signal_at ? new Date(row.last_signal_at).getTime() : Date.now() - 7 * 24 * hour
    };
  });
  render();
  return true;
}
async function initialiseSupabase() {
  const config = window.NEERSATH_SUPABASE_CONFIG || {};
  if (!config.url || !config.publishableKey || !window.supabase?.createClient) return;
  try {
    supabaseClient = window.supabase.createClient(config.url, config.publishableKey, { auth: { persistSession: false } });
    usingSupabase = await loadSupabaseRiskInputs();
    if (usingSupabase) console.info('NeerSath connected to Supabase. Individual reports remain private.');
  } catch (error) {
    console.error('Could not initialise Supabase:', error);
    supabaseClient = null;
  }
}
async function persistReportToSupabase(report, verified) {
  if (!supabaseClient) return true;
  const { error } = await supabaseClient.from('community_reports').insert({
    area_name: report.area,
    state: report.state,
    city: report.city,
    people_affected: report.people,
    pincode: report.pincode ? normalizeDatabaseDigits(report.pincode) : null,
    symptoms: report.symptoms,
    water_condition: report.water,
    rainfall: report.rain,
    notes: report.notes || null,
    verification_status: verified ? 'demo_verified' : 'unverified'
  });
  if (!error) return true;
  console.error('Could not save NeerSath report:', error.message);
  toast(currentLanguage === 'hi' ? 'रिपोर्ट सहेजी नहीं जा सकी। कृपया फिर से प्रयास करें।' : 'Report could not be saved. Please try again.');
  return false;
}
async function savePendingReport(verified) {
  const report = pendingReport;
  if (!report || !(await persistReportToSupabase(report, verified))) return;
  const { area, people, water, rain } = report;
  areas[area].reports += 1; areas[area].people += people; if (water !== 'none') areas[area].water += 1;
  areas[area].rain = rain;
  areas[area].lastSignalAt = Date.now();
  selectedArea = area; pendingReport = null; document.getElementById('verifyDialog').close(); render(); document.getElementById('reportForm').reset(); renderLocationOptions(areas[area].state, areas[area].city); document.getElementById('people').value = numberFormat(1); document.querySelector('input[value="Diarrhea"]').checked = true;
  document.getElementById('verificationSummary').textContent = verified ? `✓ ${t('demoVerified')}` : t('unverifiedReport');
  toast(t('reportSaved').replace('{area}', areaName(area)));
  if (usingSupabase) await loadSupabaseRiskInputs();
  document.getElementById('overview').scrollIntoView({ behavior: 'smooth' });
}
document.getElementById('reportForm').addEventListener('submit', event => {
  event.preventDefault();
  const state = document.getElementById('state').value, city = document.getElementById('city').value, area = locationKey(state, city), people = parseLocalizedNumber(document.getElementById('people').value), pincode = document.getElementById('pincode').value.trim(), rain = document.getElementById('rainfall').value, water = document.querySelector('input[name="water"]:checked').value;
  if (!areas[area]) areas[area] = { state, city, reports:0, people:0, water:0, rain:'None', history:0, lastSignalAt:Date.now() - 7 * 24 * hour };
  const symptoms = [...document.querySelectorAll('input[type="checkbox"]:checked')];
  if (!symptoms.length) return toast(t('chooseSymptom'));
  if (!Number.isInteger(people) || people < 1 || people > 1000000) return toast(currentLanguage === 'hi' ? 'कृपया १ से १०,००,००० तक की संख्या दर्ज करें।' : 'Please enter a whole number from 1 to 1,000,000.');
  if (pincode && !/^[0-9०-९]{6}$/.test(pincode)) return toast(t('invalidPincode'));
  pendingReport = { area, state, city, people, pincode, water, rain, symptoms: symptoms.map(input => input.value), notes: document.getElementById('notes').value.trim() };
  document.getElementById('verifyDialog').showModal();
});
document.getElementById('whyBtn').addEventListener('click', () => document.getElementById('explainPanel').scrollIntoView({ behavior: 'smooth', block: 'center' }));
document.getElementById('demoBtn').addEventListener('click', () => { selectedArea = 'Kolkata, West Bengal'; render(); document.querySelector('.dashboard-section').scrollIntoView({ behavior: 'smooth' }); });
document.getElementById('languageBtn').addEventListener('click', () => { currentLanguage = currentLanguage === 'en' ? 'hi' : 'en'; applyLanguage(); });
document.getElementById('state').addEventListener('change', event => renderLocationOptions(event.target.value));
document.getElementById('city').addEventListener('change', () => {
  const area = areas[locationKey(document.getElementById('state').value, document.getElementById('city').value)];
  if (area) document.getElementById('rainfall').value = area.rain === 'Moderate' ? 'High' : area.rain;
});
document.getElementById('addLocationButton').addEventListener('click', () => {
  const state = document.getElementById('newState').value.trim(), city = document.getElementById('newCity').value.trim();
  if (!state || !city) return toast(currentLanguage === 'hi' ? 'कृपया राज्य और शहर दोनों दर्ज करें।' : 'Enter both a state and city.');
  const key = locationKey(state, city);
  if (!areas[key]) areas[key] = { state, city, reports:0, people:0, water:0, rain:'None', history:0, lastSignalAt:Date.now() - 7 * 24 * hour };
  renderLocationOptions(state, city); document.getElementById('newState').value = ''; document.getElementById('newCity').value = ''; render();
});
document.getElementById('demoVerify').addEventListener('click', () => savePendingReport(true));
document.getElementById('skipVerify').addEventListener('click', () => savePendingReport(false));
document.getElementById('closeVerify').addEventListener('click', () => document.getElementById('verifyDialog').close());
document.getElementById('helpToggle').addEventListener('click', () => document.getElementById('helpDrawer').classList.add('open'));
document.getElementById('helpClose').addEventListener('click', () => document.getElementById('helpDrawer').classList.remove('open'));
document.getElementById('exportCsv').addEventListener('click', () => { const rows = [['Ward','Risk score','Reports','People affected','Water concerns'], ...Object.entries(areas).map(([name, data]) => [name, calculateRisk(data), data.reports, data.people, data.water])]; const blob = new Blob([rows.map(row => row.join(',')).join('\n')], {type:'text/csv'}); const link = Object.assign(document.createElement('a'), {href:URL.createObjectURL(blob),download:'neersath-risk-summary.csv'}); link.click(); URL.revokeObjectURL(link.href); toast(t('csvReady')); });
document.getElementById('printSummary').addEventListener('click', () => window.print());
document.getElementById('themeButton').addEventListener('click', () => { darkTheme = !darkTheme; document.body.classList.toggle('dark-theme', darkTheme); document.getElementById('themeButton').setAttribute('aria-pressed', String(darkTheme)); document.getElementById('themeIcon').textContent = darkTheme ? '☀' : '◐'; document.getElementById('themeLabel').textContent = darkTheme ? t('lightTheme') : t('darkTheme'); });
function getReadableScreen() {
  const loginVisible = document.body.classList.contains('login-open');
  if (loginVisible) {
    const otpVisible = !document.getElementById('otpForm').classList.contains('hidden');
    if (currentLanguage === 'hi') return otpVisible ? `नीरसाथ मोबाइल सत्यापन। ${document.getElementById('loginCopy').textContent}। ${document.getElementById('otpDestination').textContent}। छह अंकों का एक बार उपयोग होने वाला पासवर्ड दर्ज करें। इस स्थानीय प्रोटोटाइप का डेमो ओटीपी है: १ २ ३ ४ ५ ६।` : 'नीरसाथ में आपका स्वागत है। अपना दस अंकों का मोबाइल नंबर दर्ज करें। आगे बढ़ने के लिए ओटीपी भेजें चुनें। यह स्थानीय प्रोटोटाइप है, इसलिए कोई वास्तविक एसएमएस नहीं भेजा जाएगा।';
    return otpVisible ? `NeerSath mobile verification. ${document.getElementById('loginCopy').textContent}. ${document.getElementById('otpDestination').textContent}. Enter the six digit one-time password. This local prototype uses the demonstration OTP: 1 2 3 4 5 6.` : 'Welcome to NeerSath. Enter your ten digit mobile number. Select Send OTP to continue. This is a local prototype and no real SMS will be sent.';
  }
  const target = ['live-desk','report','response'].map(id => document.getElementById(id)).find(section => { const rect = section.getBoundingClientRect(); return rect.top <= window.innerHeight * .45 && rect.bottom >= window.innerHeight * .25; }) || document.getElementById('overview');
  if (target.id === 'live-desk') { const data = getData(), score = calculateRisk(data); return currentLanguage === 'hi' ? `लाइव स्थिति डेस्क। सामुदायिक जोखिम डैशबोर्ड। ${areaName(selectedArea)} का जोखिम अंक ${numberFormat(score)} में से ${numberFormat(100)} है। लक्षण रिपोर्ट: ${numberFormat(data.reports)}। प्रभावित लोग: ${numberFormat(data.people)}। पानी संबंधी चिंताएँ: ${numberFormat(data.water)}। वर्षा: ${rainName(data.rain)}। कुल रिपोर्ट: ${document.getElementById('totalReports').textContent}। कुल प्रभावित लोग: ${document.getElementById('totalPeople').textContent}। पानी संबंधी चिंताएँ: ${document.getElementById('waterConcerns').textContent}। समीक्षा वाले क्षेत्र: ${document.getElementById('areasReview').textContent}।` : `Live situation desk. Community risk dashboard. ${areaName(selectedArea)} has ${numberFormat(score)} out of ${numberFormat(100)} risk score, ${numberFormat(data.reports)} symptom reports, ${numberFormat(data.people)} people affected, ${numberFormat(data.water)} water concerns, and ${rainName(data.rain)} rainfall. Total reports: ${document.getElementById('totalReports').textContent}. Total people affected: ${document.getElementById('totalPeople').textContent}. Water concerns: ${document.getElementById('waterConcerns').textContent}. Areas requiring review: ${document.getElementById('areasReview').textContent}.`; }
  if (target.id === 'report') return currentLanguage === 'hi' ? `सामुदायिक समस्या रिपोर्ट। ${document.querySelector('.report-intro h2').textContent}। ${document.querySelector('.report-intro > p:not(.eyebrow)').textContent}। सेवा क्षेत्र चुनें, प्रभावित लोगों की संख्या दर्ज करें, वैकल्पिक क्षेत्र पिनकोड जोड़ें, लक्षण और पानी की स्थिति चुनें, फिर सत्यापन के लिए आगे बढ़ें।` : `Community report issue. ${document.querySelector('.report-intro h2').textContent}. ${document.querySelector('.report-intro > p:not(.eyebrow)').textContent}. Use the form to choose a service area, enter people affected, add an optional area pincode, choose symptoms and water conditions, then continue to verification.`;
  if (target.id === 'response') return currentLanguage === 'hi' ? `प्रतिक्रिया केंद्र। ${document.querySelector('.response-heading h2').textContent}। ${document.getElementById('responseArea').textContent} के लिए ${document.getElementById('responseRisk').textContent}। ${document.getElementById('responseDesc').textContent}। सुझाए गए कार्य: ${[...document.querySelectorAll('.action')].map(action => action.textContent).join('। ')}। ${document.getElementById('humanReview').textContent}` : `Response center. ${document.querySelector('.response-heading h2').textContent}. ${document.getElementById('responseRisk').textContent} for ${document.getElementById('responseArea').textContent}. ${document.getElementById('responseDesc').textContent}. Recommended actions: ${[...document.querySelectorAll('.action')].map(action => action.textContent).join('. ')}. ${document.getElementById('humanReview').textContent}`;
  return currentLanguage === 'hi' ? `नीरसाथ अवलोकन। ${document.querySelector('.hero h1').textContent}। ${document.querySelector('.hero-copy').textContent}। यह मानवीय समीक्षा के लिए जोखिम-अलर्ट टूल है, निदान या रोग-पूर्वानुमान प्रणाली नहीं है।` : `NeerSath overview. ${document.querySelector('.hero h1').textContent}. ${document.querySelector('.hero-copy').textContent}. This is a risk alert tool for human review, not a diagnosis or disease prediction system.`;
}
function stopVoice() { window.speechSynthesis?.cancel(); voiceReading = false; document.getElementById('voiceButton').setAttribute('aria-pressed','false'); document.getElementById('voiceLabel').textContent = t('readAloud'); document.getElementById('voiceStop').hidden = true; document.getElementById('voiceStatus').textContent = currentLanguage === 'hi' ? 'पढ़ना रोक दिया गया।' : 'Reading stopped.'; }
document.getElementById('voiceButton').addEventListener('click', () => {
  if (!('speechSynthesis' in window)) { document.getElementById('voiceStatus').textContent = 'Voice reading is not supported in this browser.'; return; }
  if (voiceReading) { stopVoice(); return; }
  const utterance = new SpeechSynthesisUtterance(getReadableScreen()); utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN'; utterance.rate = .92; utterance.pitch = 1;
  utterance.onend = stopVoice; utterance.onerror = stopVoice; voiceReading = true; document.getElementById('voiceButton').setAttribute('aria-pressed','true'); document.getElementById('voiceLabel').textContent = t('stopReading'); document.getElementById('voiceStop').hidden = false; document.getElementById('voiceStatus').textContent = currentLanguage === 'hi' ? 'यह स्क्रीन हिंदी में पढ़ी जा रही है।' : 'Reading this screen aloud in English.'; window.speechSynthesis.cancel(); window.speechSynthesis.speak(utterance);
});
document.getElementById('voiceStop').addEventListener('click', stopVoice);
const navLinks = [...document.querySelectorAll('.topbar nav a[data-section]')];
const updateActiveNav = id => {
  navLinks.forEach(link => link.classList.toggle('active', link.dataset.section === id));
  const helpDrawer = document.getElementById('helpDrawer');
  helpDrawer.classList.toggle('overview-only', id !== 'overview');
  if (id !== 'overview') helpDrawer.classList.remove('open');
};
const navObserver = new IntersectionObserver(entries => { const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0]; if (visible) updateActiveNav(visible.target.id); }, {rootMargin:'-30% 0px -55% 0px',threshold:[.05,.2,.4]});
['overview','live-desk','report','response'].forEach(id => navObserver.observe(document.getElementById(id)));
const identityForm = document.getElementById('identityForm');
const otpForm = document.getElementById('otpForm');
const mobileField = document.getElementById('loginMobile');
identityForm.addEventListener('submit', event => {
  event.preventDefault();
  const mobile = mobileField.value.replace(/\D/g, '');
  if (!/^\d{10}$/.test(mobile)) { mobileField.setCustomValidity('Enter a valid 10-digit mobile number.'); mobileField.reportValidity(); return; }
  mobileField.setCustomValidity('');
  document.getElementById('otpDestination').textContent = `OTP sent to +91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`;
  document.getElementById('loginStepLabel').textContent = 'MOBILE VERIFICATION';
  document.getElementById('loginTitle').textContent = 'Enter your OTP';
  document.getElementById('loginCopy').textContent = 'Enter the 6-digit code sent to your mobile number.';
  identityForm.classList.add('hidden'); otpForm.classList.remove('hidden'); document.getElementById('otpInput').focus();
});
otpForm.addEventListener('submit', event => {
  event.preventDefault();
  const otp = document.getElementById('otpInput').value.trim();
  const error = document.getElementById('otpError');
  if (otp !== '123456') { error.textContent = 'Incorrect OTP. Please try again.'; return; }
  document.body.classList.remove('login-open'); document.getElementById('loginScreen').remove(); history.replaceState(null, '', '#overview'); window.scrollTo(0, 0); updateActiveNav('overview');
});
document.getElementById('backLogin').addEventListener('click', () => { otpForm.classList.add('hidden'); identityForm.classList.remove('hidden'); document.getElementById('loginStepLabel').textContent = 'SECURE SIGN IN'; document.getElementById('loginTitle').textContent = 'Welcome to NeerSath'; document.getElementById('loginCopy').textContent = 'Enter your mobile number to access the community water-safety desk.'; mobileField.focus(); });
applyLanguage();
renderLocationOptions('West Bengal', 'Kolkata');
initialiseSupabase();
// Re-check aggregate database data and let quiet signals cool down while the dashboard stays open.
setInterval(() => { render(); if (usingSupabase) loadSupabaseRiskInputs(); }, 60 * 1000);

// Every full page load starts at the Overview landing section.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('load', () => {
  history.replaceState(null, '', '#overview');
  window.scrollTo(0, 0);
  updateActiveNav('overview');
});
