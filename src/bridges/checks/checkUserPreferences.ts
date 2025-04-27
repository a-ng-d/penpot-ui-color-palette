import { locals } from '../../content/locals'
import { Language } from '../../types/app'

const checkUserPreferences = async () => {
  const isWCAGDisplayed = penpot.root?.getPluginData('is_wcag_displayed')
  const isAPCADisplayed = penpot.root?.getPluginData('is_apca_displayed')
  const canDeepSyncPalette = penpot.root?.getPluginData('can_deep_sync_palette')
  const canDeepSyncStyles = penpot.root?.getPluginData('can_deep_sync_styles')
  const userLanguage = penpot.root?.getPluginData('user_language')

  if (isWCAGDisplayed === null)
    penpot.root?.setPluginData('is_wcag_displayed', 'true')

  if (isAPCADisplayed === null)
    penpot.root?.setPluginData('is_apca_displayed', 'true')

  if (canDeepSyncPalette === null)
    penpot.root?.setPluginData('can_deep_sync_palette', 'false')

  if (canDeepSyncStyles === null)
    penpot.root?.setPluginData('can_deep_sync_styles', 'false')

  if (userLanguage === null)
    penpot.root?.setPluginData('user_language', 'en-US')

  locals.set((userLanguage as Language) ?? 'en-US')

  return penpot.ui.sendMessage({
    type: 'CHECK_USER_PREFERENCES',
    data: {
      isWCAGDisplayed: isWCAGDisplayed === 'true',
      isAPCADisplayed: isAPCADisplayed === 'true',
      canDeepSyncPalette: canDeepSyncPalette === 'true',
      canDeepSyncStyles: canDeepSyncStyles === 'true',
      userLanguage: userLanguage ?? 'en-US',
    },
  })
}

export default checkUserPreferences
