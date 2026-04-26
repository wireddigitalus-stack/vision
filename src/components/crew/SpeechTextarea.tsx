"use client";
import { useRef, useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  accentColor?: string;
}

export default function SpeechTextarea({
  value, onChange,
  placeholder = "Add notes…",
  rows = 4,
  label,
  accentColor = "#4ADE80",
}: Props) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalRef = useRef(value);

  useEffect(() => { finalRef.current = value; }, [value]);
  useEffect(() => () => { recognitionRef.current?.stop(); }, []);

  const toggleSpeech = () => {
    const SR =
      (window as Window & typeof globalThis & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as Window & typeof globalThis & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalRef.current = (finalRef.current ? finalRef.current + " " : "") + e.results[i][0].transcript.trim();
        } else {
          interim = e.results[i][0].transcript;
        }
      }
      onChange(finalRef.current + (interim ? " " + interim : ""));
    };
    rec.onend = () => { setListening(false); onChange(finalRef.current); };
    rec.onerror = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  };

  return (
    <div>
      {label && (
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{label}</p>
      )}
      <div className="relative">
        <textarea
          spellCheck
          value={value}
          onChange={e => { finalRef.current = e.target.value; onChange(e.target.value); }}
          rows={rows}
          placeholder={placeholder}
          className="w-full rounded-2xl px-4 py-3.5 pr-16 text-base text-white outline-none placeholder:text-gray-600 resize-none transition-colors"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: `1.5px solid ${listening ? "#EF4444" : "rgba(255,255,255,0.1)"}`,
          }}
        />
        {supported && (
          <button
            type="button"
            onClick={toggleSpeech}
            className="absolute right-3 bottom-3 w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90"
            style={{ background: listening ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.07)" }}
            title={listening ? "Tap to stop" : "Tap to speak"}
          >
            {listening
              ? <MicOff size={22} className="text-red-400" />
              : <Mic size={22} style={{ color: accentColor }} />
            }
          </button>
        )}
      </div>
      {listening && (
        <div className="flex items-center gap-2 mt-2">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse inline-block" />
          <span className="text-xs text-red-400 font-black">Listening… speak now</span>
        </div>
      )}
    </div>
  );
}
