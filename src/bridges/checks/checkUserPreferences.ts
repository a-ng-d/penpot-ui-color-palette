import { locales } from '../../content/locales'
import { Language } from '../../types/translations'

const checkUserPreferences = async () => {
  const isWCAGDisplayed = penpot.root?.getPluginData('is_wcag_displayed')
  const isAPCADisplayed = penpot.root?.getPluginData('is_apca_displayed')
  const canDeepSyncStyles = penpot.root?.getPluginData('can_deep_sync_styles')
  const canDeepSyncVariables = penpot.root?.getPluginData(
    'can_deep_sync_variables'
  )
  const isVsCodeMessageDisplayed = penpot.root?.getPluginData(
    'is_vscode_message_displayed'
  )
  const userLanguage = penpot.root?.getPluginData('user_language')

  if (isWCAGDisplayed === null)
    penpot.root?.setPluginData('is_wcag_displayed', 'true')

  if (isAPCADisplayed === null)
    penpot.root?.setPluginData('is_apca_displayed', 'true')

  if (canDeepSyncStyles === null)
    penpot.root?.setPluginData('can_deep_sync_styles', 'false')

  if (canDeepSyncVariables === null)
    penpot.root?.setPluginData('can_deep_sync_variables', 'false')

  if (isVsCodeMessageDisplayed === null)
    penpot.root?.setPluginData('is_vscode_message_displayed', 'true')

  if (userLanguage === null)
    penpot.root?.setPluginData('user_language', 'en-US')

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
