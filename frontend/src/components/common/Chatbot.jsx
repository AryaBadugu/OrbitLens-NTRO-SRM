import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, X, Bot, User, Sparkles, MapPin, Mic, MicOff, Volume2, VolumeX, Settings, AlertTriangle, Globe } from 'lucide-react'
import { api } from '../../services/api'
import useVoiceChat, { LANGUAGES, VOICE_STATES } from '../../hooks/useVoiceChat'
import { useCommodity } from '../../context/CommodityContext'

export default function Chatbot({ userLocation }) {
  const { selectedCommodity, commodityInfo } = useCommodity()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! I am KrishiPulse AI Assistant. Ask me about mandi prices, nearest mandis, weather updates, or price forecasts.',
      citations: []
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [speakingMessageId, setSpeakingMessageId] = useState(null)
  const messagesEndRef = useRef(null)

  const voice = useVoiceChat()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen])

  // When voice recognition produces final text, put it in the input
  useEffect(() => {
    if (voice.finalText) {
      setInput(voice.finalText)
      voice.setFinalText('')
    }
  }, [voice.finalText])

  const handleSend = async (e, fromVoice = false) => {
    e?.preventDefault()
    if (!input.trim() || loading) return

    const userText = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { sender: 'user', text: userText, fromVoice }])
    setLoading(true)

    try {
      const lat = userLocation?.lat || 19.9975
      const lon = userLocation?.lon || 73.7898
      const res = await api.chat(userText, lat, lon, voice.language, selectedCommodity)

      const botMessage = {
        sender: 'bot',
        text: res.reply,
        citations: res.citations || [],
        dataStatus: res.data_status,
        dataSource: res.data_source,
        id: Date.now()
      }

      setMessages((prev) => [...prev, botMessage])

      // Auto-speak if enabled
      if (voice.autoSpeak && voice.isTTSSupported) {
        setSpeakingMessageId(botMessage.id)
        voice.speak(res.reply)
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Sorry, I encountered an error communicating with the backend. Please try again.',
          citations: [],
          id: Date.now()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleMicClick = () => {
    if (!voice.isSupported) {
      return
    }
    voice.toggleListening()
  }

  const handleSpeakClick = (messageId, text) => {
    if (speakingMessageId === messageId && voice.isSpeaking) {
      voice.stopSpeaking()
      setSpeakingMessageId(null)
    } else {
      setSpeakingMessageId(messageId)
      voice.speak(text)
    }
  }

  // Reset speaking message ID when speech ends
  useEffect(() => {
    if (!voice.isSpeaking && speakingMessageId !== null) {
      // Small delay to let the state settle
      const t = setTimeout(() => {
        if (!voice.isSpeaking) setSpeakingMessageId(null)
      }, 200)
      return () => clearTimeout(t)
    }
  }, [voice.isSpeaking, speakingMessageId])

  // Cleanup voice on chatbot close
  useEffect(() => {
    if (!isOpen) {
      voice.stopListening()
      voice.stopSpeaking()
      setSpeakingMessageId(null)
    }
  }, [isOpen])

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-[#1d4e2f] hover:bg-[#173c24] text-white p-4 rounded-full shadow-xl flex items-center gap-2 border border-[#428859] transition-transform hover:scale-105"
        >
          <Bot size={22} />
          <span className="text-xs font-bold pr-1">Krishi AI Chat</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[92vw] h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-[#173624] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2e5b3f] flex items-center justify-center text-[#9dd1a8]">
                <Bot size={18} />
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  KrishiPulse Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[10px] text-[#a1c2ab]">Data-Grounded Commodity Intelligence</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
                aria-label="Voice settings"
                title="Voice settings"
              >
                <Settings size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Voice Settings Bar */}
          {showSettings && (
            <div className="voice-settings-bar">
              <label>
                <Globe size={11} />
                <select
                  value={voice.language}
                  onChange={(e) => voice.setLanguage(e.target.value)}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </label>
              <span style={{ color: '#d1d5db' }}>|</span>
              <label>
                <Volume2 size={11} />
                Voice responses
                <button
                  className={`voice-toggle ${voice.autoSpeak ? 'active' : ''}`}
                  onClick={() => voice.setAutoSpeak(!voice.autoSpeak)}
                  aria-label={voice.autoSpeak ? 'Disable auto voice responses' : 'Enable auto voice responses'}
                  title={voice.autoSpeak ? 'Auto-speak ON' : 'Auto-speak OFF'}
                />
              </label>
            </div>
          )}

          {/* Voice Error Toast */}
          {voice.errorMessage && (
            <div className="voice-error-toast" style={{ margin: '6px 12px 0' }}>
              <AlertTriangle size={12} />
              <span>{voice.errorMessage}</span>
              <button onClick={voice.clearError} aria-label="Dismiss error">×</button>
            </div>
          )}

          {/* Listening Indicator */}
          {voice.isListening && (
            <div className="voice-listening-bar" style={{ margin: '6px 12px 0' }}>
              <div className="voice-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span>Listening...</span>
              {voice.interimText && (
                <span className="interim-text">"{voice.interimText}"</span>
              )}
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 p-4 space-y-3.5 bg-[#f8faf7] chatbot-messages">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-[#173624] text-white flex items-center justify-center flex-none text-[11px]">
                    <Bot size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[82%] p-3 rounded-xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#245f39] text-white rounded-br-none font-medium'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                  }`}
                  style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
                >
                  <div className="whitespace-pre-line">
                    {m.sender === 'user' && m.fromVoice && (
                      <span className="voice-icon-indicator" title="Sent via voice">
                        <Mic size={9} />
                      </span>
                    )}
                    {m.text}
                  </div>

                  {m.sender === 'bot' && m.dataSource && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400">
                      <span>Source: {m.dataSource}</span>
                      {m.dataStatus && (
                        <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                          m.dataStatus === 'live' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {m.dataStatus}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Speaker button on bot messages (not on the initial greeting) */}
                  {m.sender === 'bot' && i > 0 && voice.isTTSSupported && (
                    <div className="mt-1.5 flex justify-end">
                      <button
                        className={`voice-speak-btn ${speakingMessageId === m.id && voice.isSpeaking ? 'speaking' : ''}`}
                        onClick={() => handleSpeakClick(m.id, m.text)}
                        aria-label={speakingMessageId === m.id && voice.isSpeaking ? 'Stop speaking' : 'Read response aloud'}
                        title={speakingMessageId === m.id && voice.isSpeaking ? 'Stop' : 'Listen'}
                      >
                        {speakingMessageId === m.id && voice.isSpeaking ? (
                          <VolumeX size={12} />
                        ) : (
                          <Volume2 size={12} />
                        )}
                      </button>
                    </div>
                  )}
                </div>
                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center flex-none text-[11px]">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center text-xs text-slate-400 italic bg-white p-2.5 rounded-xl border border-slate-100 w-fit">
                <Sparkles size={14} className="animate-spin text-[#245f39]" />
                Checking real backend data...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 text-[10px] chatbot-suggestions">
            {[
              `Nearest ${commodityInfo.name.toLowerCase()} mandi?`,
              `${userLocation?.name || 'Nashik'} weather update`,
              `Will ${commodityInfo.name.toLowerCase()} prices increase?`
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setInput(prompt)
                }}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={(e) => handleSend(e, false)} className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about prices, weather, nearest mandis..."
              className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#245f39] text-slate-900 bg-white min-w-0"
            />
            {voice.isSupported && (
              <button
                type="button"
                onClick={handleMicClick}
                disabled={loading}
                className={`voice-mic-btn ${voice.isListening ? 'listening' : ''}`}
                aria-label={voice.isListening ? 'Stop voice input' : 'Start voice input'}
                title={voice.isListening ? 'Stop listening' : 'Voice input'}
              >
                {voice.isListening ? <MicOff size={15} /> : <Mic size={15} />}
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-[#245f39] hover:bg-[#1d4e2f] disabled:opacity-50 text-white p-2.5 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
