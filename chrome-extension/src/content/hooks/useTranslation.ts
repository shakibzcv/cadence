// Cadence - Translation Orchestration Hook
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import type { TranscriptData, TranscriptSegment } from '../types.ts'
import {
  SUPPORTED_LANGUAGES,
  saveTranscript,
  translateSegments,
  getCurrentVideoId,
} from '../transcriptService.ts'
import { STORAGE_KEYS } from '../../shared/constants/index.ts'

interface UseTranslationParams {
  transcriptData: TranscriptData | null
  setTranscriptData: (updater: TranscriptData | null | ((prev: TranscriptData | null) => TranscriptData | null)) => void
  targetLang: string
  setTargetLang: (lang: string) => void
  showTranslation: boolean
  setShowTranslation: (show: boolean) => void
  videoId: string
}

export function useTranslation({
  transcriptData,
  setTranscriptData,
  targetLang,
  setTargetLang,
  showTranslation,
  setShowTranslation,
  videoId,
}: UseTranslationParams) {
  const [isTranslating, setIsTranslating] = useState<boolean>(false)
  const [translateProgress, setTranslateProgress] = useState<{ done: number; total: number } | null>(null)
  const [translateError, setTranslateError] = useState<string | null>(null)

  const segments = transcriptData?.segments || []

  // Check if segments currently have translations
  const hasTranslations = useMemo(() => {
    return segments.some((s) => Boolean(s.translatedText))
  }, [segments])

  const isTranslatedForCurrentLang = useMemo(() => {
    return (
      hasTranslations &&
      Boolean(transcriptData?.targetLanguage) &&
      transcriptData?.targetLanguage === targetLang
    )
  }, [hasTranslations, transcriptData?.targetLanguage, targetLang])

  const selectedLangObj = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === targetLang) || { code: 'en', name: 'English' }
  }, [targetLang])

  // Track latest references to prevent stale closures
  const transcriptDataRef = useRef<TranscriptData | null>(transcriptData)
  useEffect(() => {
    transcriptDataRef.current = transcriptData
  }, [transcriptData])

  const performTranslation = useCallback(
    async (langToUse: string) => {
      const currentData = transcriptDataRef.current
      if (!currentData || !currentData.segments || currentData.segments.length === 0) return
      const thisVideoId = videoId || getCurrentVideoId()

      setIsTranslating(true)
      setTranslateError(null)
      const baseSegments = currentData.originalSegments || currentData.segments
      setTranslateProgress({ done: 0, total: baseSegments.length })
      setShowTranslation(true)

      try {
        const res = await translateSegments(
          baseSegments,
          langToUse,
          currentData.detectedLanguage,
          (done, total) => setTranslateProgress({ done, total }),
          'cadence',
          (partialSegments) => {
            if (getCurrentVideoId() !== thisVideoId) return

            setTranscriptData((prev) => {
              if (!prev) return prev
              return {
                ...prev,
                segments: partialSegments,
                originalSegments: prev.originalSegments || baseSegments.map((s: TranscriptSegment) => ({ ...s })),
                targetLanguage: langToUse,
                translationEngine: 'cadence',
                showTranslation: true,
              }
            })
          }
        )

        if (getCurrentVideoId() !== thisVideoId) {
          setIsTranslating(false)
          setTranslateProgress(null)
          return
        }

        const updated: TranscriptData = {
          ...currentData,
          segments: res.translatedSegments,
          originalSegments: currentData.originalSegments || baseSegments.map((s: TranscriptSegment) => ({ ...s })),
          detectedLanguage: res.detectedSource,
          targetLanguage: langToUse,
          translationEngine: 'cadence',
          showTranslation: true,
        }
        setTranscriptData(updated)
        saveTranscript(thisVideoId, updated)
        setShowTranslation(true)
        setIsTranslating(false)
        setTranslateProgress(null)
      } catch (err: any) {
        if (getCurrentVideoId() === thisVideoId) {
          console.error('[Cadence] Translation error:', err)
          setTranslateError(err.message || 'Translation failed')
          setIsTranslating(false)
          setTranslateProgress(null)
        }
      }
    },
    [videoId, setTranscriptData, setShowTranslation]
  )

  // React to storage target language changes (only update targetLang, DO NOT auto-translate)
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      const listener = (changes: any, areaName: string) => {
        if (areaName === 'local' || !areaName) {
          if (changes[STORAGE_KEYS.targetLanguage]) {
            const newLang = changes[STORAGE_KEYS.targetLanguage].newValue
            if (newLang && typeof newLang === 'string') {
              setTargetLang(newLang)
            }
          }
        }
      }
      chrome.storage.onChanged.addListener(listener)
      return () => chrome.storage.onChanged.removeListener(listener)
    }
  }, [setTargetLang])

  const handleTranslateCadence = useCallback(async () => {
    if (!transcriptData || segments.length === 0) return
    setTranslateError(null)
    if (isTranslating) return

    if (isTranslatedForCurrentLang) {
      setShowTranslation(!showTranslation)
      return
    }

    await performTranslation(targetLang)
  }, [transcriptData, segments.length, isTranslating, isTranslatedForCurrentLang, showTranslation, setShowTranslation, performTranslation, targetLang])

  return {
    isTranslating,
    translateProgress,
    translateError,
    setTranslateError,
    hasTranslations,
    isTranslatedForCurrentLang,
    selectedLangObj,
    handleTranslateCadence,
    performTranslation,
  }
}
