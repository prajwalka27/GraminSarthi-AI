'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Bot,
  User,
  RefreshCw,
  CloudSun,
  Calculator,
  TrendingDown,
  Receipt,
  HelpCircle,
  RotateCcw,
  Volume1,
  Languages
} from 'lucide-react'
import { apiRequest } from '@/lib/api'
import type { Lang } from '@/lib/graminsarthi/i18n'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolUsed?: string
  isVoice?: boolean
  timestamp: string
}

const QUICK_CHIPS: Partial<Record<Lang, { label: string; prompt: string; icon: any }[]>> = {
  en: [
    { label: "Weather Today", prompt: "What is the weather today?", icon: CloudSun },
    { label: "Highest Expense", prompt: "What was my highest expense last month?", icon: Receipt },
    { label: "Why Profit Dropped", prompt: "Why did my profit decrease?", icon: TrendingDown },
    { label: "Calculate 25 × 480", prompt: "Calculate 25 * 480", icon: Calculator },
    { label: "Explain GST", prompt: "Explain GST in simple words", icon: HelpCircle },
    { label: "Unpaid Khata Recovery", prompt: "What should I do if a customer doesn't pay?", icon: HelpCircle },
    { label: "Translate to Kannada", prompt: "Translate this sentence to Kannada: Hello, how can I help you?", icon: Languages },
  ],
  hi: [
    { label: "आज का मौसम", prompt: "आज का मौसम कैसा है?", icon: CloudSun },
    { label: "सबसे बड़ा खर्च", prompt: "मेरा सबसे बड़ा खर्च क्या था?", icon: Receipt },
    { label: "मुनाफा क्यों घटा?", prompt: "मेरा मुनाफा क्यों कम हुआ?", icon: TrendingDown },
    { label: "25 × 480 की गणना", prompt: "25 * 480 की गणना करें", icon: Calculator },
    { label: "जीएसटी समझाएं", prompt: "सरल शब्दों में जीएसटी समझाएं", icon: HelpCircle },
    { label: "उधार वसूली सलाह", prompt: "अगर कोई ग्राहक उधार न दे तो क्या करना चाहिए?", icon: HelpCircle },
    { label: "कन्नड़ में अनुवाद", prompt: "इस वाक्य का कन्नड़ में अनुवाद करें: नमस्ते, मैं आपकी क्या मदद कर सकता हूँ?", icon: Languages },
  ],
  kn: [
    { label: "ಇಂದಿನ ಹವಾಮಾನ", prompt: "ಇಂದಿನ ಹವಾಮಾನ ಹೇಗಿದೆ?", icon: CloudSun },
    { label: "ಗರಿಷ್ಠ ಖರ್ಚು", prompt: "ನನ್ನ ಗರಿಷ್ಠ ಖರ್ಚು ಯಾವುದು?", icon: Receipt },
    { label: "ಲಾಭ ಏಕೆ ಕಡಿಮೆಯಾಯಿತು?", prompt: "ನನ್ನ ಲಾಭ ಏಕೆ ಕಡಿಮೆಯಾಯಿತು?", icon: TrendingDown },
    { label: "25 × 480 ಲೆಕ್ಕಾಚಾರ", prompt: "25 * 480 ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ", icon: Calculator },
    { label: "ಜಿಎಸ್‌ಟಿ ವಿವರಣೆ", prompt: "ಜಿಎಸ್‌ಟಿ ಬಗ್ಗೆ ಸರಳವಾಗಿ ವಿವರಿಸಿ", icon: HelpCircle },
    { label: "ಉದ್ರಿ ವಸೂಲಿ ಸಲಹೆ", prompt: "ಗ್ರಾಹಕರು ಉದ್ರಿ ಹಣ ನೀಡದಿದ್ದರೆ ಏನು ಮಾಡಬೇಕು?", icon: HelpCircle },
    { label: "ಕನ್ನಡಕ್ಕೆ ಭಾಷಾಂತರ", prompt: "Translate to Kannada: Welcome to our village store", icon: Languages },
  ],
}

const TOOL_BADGES: Record<string, { label: string; color: string }> = {
  live_weather_service: { label: "🌦️ Live Weather (Open-Meteo)", color: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  math_calculator: { label: "🧮 Math & GST Calculator", color: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  postgresql_business_ledger: { label: "📊 Postgres Business Ledger", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  postgresql_problems_table: { label: "⚠️ Postgres Problems Tracker", color: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  rural_tax_guidance: { label: "📜 Rural Tax Advisory", color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
  business_growth_advisory: { label: "📈 Sales Growth Advisory", color: "bg-teal-500/15 text-teal-300 border-teal-500/30" },
  khata_credit_advisory: { label: "🤝 Credit & Khata Advisory", color: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  multilingual_translator: { label: "🗣️ Multi-lingual Translator", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  gemini_2_flash: { label: "🧠 Google Gemini AI", color: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
  graminsarthi_assistant_engine: { label: "⚡ GraminSarthi Core", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
}

export function VoiceAssistant({
  lang: initialLang = 'en',
  merchantId,
  businessId,
  isModal = false,
  onClose
}: {
  lang?: Lang
  merchantId?: string
  businessId?: string
  isModal?: boolean
  onClose?: () => void
}) {
  const [currentLang, setCurrentLang] = useState<Lang>(initialLang)
  const [inputQuery, setInputQuery] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sttSupported, setSttSupported] = useState(true)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Initialize initial greeting
  useEffect(() => {
    const greetings: Partial<Record<Lang, string>> = {
      en: "Hello! I am your GraminSarthi AI Voice Assistant. Speak or type to ask about your shop ledger, current weather, GST rules, math calculations, or sales growth.",
      hi: "नमस्ते! मैं आपका ग्रामसारथी एआई वॉयस असिस्टेंट हूँ। आप बोलकर या लिखकर अपने बहीखाते, आज के मौसम, जीएसटी, गणना या दुकान बढ़ाने की सलाह पूछ सकते हैं।",
      kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಗ್ರಾಮಸಾರಥಿ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಧ್ವನಿ ಸಹಾಯಕ. ನಿಮ್ಮ ಅಂಗಡಿಯ ಲೆಡ್ಜರ್, ಇಂದಿನ ಹವಾಮಾನ, ಜಿಎಸ್‌ಟಿ, ಲೆಕ್ಕಾಚಾರ ಅಥವಾ ವ್ಯಾಪಾರ ಬೆಳವಣಿಗೆಯ ಬಗ್ಗೆ ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ ಕೇಳಬಹುದು."
    }

    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          role: 'assistant',
          content: greetings[currentLang] || greetings.en || "",
          toolUsed: 'graminsarthi_assistant_engine',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    }
  }, [currentLang])

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, isListening])

  // Setup Web Speech Recognition (STT)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSttSupported(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript
        if (transcript) {
          setInputQuery(transcript)
          handleSendQuery(transcript, true)
        }
        setIsListening(false)
      }

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    } catch (err) {
      console.warn('SpeechRecognition setup failed:', err)
      setSttSupported(false)
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // ignore
        }
      }
    }
  }, [currentLang])

  // Toggle voice recognition
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser. You can still type your questions naturally.")
      return
    }

    if (isListening) {
      try {
        recognitionRef.current.stop()
      } catch {
        // ignore
      }
      setIsListening(false)
    } else {
      // Stop any current speech synthesis
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        setSpeakingId(null)
      }

      // Set recognition language
      const langCodes: Partial<Record<Lang, string>> = {
        en: 'en-IN',
        hi: 'hi-IN',
        kn: 'kn-IN',
      }
      recognitionRef.current.lang = langCodes[currentLang] || 'en-IN'

      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (err) {
        console.warn('Could not start recognition:', err)
        setIsListening(false)
      }
    }
  }

  // Text-to-Speech (TTS)
  const speakText = (text: string, msgId: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()

    if (speakingId === msgId) {
      setSpeakingId(null)
      return
    }

    // Clean markdown asterisks and bullets for cleaner audio speech
    const cleanSpeech = text
      .replace(/[*_#`~]/g, '')
      .replace(/₹/g, 'Rupees ')
      .trim()

    const utterance = new SpeechSynthesisUtterance(cleanSpeech)
    const langCodes: Partial<Record<Lang, string>> = {
      en: 'en-IN',
      hi: 'hi-IN',
      kn: 'kn-IN',
    }
    const targetCode = langCodes[currentLang] || 'en-IN'
    utterance.lang = targetCode
    utterance.rate = 0.95 // slightly measured pace for clear rural retail comprehension

    // Pick best matching voice if available
    const voices = window.speechSynthesis.getVoices()
    const targetLangPrefix = targetCode.split('-')[0]
    const matchedVoice = voices.find(v => v.lang.startsWith(targetLangPrefix))
    if (matchedVoice) {
      utterance.voice = matchedVoice
    }

    utterance.onend = () => setSpeakingId(null)
    utterance.onerror = () => setSpeakingId(null)

    setSpeakingId(msgId)
    window.speechSynthesis.speak(utterance)
  }

  // Submit query to /api/ai/assistant
  const handleSendQuery = async (queryToSend?: string, fromVoice = false) => {
    const text = (queryToSend ?? inputQuery).trim()
    if (!text || loading) return

    setInputQuery('')

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      isVoice: fromVoice,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const response = await apiRequest<{
        success: boolean
        reply: string
        toolUsed?: string
        language: Lang
        dataContext?: any
      }>('/api/ai/assistant', {
        method: 'POST',
        body: JSON.stringify({
          message: text,
          language: currentLang,
          merchantId: merchantId || undefined,
          businessId: businessId || undefined
        })
      })

      const replyText = response.reply || "I couldn't process that request right now. Please try again."
      const replyMsgId = `assistant-${Date.now()}`

      const assistantMsg: ChatMessage = {
        id: replyMsgId,
        role: 'assistant',
        content: replyText,
        toolUsed: response.toolUsed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, assistantMsg])

      // Auto-read response if audio output is enabled
      if (audioEnabled) {
        speakText(replyText, replyMsgId)
      }
    } catch (err) {
      const errorReplies: Partial<Record<Lang, string>> = {
        en: "I'm having trouble connecting to the backend services. Please make sure the backend is active.",
        hi: "सर्वर से संपर्क करने में समस्या आ रही है। कृपया सुनिश्चित करें कि बैकएंड चल रहा है।",
        kn: "ಸರ್ವರ್ ಸಂಪರ್ಕಿಸಲು ತೊಂದರೆಯಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ಬ್ಯಾಕೆಂಡ್ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ."
      }
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: errorReplies[currentLang] || errorReplies.en || "",
          toolUsed: 'graminsarthi_assistant_engine',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const chips = QUICK_CHIPS[currentLang] || QUICK_CHIPS.en || []

  return (
    <div className={`flex flex-col bg-card border border-border rounded-2xl shadow-xl overflow-hidden ${isModal ? 'h-full' : 'min-h-[580px]'}`}>
      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/30">
            <Bot className="w-5 h-5" />
            {isListening && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">GraminSarthi Voice AI</h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Live Tools
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {currentLang === 'kn' ? 'ಧ್ವನಿ ಮತ್ತು ಪಠ್ಯ ಸಹಾಯಕ' : currentLang === 'hi' ? 'आवाज़ और टेक्स्ट सहायक' : 'Speaks Kannada, Hindi & English'}
            </p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex rounded-xl bg-secondary/70 p-0.5 border border-border">
            <button
              type="button"
              onClick={() => setCurrentLang('en')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${currentLang === 'en' ? 'bg-emerald-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setCurrentLang('hi')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${currentLang === 'hi' ? 'bg-emerald-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => setCurrentLang('kn')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${currentLang === 'kn' ? 'bg-emerald-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              ಕನ್ನಡ
            </button>
          </div>

          {/* Mute / Audio Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !audioEnabled
              setAudioEnabled(next)
              if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel()
                setSpeakingId(null)
              }
            }}
            title={audioEnabled ? "Mute Voice Output" : "Enable Voice Output"}
            className={`p-2 rounded-xl border transition ${audioEnabled ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-border bg-secondary text-muted-foreground hover:text-foreground'}`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Close Modal (if modal view) */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* QUICK PROMPT CHIPS */}
      <div className="px-4 py-2.5 border-b border-border bg-secondary/30 overflow-x-auto scrollbar-none flex items-center gap-2">
        <span className="text-[11px] font-semibold text-muted-foreground shrink-0 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          {currentLang === 'kn' ? 'ತ್ವರಿತ ಪ್ರಶ್ನೆಗಳು:' : currentLang === 'hi' ? 'त्वरित प्रश्न:' : 'Ask:'}
        </span>
        {chips.map((chip, idx) => {
          const Icon = chip.icon
          return (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => handleSendQuery(chip.prompt, false)}
              className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-card hover:bg-secondary text-foreground border border-border hover:border-emerald-500/50 transition disabled:opacity-50"
            >
              <Icon className="w-3.5 h-3.5 text-emerald-400" />
              <span>{chip.label}</span>
            </button>
          )
        })}
      </div>

      {/* CHAT TRANSCRIPT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[460px] scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.role === 'user'
          const toolInfo = msg.toolUsed ? TOOL_BADGES[msg.toolUsed] : null

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-4 shadow-md ${isUser
                    ? 'bg-emerald-600 text-white rounded-br-xs'
                    : 'bg-card border border-border text-foreground rounded-bl-xs'
                  }`}
              >
                {/* TOOL BADGE FOR ASSISTANT */}
                {!isUser && toolInfo && (
                  <div className="mb-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${toolInfo.color}`}>
                      {toolInfo.label}
                    </span>
                  </div>
                )}

                {/* CONTENT */}
                <div className="text-sm leading-relaxed whitespace-pre-wrap select-text">
                  {msg.content}
                </div>

                {/* FOOTER: TIME & CONTROLS */}
                <div className={`mt-2.5 flex items-center gap-2 text-[11px] ${isUser ? 'text-emerald-100 justify-end' : 'text-muted-foreground justify-between'}`}>
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => speakText(msg.content, msg.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] transition ${speakingId === msg.id
                          ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400 font-semibold'
                          : 'border-border bg-secondary hover:text-foreground'
                        }`}
                      title="Listen with Text-to-Speech"
                    >
                      {speakingId === msg.id ? (
                        <>
                          <VolumeX className="w-3 h-3" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume1 className="w-3 h-3 text-emerald-400" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-1">
                  {msg.isVoice ? <Mic className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
              )}
            </div>
          )
        })}

        {/* LOADING INDICATOR */}
        {loading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-xs p-3.5 flex items-center gap-2 text-xs text-muted-foreground shadow-sm">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>
                {currentLang === 'kn' ? 'ಗ್ರಾಮಸಾರಥಿ ಯೋಚಿಸುತ್ತಿದೆ...' : currentLang === 'hi' ? 'ग्रामसारथी विश्लेषण कर रहा है...' : 'GraminSarthi is querying live data...'}
              </span>
            </div>
          </div>
        )}

        {/* VOICE LISTENING ANIMATION BANNER */}
        {isListening && (
          <div className="flex items-center justify-center gap-3 p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-60"></span>
              <div className="relative w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Mic className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xs">
              <p className="font-semibold text-emerald-200">
                {currentLang === 'kn' ? 'ಕೇಳುತ್ತಿದ್ದೇವೆ... ಮಾತನಾಡಿ' : currentLang === 'hi' ? 'सुन रहे हैं... बोलिए' : 'Listening... Speak naturally now'}
              </p>
              <p className="text-[11px] text-emerald-400/80">
                {currentLang === 'kn' ? 'ಹವಾಮಾನ, ಲೆಡ್ಜರ್ ಅಥವಾ ಲೆಕ್ಕಾಚಾರ ಕೇಳಿ' : currentLang === 'hi' ? 'मौसम, बहीखाता या गणना के बारे में पूछें' : 'Ask about weather, ledger, math, or business advice'}
              </p>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* INPUT BAR */}
      <div className="p-3 border-t border-border bg-card/70 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendQuery()
          }}
          className="flex items-center gap-2"
        >
          {/* MICROPHONE BUTTON */}
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? "Stop Listening" : "Press to Speak"}
            className={`relative p-3 rounded-xl flex items-center justify-center transition shadow-md shrink-0 ${isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20'
              }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* TEXT INPUT FIELD */}
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={loading}
            placeholder={
              currentLang === 'kn'
                ? 'ಮಾತನಾಡಿ 🎤 ಅಥವಾ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ...'
                : currentLang === 'hi'
                  ? 'बोलें 🎤 या प्रश्न टाइप करें...'
                  : 'Speak 🎤 or ask anything (weather, ledger, GST, math)...'
            }
            className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition"
          />

          {/* SEND BUTTON */}
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="p-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 transition shrink-0"
            title="Send Question"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            Real PostgreSQL Ledger & Live Weather connected
          </span>
          <span>
            {sttSupported ? 'Voice STT + TTS enabled' : 'Text mode active'}
          </span>
        </div>
      </div>
    </div>
  )
}
