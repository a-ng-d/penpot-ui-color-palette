import { Language } from '../../types/translations'
import { locales } from '../../content/locales'

const checkUserPreferences = async () => {
  const isWCAGDisplayed = penpot.localStorage.getItem('is_wcag_displayed')
  const isAPCADisplayed = penpot.localStorage.getItem('is_apca_displayed')
  const canDeepSyncStyles = penpot.localStorage.getItem('can_deep_sync_styles')
  const canDeepSyncVariables = penpot.localStorage.getItem(
    'can_deep_sync_variables'
  )
  const isVsCodeMessageDisplayed = penpot.localStorage.getItem(
    'is_vscode_message_displayed'
  )
  const userLanguage = penpot.localStorage.getItem('user_language')

  if (isWCAGDisplayed === null)
    penpot.localStorage.setItem('is_wcag_displayed', 'true')

  if (isAPCADisplayed === null)
    penpot.localStorage.setItem('is_apca_displayed', 'true')

  if (canDeepSyncStyles === null)
    penpot.localStorage.setItem('can_deep_sync_styles', 'false')

  if (canDeepSyncVariables === null)
    penpot.localStorage.setItem('can_deep_sync_variables', 'false')

  if (isVsCodeMessageDisplayed === null)
    penpot.localStorage.setItem('is_vscode_message_displayed', 'true')

  if (userLanguage === null)
    penpot.localStorage.setItem('user_language', 'en-US')

  locales.set((userLanguage as Language) ?? 'en-US')

  return penpot.ui.sendMessage({
    type: 'CHECK_USER_PREFERENCES',
    data: {
      isWCAGDisplayed: isWCAGDisplayed === 'true',
      isAPCADisplayed: isAPCADisplayed === 'true',
      canDeepSyncStyles: canDeepSyncStyles === 'true',
      canDeepSyncVariables: canDeepSyncVariables === 'true',
      isVsCodeMessageDisplayed:
        isVsCodeMessageDisplayed === null ||
        isVsCodeMessageDisplayed === undefined
          ? true
          : isVsCodeMessageDisplayed === 'true',
      userLanguage: userLanguage ?? 'en-US',
    },
  })
}

export default checkUserPreferences
