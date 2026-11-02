// Cadence - Background Message Protocol Types
import type { MESSAGE_ACTIONS } from '../constants/events.ts'

export interface TranslateBatchRequest {
  action: typeof MESSAGE_ACTIONS.translateAll | typeof MESSAGE_ACTIONS.translateBatch
  texts: string[]
  sourceLang?: string
  targetLang?: string
}

export interface TranslateBatchResponse {
  success: boolean
  translatedTexts?: string[]
  detectedSource?: string
  error?: string
}

export interface TranslateTextRequest {
  action: typeof MESSAGE_ACTIONS.translateText
  text: string
  sourceLang?: string
  targetLang?: string
}

export interface TranslateTextResponse {
  success: boolean
  translatedText?: string
  detectedSource?: string
  error?: string
}

export type BackgroundRequest =
  | TranslateBatchRequest
  | TranslateTextRequest
