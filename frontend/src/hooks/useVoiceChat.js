import { useState, useRef, useCallback, useEffect } from 'react'

const LANGUAGES = [
  { code: 'en-IN', label: 'English', shortLabel: 'EN' },
  { code: 'hi-IN', label: 'हिन्दी', shortLabel: 'हि' },
  { code: 'mr-IN', label: 'मराठी', shortLabel: 'म' },
]

const DEMO_QUERIES = {
  'en-IN': [
    "What's the nearest onion mandi?",
    "Nashik weather update",
    "Will onion prices increase this week?",
    "Show latest mandi prices in Lasalgaon"
  ],
  'hi-IN': [
    "नाशिक में प्याज़ का भाव क्या है?",
    "आज का मौसम कैसा रहेगा?",
    "निकटतम मंडी कौन सी है?"
  ],
  'mr-IN': [
    "माझ्या जवळची कांदा मंडई कोणती?",
    "नाशिकमधील कांद्याचे भाव काय आहेत?",
    "आजचे हवामान कसे आहे?"
  ]
}

const VOICE_STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  SPEAKING: 'speaking',
  ERROR: 'error',
}

const ERROR_MESSAGES = {
  'not-allowed': 'Microphone permission is required for voice input.',
  'no-speech': "No speech was detected. Please try speaking again.",
  'audio-capture': 'Microphone unavailable. Please check your device.',
  'network': 'Network error reaching speech recognition service. Please check connection.',
  'aborted': 'Voice input was cancelled.',
  'service-not-allowed': 'Speech recognition service is not allowed in this browser.',
  'language-not-supported': 'Selected language is not supported by your browser.',
  'not-supported': "Voice input isn't supported in this browser. Try Chrome or Edge.",
  'tts-not-supported': 'Text-to-speech is not supported in this browser.',
  'unknown': 'Something went wrong with voice input. Please try again.',
}

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

function isTTSAvailable() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export { LANGUAGES, VOICE_STATES, DEMO_QUERIES }

export default function useVoiceChat() {
  const [voiceState, setVoiceState] = useState(VOICE_STATES.IDLE)
  const [interimText, setInterimText] = useState('')
  const [finalText, setFinalText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [language, setLanguage] = useState('en-IN')
  const [autoSpeak, setAutoSpeak] = useState(false)

  const recognitionRef = useRef(null)
  const utteranceRef = useRef(null)
  const isMountedRef = useRef(true)
  const errorTimeoutRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const vadRef = useRef(null)
  const silenceTimerRef = useRef(null)

  const SpeechRecognitionClass = getSpeechRecognition()
  const isSupported = !!SpeechRecognitionClass
  const isTTSSupported = isTTSAvailable()

  // Centralized Idempotent Cleanup Function
  const cleanupVoiceSession = useCallback(() => {
    // 1. Stop Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null
        recognitionRef.current.onresult = null
        recognitionRef.current.onerror = null
        recognitionRef.current.onend = null
        recognitionRef.current.abort()
      } catch (_) {}
      recognitionRef.current = null
    }

    // 2. Clear Timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }

    // 3. Clean up VAD / Web Audio API Context
    if (vadRef.current) {
      if (vadRef.current.animFrameId) {
        cancelAnimationFrame(vadRef.current.animFrameId)
      }
      if (vadRef.current.audioCtx && vadRef.current.audioCtx.state !== 'closed') {
        try { vadRef.current.audioCtx.close() } catch (_) {}
      }
      vadRef.current = null
    }

    // 4. Stop and Release Microphone Track Streams
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop())
      mediaStreamRef.current = null
    }

    if (isMountedRef.current) {
      setInterimText('')
    }
  }, [])

  // Stop listening cleanly
  const stopListening = useCallback(() => {
    cleanupVoiceSession()
    if (isMountedRef.current && voiceState !== VOICE_STATES.ERROR && voiceState !== VOICE_STATES.SPEAKING) {
      setVoiceState(VOICE_STATES.IDLE)
    }
  }, [cleanupVoiceSession, voiceState])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      cleanupVoiceSession()
      if (isTTSAvailable()) {
        try { window.speechSynthesis.cancel() } catch (_) {}
      }
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
    }
  }, [cleanupVoiceSession])

  const clearError = useCallback(() => {
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
    setErrorMessage('')
    if (voiceState === VOICE_STATES.ERROR) {
      setVoiceState(VOICE_STATES.IDLE)
    }
  }, [voiceState])

  const showError = useCallback((key) => {
    cleanupVoiceSession()
    const msg = ERROR_MESSAGES[key] || ERROR_MESSAGES.unknown
    setErrorMessage(msg)
    setVoiceState(VOICE_STATES.ERROR)
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
    errorTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setErrorMessage('')
        setVoiceState(VOICE_STATES.IDLE)
      }
    }, 4000)
  }, [cleanupVoiceSession])

  const startListening = useCallback(async () => {
    // 1. Guard against starting while already listening, speaking, or if unsupported
    if (voiceState === VOICE_STATES.LISTENING || voiceState === VOICE_STATES.SPEAKING) {
      return
    }
    if (recognitionRef.current || mediaStreamRef.current) {
      return
    }

    if (!SpeechRecognitionClass) {
      showError('not-supported')
      return
    }

    // Stop any ongoing TTS before listening
    if (isTTSSupported) {
      window.speechSynthesis.cancel()
    }

    setInterimText('')
    setFinalText('')
    setErrorMessage('')

    // 2. Request microphone stream ONLY upon explicit user action
    let stream = null
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
    } catch (err) {
      showError('not-allowed')
      return
    }

    if (!isMountedRef.current) {
      if (stream) stream.getTracks().forEach(t => t.stop())
      return
    }

    setVoiceState(VOICE_STATES.LISTENING)

    // 3. Web Audio API Dynamic Noise Calibration & Sustained VAD Gate
    let audioCtx = null
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (AudioContextClass) {
        audioCtx = new AudioContextClass()
        const source = audioCtx.createMediaStreamSource(stream)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 512
        source.connect(analyser)

        const pcmData = new Float32Array(analyser.fftSize)

        // Calibration phase variables
        const calibrationStartTime = Date.now()
        const CALIBRATION_DURATION_MS = 350 // collect ambient floor for 350ms
        let ambientSamples = []
        let noiseFloor = 0.008 // default initial floor estimate
        let speechStartThreshold = 0.025
        let speechStopThreshold = 0.015
        let speechStartTime = 0
        let isSpeechConfirmed = false
        let recognitionStarted = false

        // Automatic silence timeout (stop listening if no speech within 8 seconds)
        silenceTimerRef.current = setTimeout(() => {
          if (isMountedRef.current && !isSpeechConfirmed && voiceState === VOICE_STATES.LISTENING) {
            stopListening()
          }
        }, 8000)

        const runVAD = () => {
          if (!isMountedRef.current || !vadRef.current) return

          analyser.getFloatTimeDomainData(pcmData)
          let sumSquares = 0
          for (let i = 0; i < pcmData.length; i++) {
            sumSquares += pcmData[i] * pcmData[i]
          }
          const rms = Math.sqrt(sumSquares / pcmData.length)
          const now = Date.now()

          // Phase 1: Calibrate ambient noise floor
          if (now - calibrationStartTime < CALIBRATION_DURATION_MS) {
            ambientSamples.push(rms)
            vadRef.current.animFrameId = requestAnimationFrame(runVAD)
            return
          }

          if (ambientSamples.length > 0) {
            const avgAmbient = ambientSamples.reduce((a, b) => a + b, 0) / ambientSamples.length
            // Noise floor estimation bounded between 0.005 and 0.04
            noiseFloor = Math.max(0.005, Math.min(0.04, avgAmbient))
            // Dynamic thresholds with Hysteresis
            speechStartThreshold = Math.max(0.020, noiseFloor * 2.8)
            speechStopThreshold = Math.max(0.012, noiseFloor * 1.8)
            ambientSamples = [] // calibration complete
          }

          // Phase 2: Dynamic VAD with Hysteresis & Sustained Speech Check (200ms)
          if (!isSpeechConfirmed) {
            if (rms >= speechStartThreshold) {
              if (speechStartTime === 0) {
                speechStartTime = now
              } else if (now - speechStartTime >= 200) {
                // Sustained speech confirmed!
                isSpeechConfirmed = true
                vadRef.current.isSpeechConfirmed = true

                // START SPEECH RECOGNITION ONLY NOW (VAD Gated)
                if (!recognitionStarted && SpeechRecognitionClass && isMountedRef.current) {
                  recognitionStarted = true
                  initiateSpeechRecognition()
                }
              }
            } else {
              if (now - speechStartTime > 100) {
                speechStartTime = 0 // reset short noise spike
              }
            }
          } else {
            // Speech active - monitor for speech pause using lower stop threshold
            if (rms < speechStopThreshold) {
              // speech paused/stopped
            }
          }

          if (vadRef.current) {
            vadRef.current.animFrameId = requestAnimationFrame(runVAD)
          }
        }

        vadRef.current = {
          audioCtx,
          analyser,
          isSpeechConfirmed: false,
          animFrameId: requestAnimationFrame(runVAD)
        }
      }
    } catch (err) {
      console.warn("[Voice VAD] Fallback to direct recognition:", err)
      // Fallback: start recognition directly if Web Audio API fails
      initiateSpeechRecognition()
    }

    // 4. Controlled SpeechRecognition Initialization Helper
    function initiateSpeechRecognition() {
      if (!isMountedRef.current || recognitionRef.current) return

      const recognition = new SpeechRecognitionClass()
      recognition.lang = language
      recognition.interimResults = true
      recognition.continuous = false // Single input mode
      recognition.maxAlternatives = 1

      let lastCapturedText = ''

      recognition.onstart = () => {
        if (isMountedRef.current) {
          setVoiceState(VOICE_STATES.LISTENING)
        }
      }

      recognition.onresult = (event) => {
        if (!isMountedRef.current) return

        let interim = ''
        let final = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            final += transcript
          } else {
            interim += transcript
          }
        }

        const rawText = (final || interim).trim()

        // Validate transcript (reject empty or <2 character noise strings)
        if (rawText && rawText.length >= 2) {
          lastCapturedText = rawText
          setInterimText(interim)
          setFinalText(rawText)
        }
      }

      recognition.onerror = (event) => {
        if (!isMountedRef.current) return

        if (event.error === 'aborted') {
          if (lastCapturedText && lastCapturedText.trim().length >= 2) {
            setFinalText(lastCapturedText.trim())
          }
          stopListening()
          return
        }

        if (event.error === 'no-speech') {
          stopListening()
          return
        }

        if (event.error === 'network') {
          showError('network')
          return
        }

        showError(event.error || 'unknown')
      }

      recognition.onend = () => {
        if (!isMountedRef.current) return

        const cleanText = lastCapturedText ? lastCapturedText.trim() : ''
        if (cleanText && cleanText.length >= 2) {
          setFinalText(cleanText)
          setInterimText('')
        } else {
          setFinalText('')
          setInterimText('')
        }

        stopListening()
      }

      recognitionRef.current = recognition

      try {
        recognition.start()
      } catch (err) {
        showError('unknown')
      }
    }
  }, [language, SpeechRecognitionClass, showError, voiceState, stopListening, isTTSSupported])

  const toggleListening = useCallback(() => {
    if (voiceState === VOICE_STATES.LISTENING) {
      stopListening()
    } else {
      startListening()
    }
  }, [voiceState, startListening, stopListening])

  // Text-to-speech
  const speak = useCallback((text) => {
    if (!isTTSSupported) {
      showError('tts-not-supported')
      return
    }

    // Do not speak if microphone is actively listening
    if (voiceState === VOICE_STATES.LISTENING) {
      stopListening()
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language
    utterance.rate = 0.95
    utterance.pitch = 1.0

    const voices = window.speechSynthesis.getVoices()
    const langPrefix = language.split('-')[0]
    const matchingVoice =
      voices.find((v) => v.lang === language) ||
      voices.find((v) => v.lang.startsWith(langPrefix)) ||
      voices.find((v) => v.lang.startsWith('en'))

    if (matchingVoice) {
      utterance.voice = matchingVoice
    }

    utterance.onstart = () => {
      if (isMountedRef.current) {
        setVoiceState(VOICE_STATES.SPEAKING)
      }
    }

    utterance.onend = () => {
      if (isMountedRef.current) {
        setVoiceState(VOICE_STATES.IDLE)
        utteranceRef.current = null
      }
    }

    utterance.onerror = (event) => {
      if (!isMountedRef.current) return
      setVoiceState(VOICE_STATES.IDLE)
      utteranceRef.current = null
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [isTTSSupported, language, showError, voiceState, stopListening])

  const stopSpeaking = useCallback(() => {
    if (isTTSSupported) {
      window.speechSynthesis.cancel()
    }
    setVoiceState(VOICE_STATES.IDLE)
    utteranceRef.current = null
  }, [isTTSSupported])

  const toggleSpeaking = useCallback((text) => {
    if (voiceState === VOICE_STATES.SPEAKING) {
      stopSpeaking()
    } else {
      speak(text)
    }
  }, [voiceState, speak, stopSpeaking])

  useEffect(() => {
    if (!isTTSSupported) return
    const loadVoices = () => window.speechSynthesis.getVoices()
    loadVoices()
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [isTTSSupported])

  return {
    voiceState,
    interimText,
    finalText,
    errorMessage,
    language,
    autoSpeak,
    isSupported,
    isTTSSupported,
    isListening: voiceState === VOICE_STATES.LISTENING,
    isSpeaking: voiceState === VOICE_STATES.SPEAKING,
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
    toggleSpeaking,
    setLanguage,
    setAutoSpeak,
    clearError,
    setFinalText,
    languages: LANGUAGES,
  }
}
