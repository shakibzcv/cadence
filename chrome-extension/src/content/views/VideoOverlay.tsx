import { useState, useEffect } from 'react'
import { useVideoId } from '../hooks/useVideoId.ts'
import { useActiveSegmentIndex } from '../hooks/useActiveSegmentIndex.ts'
import { useTranscriptStore } from '../store/transcriptStore.ts'
import { STORAGE_KEYS } from '../../shared/constants/index.ts'
import { storageGet } from '../../shared/storage/index.ts'

export default function VideoOverlay() {
  // Subscribes directly to videoId and shared in-memory transcript store
  useVideoId()
  const { transcriptData, showTranslation, isVideoOverlayEnabled } = useTranscriptStore()
  const [targetLang, setTargetLang] = useState<string>('')

  useEffect(() => {
    storageGet<string>(STORAGE_KEYS.targetLanguage).then((lang) => {
      if (lang) setTargetLang(lang)
    })
    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      const listener = (changes: any, areaName: string) => {
        if (areaName === 'local' || !areaName) {
          if (changes[STORAGE_KEYS.targetLanguage]?.newValue) {
            setTargetLang(changes[STORAGE_KEYS.targetLanguage].newValue)
          }
        }
      }
      chrome.storage.onChanged.addListener(listener)
      return () => chrome.storage.onChanged.removeListener(listener)
    }
  }, [])

  // Identify currently active segment (re-renders only when the active line changes)
  const segments = transcriptData?.segments
  const activeIndex = useActiveSegmentIndex(segments ?? [])
  const activeSegment = segments && activeIndex >= 0 ? segments[activeIndex] : null

  // If overlay is disabled or there is no active speech segment, render nothing
  if (!isVideoOverlayEnabled || !activeSegment) {
    return null
  }

  const isTranslatedForCurrentLang =
    Boolean(transcriptData?.targetLanguage) &&
    (!targetLang || transcriptData?.targetLanguage === targetLang)

  const hasTranslation =
    showTranslation &&
    isTranslatedForCurrentLang &&
    Boolean(activeSegment.translatedText)

  return (
    <div className="cadence-video-subtitle-card" role="status" aria-live="polite">
      <div className="cadence-sub-line-orig">{activeSegment.text}</div>
      {hasTranslation && (
        <div className="cadence-sub-line-trans">{activeSegment.translatedText}</div>
      )}
    </div>
  )
}
