import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Globe, X, CheckCircle2, AlertCircle, Loader2, Volume2 } from 'lucide-react';
import { ThreadClusterIcon } from './ThreadClusterIcon';

interface VoiceDictationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyParsedData: (data: {
    name?: string;
    weaver_name?: string;
    region?: string;
    material?: string;
    price?: number;
    description?: string;
  }) => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'hi-IN', label: 'Hindi (हिंदी)', sample: 'जैसे: मैं बनारस से हूँ, यह शुद्ध कतान सिल्क साड़ी है...' },
  { code: 'en-IN', label: 'English (India)', sample: 'e.g., I am from Varanasi, this is a pure Katan Silk Saree...' },
  { code: 'bn-IN', label: 'Bengali (বাংলা)', sample: 'যেমন: আমি ফুলিয়া থেকে বলছি, এটি খাঁটি জামদানি শাড়ি...' },
  { code: 'ta-IN', label: 'Tamil (தமிழ்)', sample: 'எ.கா: நான் காஞ்சிபுரத்தைச் சேர்ந்தவன், இது தூய பட்டுப் புடவை...' },
  { code: 'te-IN', label: 'Telugu (తెలుగు)', sample: 'ఉదా: నేను పోచంపల్లి నుండి, ఇది డబుల్ ఇక్కత్ పట్టు...' },
  { code: 'gu-IN', label: 'Gujarati (ગુજરાતી)', sample: 'દા.ત: હું પાટણથી છું, આ શુદ્ધ પટોળા સિલ્ક સાડી છે...' },
];

export const VoiceDictationModal: React.FC<VoiceDictationModalProps> = ({
  isOpen,
  onClose,
  onApplyParsedData,
}) => {
  const [selectedLang, setSelectedLang] = useState<string>('hi-IN');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<any>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Speech Recognition API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentTranscript.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access was denied. Please grant mic permission in your browser.');
        } else if (event.error !== 'no-speech') {
          setErrorMsg(`Voice input status: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Could not initialize Speech Recognition:', e);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [selectedLang]);

  const toggleListening = () => {
    setErrorMsg(null);
    if (!recognitionRef.current) {
      setErrorMsg('Voice dictation is not available in this browser. You can type or paste spoken text below.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = selectedLang;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Failed to start speech recognition:', err);
      }
    }
  };

  const handleProcessTranscript = async () => {
    if (!transcript.trim()) {
      setErrorMsg('Please speak or type about your product first.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang);
      const res = await fetch('/api/parse-dictation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcript.trim(),
          language: langObj?.label || 'Hindi / Vernacular Indian Language',
        }),
      });

      if (!res.ok) {
        throw new Error('Could not parse voice dictation');
      }

      const json = await res.json();
      if (json.data) {
        setParsedPreview(json.data);
      } else {
        throw new Error('No structured data returned');
      }
    } catch (err: any) {
      console.error('Dictation processing error:', err);
      setErrorMsg('AI processing error. Please try again or edit the text.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApply = () => {
    if (parsedPreview) {
      onApplyParsedData(parsedPreview);
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FDFBF7] rounded-2xl max-w-xl w-full border-2 border-[#D89B2C] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#1B2A4A] text-[#F6F1E7] p-5 border-b border-[#D89B2C]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D89B2C] to-[#B87B16] text-[#1B2A4A] flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#F6F1E7]">
                Weaver Voice Dictation (आवाज से लिस्टिंग)
              </h3>
              <p className="text-xs text-[#F6F1E7]/70 font-sans">
                Speak naturally in your mother tongue — voice AI will extract product details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#F6F1E7]/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Step 1: Language Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1B2A4A]/80 mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#D89B2C]" />
              Select Your Native Language / अपनी भाषा चुनें
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setSelectedLang(lang.code);
                    if (isListening && recognitionRef.current) {
                      recognitionRef.current.stop();
                      setIsListening(false);
                    }
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-all ${
                    selectedLang === lang.code
                      ? 'bg-[#1B2A4A] text-[#D89B2C] border-[#D89B2C] shadow-sm font-semibold'
                      : 'bg-white text-[#1B2A4A] border-gray-200 hover:border-[#D89B2C]/50'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#1B2A4A]/60 mt-1.5 italic">
              {currentLangObj?.sample}
            </p>
          </div>

          {/* Step 2: Mic Control & Wave */}
          <div className="bg-[#1B2A4A]/5 rounded-xl p-5 border border-[#D89B2C]/20 flex flex-col items-center justify-center text-center space-y-3">
            <button
              type="button"
              onClick={toggleListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all transform ${
                isListening
                  ? 'bg-[#7A2734] text-white animate-pulse scale-110 ring-8 ring-[#7A2734]/20'
                  : 'bg-[#D89B2C] text-[#1B2A4A] hover:bg-[#F5CE7B] hover:scale-105 active:scale-95'
              }`}
              id="start-voice-dictation-btn"
            >
              {isListening ? (
                <MicOff className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>

            <div>
              <p className="font-serif font-bold text-sm text-[#1B2A4A]">
                {isListening ? 'Listening to your voice... (बोलिए...)' : 'Tap to Start Speaking'}
              </p>
              <p className="text-xs text-[#1B2A4A]/70 max-w-sm mt-0.5">
                Describe the weave, fabric, your name/region, and expected price in your natural rhythm.
              </p>
            </div>
          </div>

          {/* Transcript Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#1B2A4A] flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-[#D89B2C]" /> Spoken Words Transcript
              </label>
              {transcript && (
                <button
                  type="button"
                  onClick={() => setTranscript('')}
                  className="text-[11px] text-[#7A2734] hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your spoken words will appear here in real-time. You can also type or edit directly..."
              rows={3}
              className="w-full p-3 rounded-lg border border-[#D89B2C]/30 bg-white text-sm focus:ring-2 focus:ring-[#D89B2C] focus:border-[#D89B2C] text-[#1B2A4A]"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#7A2734]/10 border border-[#7A2734]/30 rounded-lg text-xs text-[#7A2734] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* AI Parsed Results Preview */}
          {parsedPreview && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-emerald-800 font-semibold">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Extracted Product Information:
                </span>
                <span className="font-mono font-bold text-emerald-900">₹{parsedPreview.price}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-emerald-900/90 pt-1">
                <div><strong>Product:</strong> {parsedPreview.name}</div>
                <div><strong>Material:</strong> {parsedPreview.material}</div>
                <div><strong>Weaver:</strong> {parsedPreview.weaver_name || 'Artisan'}</div>
                <div><strong>Region:</strong> {parsedPreview.region}</div>
              </div>
              <p className="text-emerald-950/80 italic pt-1 border-t border-emerald-200">
                "{parsedPreview.description}"
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white p-4 border-t border-gray-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {!parsedPreview ? (
              <button
                type="button"
                onClick={handleProcessTranscript}
                disabled={isAnalyzing || !transcript.trim()}
                className="px-5 py-2.5 bg-[#1B2A4A] text-[#F6F1E7] hover:bg-[#253966] disabled:opacity-50 text-xs font-medium rounded-lg flex items-center gap-2 shadow-md transition-all"
                id="parse-voice-btn"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting Product Fields...</span>
                  </>
                ) : (
                  <>
                    <ThreadClusterIcon className="w-3.5 h-3.5 text-[#D89B2C]" />
                    <span>Analyze & Extract Fields</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2.5 bg-[#D89B2C] text-[#1B2A4A] hover:bg-[#F5CE7B] text-xs font-bold rounded-lg flex items-center gap-2 shadow-md transition-all"
                id="apply-voice-data-btn"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Auto-Fill Listing Form</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
