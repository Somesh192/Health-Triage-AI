'use client';

import { useState, useRef, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  suggest_prescription?: boolean;
}

interface PrescriptionData {
  rx_id: string;
  date: string;
  phc_name: string;
  patient_name: string;
  age_gender: string;
  symptoms_summary: string;
  clinical_assessment: string;
  medicines: Array<{
    name: string;
    type: string;
    dosage: string;
    frequency: string;
    timing: string;
    duration: string;
    instructions: string;
    precautions: string;
  }>;
  home_care_and_diet: string[];
  precautions_and_warnings: string[];
  when_to_see_doctor: string;
  disclaimer: string;
  formatted_slip_text: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧', speechLang: 'en-IN' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳', speechLang: 'hi-IN' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', speechLang: 'hi-IN' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳', speechLang: 'bn-IN' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', speechLang: 'te-IN' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', speechLang: 'ta-IN' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳', speechLang: 'kn-IN' },
];

const QUICK_PROMPTS: Record<string, string[]> = {
  en: [
    'I have fever (101°F) and body pain since 2 days, what should I do?',
    'What safe medicine or home remedy can I take for acidity and gas?',
    'Severe headache and blocked nose relief tips',
    'When should I visit the doctor for continuous cough?'
  ],
  or: [
    'ମୋତେ ଦୁଇ ଦିନ ହେଲା ଜ୍ୱର (101°F) ଓ ଦେହ ହାତ ବିନ୍ଧା ହେଉଛି, କଣ କରିବି?',
    'ଗ୍ୟାସ ଓ ପେଟ ଜଳାପୋଡ଼ା ପାଇଁ କେଉଁ ସୁରକ୍ଷିତ ଔଷଧ ନେଇପାରିବି?',
    'ମୁଣ୍ଡ ବିନ୍ଧା ଓ ଥଣ୍ଡା କାଶ ପାଇଁ ଘରୋଇ ଉପଚାର କୁହନ୍ତୁ।',
    'ତରଳ ଝାଡ଼ା ଓ ଦୁର୍ବଳତା ପାଇଁ ORS କିପରି ପିଇବି?'
  ],
  hi: [
    'मुझे 2 दिन से बुखार (101°F) और शरीर में दर्द है, क्या करना चाहिए?',
    'एसिडिटी और गैस की समस्या में कौन सी दवा या घरेलू उपाय सुरक्षित है?',
    'तेज सिरदर्द और जुकाम से तुरंत राहत के लिए क्या करें?',
    'खांसी और गले में खराश के लिए प्राथमिक उपचार बताएं।'
  ],
  bn: [
    'আমার ২ দিন ধরে জ্বর ও শরীরে প্রচণ্ড ব্যথা, কী ওষুধ বা পরামর্শ দেবেন?',
    'গ্যাস ও বুক জ্বালাপোড়ার জন্য নিরাপদ প্রতিকার কী?',
    'সর্দি, কাশি ও মাথা ব্যথার ঘরোয়া চিকিৎসা কী?',
    'দুর্বলতা এবং ডিহাইড্রেশনের জন্য ORS কীভাবে নেব?'
  ],
  te: [
    'నాకు 2 రోజులుగా జ్వరం మరియు ఒంటి నొప్పులు ఉన్నాయి, ఏం చేయాలి?',
    'ఎసిడిటీ మరియు గ్యాస్ సమస్యకు సురక్షితమైన మందు లేదా నివారణ ఏమిటి?',
    'తీవ్రమైన తలనొప్పి మరియు జలుబు నుండి ఉపశమనం కోసం చిట్కాలు',
    'దగ్గు మరియు గొంతు నొప్పికి ప్రాథమిక చికిత్స ఏమిటి?'
  ],
  ta: [
    'எனக்கு 2 நாட்களாக காய்ச்சல் மற்றும் உடல் வலி உள்ளது, நான் என்ன செய்ய வேண்டும்?',
    'அசிடிட்டி மற்றும் நெஞ்செரிச்சலுக்கு என்ன பாதுகாப்பான மருந்து உட்கொள்ளலாம்?',
    'கடுமையான தலைவலி மற்றும் சளிக்கு வீட்டு வைத்தியம்',
    'இருமல் மற்றும் தொண்டை வலிக்கு என்ன முதலுதவி செய்யலாம்?'
  ],
  kn: [
    'ನನಗೆ 2 ದಿನಗಳಿಂದ ಜ್ವರ ಮತ್ತು ಮೈಕೈ ನೋವು ಇದೆ, ನಾನು ಏನು ಮಾಡಬೇಕು?',
    'ಅಸಿಡಿಟಿ ಮತ್ತು ಗ್ಯಾಸ್ ಸಮಸ್ಯೆಗೆ ಸುರಕ್ಷಿತ ಔಷಧಿ ಅಥವಾ ಮನೆಮದ್ದು ಯಾವುದು?',
    'ತೀವ್ರ ತಲೆನೋವು ಮತ್ತು ಶೀತಕ್ಕೆ ತಕ್ಷಣದ ಪರಿಹಾರವೇನು?',
    'ಕೆಮ್ಮು ಮತ್ತು ಗಂಟಲು ನೋವಿಗೆ ಪ್ರಾಥಮಿಕ ಚಿಕಿತ್ಸೆ ತಿಳಿಸಿ.'
  ],
};

const WELCOME_MESSAGES: Record<string, string> = {
  en: "Hello! I am your AI Health Doctor at the Primary Health Center. How are you feeling today? You can speak using the microphone 🎤 or type your health symptoms.",
  or: "ନମସ୍କାର! ମୁଁ ପ୍ରାଥମିକ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ରର AI ଡାକ୍ତର ସହାୟକ। ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ କିପରି ଅଛି? ଆପଣ ମାଇକ୍ରୋଫୋନ୍ 🎤 ଦବାଇ କଥା ହୋଇପାରିବେ କିମ୍ବା ଲେଖିପାରିବେ।",
  hi: "नमस्ते! मैं प्राथमिक स्वास्थ्य केंद्र का AI डॉक्टर सहायक हूँ। आज आप कैसा महसूस कर रहे हैं? आप माइक 🎤 दबाकर बोल सकते हैं या अपनी परेशानी लिखकर बता सकते हैं।",
  bn: "নমস্কার! আমি প্রাথমিক স্বাস্থ্য কেন্দ্রের AI ডাক্তার সহায়ক। আজ আপনার কেমন লাগছে? আপনি মাইক 🎤 চেপে কথা বলতে পারেন বা লিখে লক্ষণ জানাতে পারেন।",
  te: "నమస్కారం! నేను ప్రాథమిక ఆరోగ్య కేంద్రం AI డాక్టర్ సహాయకుడిని. ఈరోజు మీ ఆరోగ్యం ఎలా ఉంది? మీరు మైక్ 🎤 నొక్కి మాట్లాడవచ్చు లేదా టైప్ చేయవచ్చు.",
  ta: "வணக்கம்! நான் ஆரம்ப சுகாதார நிலையத்தின் AI மருத்துவர் உதவியாளர். இன்று உங்கள் உடல்நிலை எப்படி உள்ளது? நீங்கள் மைக் 🎤 அழுத்தி பேசலாம் அல்லது எழுதலாம்.",
  kn: "ನಮಸ್ಕಾರ! ನಾನು ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರದ AI ವೈದ್ಯ ಸಹಾಯಕ. ಇಂದು ನಿಮ್ಮ ಆರೋಗ್ಯ ಹೇಗಿದೆ? ನೀವು ಮೈಕ್ 🎤 ಒತ್ತಿ ಮಾತನಾಡಬಹುದು ಅಥವಾ ಟೈಪ್ ಮಾಡಬಹುದು."
};

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoVoice, setAutoVoice] = useState(true);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);

  // Patient Context for Prescriptions & AI Consultation
  const [showPatientDrawer, setShowPatientDrawer] = useState(false);
  const [patientName, setPatientName] = useState('Patient');
  const [patientAge, setPatientAge] = useState('28');
  const [patientGender, setPatientGender] = useState('Male');
  const [patientVitals, setPatientVitals] = useState('Temp: 100.8°F, BP: 120/80');

  // Prescription Modal State
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [generatingRx, setGeneratingRx] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle Initial Greeting when language changes and no messages exist
  useEffect(() => {
    if (messages.length === 0) {
      const welcome = WELCOME_MESSAGES[selectedLanguage] || WELCOME_MESSAGES.en;
      setMessages([
        {
          role: 'assistant',
          content: welcome,
          timestamp: new Date().toISOString(),
        }
      ]);
      if (autoVoice && typeof window !== 'undefined') {
        setTimeout(() => speak(welcome), 400);
      }
    }
  }, [selectedLanguage]);

  // Clean voice synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text-to-Speech function
  const speak = (text: string, msgIndex?: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    if (isSpeaking && speakingMessageIndex === msgIndex) {
      setIsSpeaking(false);
      setSpeakingMessageIndex(null);
      return;
    }

    const cleanText = text.replace(/[*#_`⚠️🏥💡🔍🩺]/g, ' ').replace(/\n+/g, '. ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Choose speech lang
    const currentLangObj = LANGUAGES.find(l => l.code === selectedLanguage);
    utterance.lang = currentLangObj ? currentLangObj.speechLang : 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Pick appropriate voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => 
      v.lang.startsWith(selectedLanguage) || 
      (selectedLanguage === 'hi' && v.lang.includes('hi')) ||
      (selectedLanguage === 'bn' && v.lang.includes('bn')) ||
      (selectedLanguage === 'ta' && v.lang.includes('ta')) ||
      (selectedLanguage === 'te' && v.lang.includes('te')) ||
      (selectedLanguage === 'kn' && v.lang.includes('kn')) ||
      (v.lang.includes('en-IN') && selectedLanguage === 'en')
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (msgIndex !== undefined) setSpeakingMessageIndex(msgIndex);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageIndex(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMessageIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMessageIndex(null);
    }
  };

  // Speech-to-Text Recognition
  const startRecording = () => {
    if (typeof window === 'undefined') return;

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Stop speaking if AI was talking
    stopSpeaking();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    const currentLangObj = LANGUAGES.find(l => l.code === selectedLanguage);
    recognition.lang = currentLangObj ? currentLangObj.speechLang : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
      setError('');
    };

    recognition.onresult = (event: any) => {
      let liveText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        liveText += event.results[i][0].transcript;
      }
      setInput(liveText);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (e: any) => {
      setIsRecording(false);
      if (e.error !== 'no-speech') {
        setError(`Microphone error: ${e.error || 'Could not recognize speech'}. Please type your query.`);
      }
    };

    try {
      recognition.start();
    } catch (err) {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    stopSpeaking();
    // Greet in the newly chosen language
    const welcome = WELCOME_MESSAGES[langCode] || WELCOME_MESSAGES.en;
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: welcome,
        timestamp: new Date().toISOString(),
      }
    ]);
    if (autoVoice) {
      setTimeout(() => speak(welcome), 300);
    }
  };

  const handleSubmit = async (overrideText?: string) => {
    const textToSend = (overrideText || input).trim();
    if (!textToSend || loading) return;

    stopSpeaking();

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.aiChat({
        message: textToSend,
        conversation_history: messages.map(m => ({ role: m.role, content: m.content })),
        patient_context: {
          language: selectedLanguage,
          name: patientName,
          age: patientAge,
          gender: patientGender,
          vitals: patientVitals,
          symptoms: textToSend,
        },
      });

      const aiText = response.response;
      const isRxSuggested = response.prescription_suggestion;

      const aiMessage: Message = {
        role: 'assistant',
        content: aiText,
        timestamp: new Date().toISOString(),
        suggest_prescription: isRxSuggested,
      };

      setMessages(prev => [...prev, aiMessage]);

      // Auto-Speak AI response if enabled
      if (autoVoice && aiText) {
        setTimeout(() => speak(aiText, newHistory.length), 200);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError('Unable to reach AI assistant. Please verify your connection or try again.');
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, I encountered a temporary connection issue. Please try again.',
          timestamp: new Date().toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Generate Digital Medical Prescription
  const handleGeneratePrescription = async (symptomsHint?: string) => {
    setGeneratingRx(true);
    setError('');
    try {
      // Gather latest symptoms from user messages
      const userMsgs = messages.filter(m => m.role === 'user').map(m => m.content);
      const combinedSymptoms = symptomsHint || userMsgs.join('; ') || 'General symptom consultation';

      const rx = await apiClient.generatePrescription({
        patient_name: patientName || 'Patient',
        age: patientAge || 'Adult',
        gender: patientGender || 'Unspecified',
        symptoms: combinedSymptoms,
        vitals: { note: patientVitals },
        language: selectedLanguage,
        conversation_history: messages.map(m => ({ role: m.role, content: m.content })),
      });

      setPrescriptionData(rx);
      setShowPrescriptionModal(true);
    } catch (err) {
      console.error('Prescription generation failed:', err);
      setError('Could not generate prescription slip. Please try again.');
    } finally {
      setGeneratingRx(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const activeLangObj = LANGUAGES.find(l => l.code === selectedLanguage) || LANGUAGES[0];
  const quickPromptsList = QUICK_PROMPTS[selectedLanguage] || QUICK_PROMPTS.en;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Doctor Status */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20">
                👨‍⚕️
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  PHC Health AI Doctor
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Gemini 2.5 Live
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Multilingual Voice & Consultation • 7 Indian Languages • Digital Rx
              </p>
            </div>
          </div>

          {/* Actions & Toggles */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            {/* Auto-voice switch */}
            <button
              onClick={() => {
                const next = !autoVoice;
                setAutoVoice(next);
                if (!next) stopSpeaking();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                autoVoice
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle automatic voice speech for AI replies"
            >
              <span>{autoVoice ? '🔊 Voice ON' : '🔇 Voice Muted'}</span>
            </button>

            {/* Patient Context Drawer Trigger */}
            <button
              onClick={() => setShowPatientDrawer(!showPatientDrawer)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-200 transition-all"
            >
              <span>👤 {patientName} ({patientAge}y)</span>
              <span className="text-[10px] text-emerald-400">✏️</span>
            </button>

            {/* Quick Prescription Button */}
            <button
              onClick={() => handleGeneratePrescription()}
              disabled={generatingRx}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-md shadow-emerald-900/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <span>{generatingRx ? '⏳ Generating...' : '📋 Create Rx Slip'}</span>
            </button>
          </div>
        </div>

        {/* 7 Indian Languages Bar */}
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap pl-1 pr-1 flex items-center gap-1">
            <span>🌐 Mother Tongue:</span>
          </span>
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/30 ring-2 ring-emerald-400/40 scale-105'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.native}</span>
                <span className="text-[10px] opacity-70">({lang.name})</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Chat Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-between gap-4">
        {/* Patient Details Drawer / Mini-Bar */}
        {showPatientDrawer && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                <span>📝 Patient Consultation Details (For Rx Slip)</span>
              </h3>
              <button
                onClick={() => setShowPatientDrawer(false)}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-800 rounded-md"
              >
                Close ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Age</label>
                <input
                  type="text"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Gender</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Child">Child</option>
                  <option value="Elderly">Elderly</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Vitals (Temp / BP)</label>
                <input
                  type="text"
                  value={patientVitals}
                  onChange={(e) => setPatientVitals(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Message Container */}
        <div className="flex-1 bg-slate-900/50 border border-slate-800/80 rounded-3xl p-4 sm:p-6 overflow-y-auto space-y-4 min-h-[420px] max-h-[calc(100vh-320px)] shadow-inner">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isThisSpeaking = isSpeaking && speakingMessageIndex === index;

            return (
              <div
                key={index}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-150`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 shadow-md transition-all ${
                    isUser
                      ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-tr-none'
                      : 'bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-tl-none'
                  }`}
                >
                  {/* Message Header */}
                  <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-white/10 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <span>{isUser ? '👤 You' : '👨‍⚕️ Health AI Doctor'}</span>
                      <span className="text-[10px] opacity-60 font-normal">
                        {msg.timestamp
                          ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </span>
                    </div>

                    {!isUser && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => (isThisSpeaking ? stopSpeaking() : speak(msg.content, index))}
                          className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all ${
                            isThisSpeaking
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                              : 'bg-slate-700/60 hover:bg-slate-700 text-slate-300'
                          }`}
                          title={isThisSpeaking ? 'Stop voice' : 'Listen to voice in your language'}
                        >
                          {isThisSpeaking ? (
                            <>
                              <span>⏹️ Stop</span>
                              <span className="inline-flex gap-0.5">
                                <span className="w-1 h-3 bg-rose-400 animate-bounce" />
                                <span className="w-1 h-3 bg-rose-400 animate-bounce [animation-delay:0.15s]" />
                                <span className="w-1 h-3 bg-rose-400 animate-bounce [animation-delay:0.3s]" />
                              </span>
                            </>
                          ) : (
                            <>
                              <span>🔊 Listen</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Message Text */}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100 selection:bg-teal-500">
                    {msg.content}
                  </div>

                  {/* Interactive Prescription Button for AI responses */}
                  {!isUser && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => handleGeneratePrescription(msg.content)}
                        disabled={generatingRx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 rounded-xl transition-all hover:scale-102 active:scale-98"
                      >
                        <span>📋 View & Generate Digital Prescription (Rx)</span>
                        <span>→</span>
                      </button>

                      <span className="text-[10px] text-slate-400">
                        Language: {activeLangObj.native}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl rounded-tl-none shadow-md flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm animate-spin">
                  ⏳
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-emerald-400">
                    AI Doctor is analyzing symptoms in {activeLangObj.native}...
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
            💡 Quick Questions:
          </span>
          {quickPromptsList.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSubmit(prompt)}
              disabled={loading}
              className="px-3 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-full whitespace-nowrap transition-all shadow-sm"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-200">
              ✕
            </button>
          </div>
        )}

        {/* Voice Recording Active Waveform Banner */}
        {isRecording && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 bg-rose-500 rounded-full animate-ping" />
              <div className="text-xs">
                <span className="font-bold text-rose-300">Listening in {activeLangObj.native}...</span>{' '}
                <span className="text-slate-300">Speak naturally in your mother tongue</span>
              </div>
            </div>
            <button
              onClick={stopRecording}
              className="px-3 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg"
            >
              Done / Stop ⏹️
            </button>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-3 sm:p-4 shadow-xl">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mic STT Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading}
              className={`p-3 sm:px-4 sm:py-3 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all ${
                isRecording
                  ? 'bg-rose-600 text-white ring-4 ring-rose-500/30 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title={isRecording ? 'Click to stop recording' : `Speak in ${activeLangObj.name}`}
            >
              <span className="text-lg">{isRecording ? '🔴' : '🎤'}</span>
              <span className="text-xs font-semibold hidden md:inline">
                {isRecording ? 'Listening...' : `Speak (${activeLangObj.native})`}
              </span>
            </button>

            {/* Text Input */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Describe your symptoms in ${activeLangObj.native} or English... (Press Enter to Send)`}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none max-h-28 min-h-[46px]"
              rows={1}
              disabled={loading}
            />

            {/* Send Button */}
            <button
              onClick={() => handleSubmit()}
              disabled={loading || !input.trim()}
              className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-2xl shadow-lg shadow-emerald-900/40 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>{loading ? '...' : 'Send'}</span>
              <span>➤</span>
            </button>
          </div>

          {/* Footer Note */}
          <div className="mt-2.5 flex flex-wrap items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <span>🔒 Confidential PHC Healthcare AI</span>
              <span>•</span>
              <span>English, Odia, Hindi, Bengali, Telugu, Tamil, Kannada</span>
            </span>
            <span className="text-emerald-400">
              {activeLangObj.native} Mode Active
            </span>
          </div>
        </div>
      </main>

      {/* Official Prescription Slip Modal */}
      {showPrescriptionModal && prescriptionData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl flex items-center justify-center text-2xl font-bold text-emerald-400">
                  Rx
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    Official Medical Prescription (Rx)
                  </h2>
                  <p className="text-xs text-emerald-400 font-mono">
                    ID: {prescriptionData.rx_id} • {prescriptionData.date}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Prescription Content (Printable Slip) */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto print:max-h-none text-slate-200">
              {/* PHC Emblem Banner */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-100 text-sm">{prescriptionData.phc_name}</div>
                  <div className="text-slate-400">Ministry of Health & Family Welfare Primary Care Network</div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-semibold">
                    ✓ AI Tele-Consultation Certified
                  </span>
                </div>
              </div>

              {/* Patient Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-800/40 border border-slate-800 p-3.5 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 block">Patient Name:</span>
                  <span className="font-semibold text-white">{prescriptionData.patient_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Age / Gender:</span>
                  <span className="font-semibold text-white">{prescriptionData.age_gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Consultation Language:</span>
                  <span className="font-semibold text-emerald-300">{activeLangObj.native} ({activeLangObj.name})</span>
                </div>
                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-800/60">
                  <span className="text-slate-400 block">Chief Symptoms & Assessment:</span>
                  <span className="font-medium text-slate-200">{prescriptionData.clinical_assessment} ({prescriptionData.symptoms_summary})</span>
                </div>
              </div>

              {/* Medications Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>💊 Recommended Medications (Rx)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">OTC & Supportive Therapy</span>
                </div>
                <div className="space-y-2.5">
                  {prescriptionData.medicines.map((med, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span>{med.name}</span>
                          <span className="text-xs font-normal px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md">
                            {med.type}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-teal-300 bg-teal-950/50 px-2.5 py-1 rounded-lg border border-teal-800/40">
                          {med.dosage} • {med.frequency}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 text-slate-300">
                        <div>
                          <span className="text-slate-500">Timing: </span>
                          <span>{med.timing} ({med.duration})</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Directions: </span>
                          <span className="text-emerald-300 font-medium">{med.instructions}</span>
                        </div>
                      </div>

                      {med.precautions && (
                        <div className="text-[11px] text-amber-300/90 bg-amber-950/20 px-2.5 py-1 rounded-lg border border-amber-900/30">
                          ⚠️ Caution: {med.precautions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Home Care & Diet */}
              {prescriptionData.home_care_and_diet && prescriptionData.home_care_and_diet.length > 0 && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-cyan-400 mb-2 flex items-center gap-1.5">
                    <span>🥗 Home Care, Diet & Hydration Advice</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {prescriptionData.home_care_and_diet.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-400">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Red-flag Warnings */}
              <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-3.5 text-xs text-rose-300">
                <span className="font-bold flex items-center gap-1.5 mb-1">
                  <span>🚨 Emergency Red Flags:</span>
                </span>
                <p>{prescriptionData.when_to_see_doctor}</p>
              </div>

              {/* Legal / Clinical Disclaimer */}
              <p className="text-[10px] text-slate-500 italic text-center">
                {prescriptionData.disclaimer}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(prescriptionData.formatted_slip_text);
                  alert('Prescription slip text copied to clipboard!');
                }}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all"
              >
                📋 Copy Slip Text
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-1.5"
                >
                  <span>🖨️ Print Prescription Slip</span>
                </button>
                <button
                  onClick={() => setShowPrescriptionModal(false)}
                  className="px-4 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
