// Cadence - Translation Action Bar
import React from 'react'
import { ChevronDown, Languages, RefreshCw } from 'lucide-react'

interface TranslationActionBarProps {
  segmentCount: number
  isTranslating: boolean
  isTranslatedForCurrentLang: boolean
  showTranslation: boolean
  selectedLangName: string
  translateProgress: { done: number; total: number } | null
  onTranslate: () => void
  onOpenSettings: () => void
}

export const TranslationActionBar: React.FC<TranslationActionBarProps> = ({
  segmentCount,
  isTranslating,
  isTranslatedForCurrentLang,
  showTranslation,
  selectedLangName,
  translateProgress,
  onTranslate,
  onOpenSettings,
}) => {
  return (
    <div className="yt-transcript-action-bar">
      <div className="yt-transcript-engine-group">
        <button
          type="button"
          className={`yt-transcript-chip-btn ${
            isTranslatedForCurrentLang && showTranslation ? 'active' : ''
          }`}
          title={
            isTranslating
              ? `Translating to ${selectedLangName} (${translateProgress?.done ?? 0}/${translateProgress?.total ?? segmentCount})...`
              : isTranslatedForCurrentLang
              ? showTranslation
                ? `Subtitles (${selectedLangName}) ON - Click to hide`
                : `Subtitles (${selectedLangName}) OFF - Click to show`
              : `Translate subtitles to ${selectedLangName}`
          }
          disabled={isTranslating}
          onClick={onTranslate}
          aria-label="Translate subtitles"
        >
          {isTranslating ? (
            <RefreshCw size={13} className="yt-icon-spin" />
          ) : (
            <Languages size={13} />
          )}
          <span>
            {isTranslating
              ? 'Translating…'
              : isTranslatedForCurrentLang
              ? showTranslation
                ? 'Subtitles ON'
                : 'Subtitles OFF'
              : 'Translate'}
          </span>
        </button>
      </div>

      {/* Language Pill */}
      <button
        type="button"
        className="yt-transcript-target-pill"
        onClick={onOpenSettings}
        title="Change language or settings"
        aria-label="Change language"
      >
        <span>→ {selectedLangName}</span>
        <ChevronDown size={11} />
      </button>
    </div>
  )
}
