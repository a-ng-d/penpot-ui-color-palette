import { Language } from '../../types/translations'
import { locales } from '../../content/locales'

const checkUserPreferences = async () => {
  let isWCAGDisplayed = penpot.localStorage.getItem('is_wcag_displayed')
  let isAPCADisplayed = penpot.localStorage.getItem('is_apca_displayed')
  let canDeepSyncStyles = penpot.localStorage.getItem('can_deep_sync_styles')
  let canDeepSyncVariables = penpot.localStorage.getItem(
    'can_deep_sync_variables'
  )
  let isVsCodeMessageDisplayed = penpot.localStorage.getItem(
    'is_vscode_message_displayed'
  )
  let userLanguage = penpot.localStorage.getItem('user_language')

  if (!isWCAGDisplayed) {
    penpot.localStorage.setItem('is_wcag_displayed', 'true')
    isWCAGDisplayed = 'true'
  }

  if (isAPCADisplayed) {
    penpot.localStorage.setItem('is_apca_displayed', 'true')
    isAPCADisplayed = 'true'
  }

  if (!canDeepSyncStyles) {
    penpot.localStorage.setItem('can_deep_sync_styles', 'false')
    canDeepSyncStyles = 'false'
  }

  if (!canDeepSyncVariables) {
    penpot.localStorage.setItem('can_deep_sync_variables', 'false')
    canDeepSyncVariables = 'false'
  }

  if (!isVsCodeMessageDisplayed) {
    penpot.localStorage.setItem('is_vscode_message_displayed', 'true')
    isVsCodeMessageDisplayed = 'true'
  }

  if (!userLanguage) {
    penpot.localStorage.setItem('user_language', 'en-US')
    userLanguage = 'en-US'
  }

  locales.set((userLanguage as Language) ?? 'en-US')

  return penpot.ui.sendMessage({
    type: 'CHECK_USER_PREFERENCES',
    data: {
      isWCAGDisplayed: isWCAGDisplayed,
      isAPCADisplayed: isAPCADisplayed,
      canDeepSyncStyles: canDeepSyncStyles,
      canDeepSyncVariables: canDeepSyncVariables,
      isVsCodeMessageDisplayed: isVsCodeMessageDisplayed,
      userLanguage: userLanguage,
    },
  })
}

export default checkUserPreferences
