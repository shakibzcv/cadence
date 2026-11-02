// Cadence - Background Service Worker Router
// Dispatches incoming messages to dedicated handlers without CORS restrictions.

import { EVENTS, MESSAGE_ACTIONS } from '../shared/constants/index.ts'
import type { BackgroundRequest } from '../shared/types/messages.ts'
import { handleTranslateBatch, handleTranslateText } from './handlers/translateHandler.ts'

chrome.runtime.onMessage.addListener((request: BackgroundRequest, _sender, sendResponse) => {
  if (request.action === MESSAGE_ACTIONS.translateAll || request.action === MESSAGE_ACTIONS.translateBatch) {
    handleTranslateBatch(request).then(sendResponse)
    return true
  }

  if (request.action === MESSAGE_ACTIONS.translateText) {
    handleTranslateText(request).then(sendResponse)
    return true
  }

  return false
})

// Clicking toolbar icon toggles the on-page Cadence transcript panel on YouTube
if (typeof chrome !== 'undefined' && chrome.action?.onClicked) {
  chrome.action.onClicked.addListener((tab) => {
    if (tab?.id && tab.url && tab.url.includes('youtube.com')) {
      chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          world: 'MAIN',
          args: [EVENTS.panelToggleClick],
          func: (eventName: string) => {
            window.dispatchEvent(new CustomEvent(eventName))
          },
        })
        .catch(() => {})
    }
  })
}
