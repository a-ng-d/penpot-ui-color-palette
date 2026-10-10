import globalConfig from '../../global.config'
import { tolgee } from '../..'

const checkUserPreferences = async () => {
  let isWCAGDisplayed = penpot.localStorage.getItem('is_wcag_displayed')
  let isAPCADisplayed = penpot.localStorage.getItem('is_apca_displayed')
  let isWCAGIntervalDisplayed = penpot.localStorage.getItem(
    'is_wcag_interval_displayed'
  )
  let isAPCAIntervalDisplayed = penpot.localStorage.getItem(
    'is_apca_interval_displayed'
  )
  let canDeepSyncStyles = penpot.localStorage.getItem('can_deep_sync_styles')
  let canDeepSyncVariables = penpot.localStorage.getItem(
    'can_deep_sync_variables'
  )
  let canDeepSyncTokens = penpot.localStorage.getItem('can_deep_sync_tokens')
  let isSuggestedLanguageDisplayed = penpot.localStorage.getItem(
    'is_suggested_language_displayed'
  )
  let userLanguage = penpot.localStorage.getItem('user_language')
  let isOnboardingRead = penpot.localStorage.getItem('is_onboarding_read')
  let palettesView = penpot.localStorage.getItem('palettes_view')

  if (!isWCAGDisplayed) {
    penpot.localStorage.setItem('is_wcag_displayed', 'false')
    isWCAGDisplayed = 'false'
  }

  if (!isAPCADisplayed) {
    penpot.localStorage.setItem('is_apca_displayed', 'true')
    isAPCADisplayed = 'true'
  }

  if (!isWCAGIntervalDisplayed) {
    penpot.localStorage.setItem('is_wcag_interval_displayed', 'false')
    isWCAGIntervalDisplayed = 'false'
  }

  if (!isAPCAIntervalDisplayed) {
    penpot.localStorage.setItem('is_apca_interval_displayed', 'false')
    isAPCAIntervalDisplayed = 'false'
  }

  if (!canDeepSyncStyles) {
    penpot.localStorage.setItem('can_deep_sync_styles', 'false')
    canDeepSyncStyles = 'false'
  }

  if (!canDeepSyncVariables) {
    penpot.localStorage.setItem('can_deep_sync_variables', 'false')
    canDeepSyncVariables = 'false'
  }

  if (!canDeepSyncTokens) {
    penpot.localStorage.setItem('can_deep_sync_tokens', 'false')
    canDeepSyncTokens = 'false'
  }

  if (!isSuggestedLanguageDisplayed) {
    penpot.localStorage.setItem('is_suggested_language_displayed', 'true')
    isSuggestedLanguageDisplayed = 'true'
  }

  if (!userLanguage) {
    penpot.localStorage.setItem('user_language', globalConfig.lang)
    userLanguage = globalConfig.lang
  }

  if (!isOnboardingRead) {
    penpot.localStorage.setItem('is_onboarding_read', 'false')
    isOnboardingRead = 'false'
  }

  if (!palettesView) {
    penpot.localStorage.setItem('palettes_view', 'LIST')
    palettesView = 'LIST'
  }

  tolgee.changeLanguage(userLanguage)

  return penpot.ui.sendMessage({
    type: 'CHECK_USER_PREFERENCES',
    data: {
      isWCAGDisplayed: isWCAGDisplayed === 'true',
      isAPCADisplayed: isAPCADisplayed === 'true',
      isWCAGIntervalDisplayed: isWCAGIntervalDisplayed === 'true',
      isAPCAIntervalDisplayed: isAPCAIntervalDisplayed === 'true',
      canDeepSyncStyles: canDeepSyncStyles === 'true',
      canDeepSyncVariables: canDeepSyncVariables === 'true',
      canDeepSyncTokens: canDeepSyncTokens === 'true',
      isSuggestedLanguageDisplayed: isSuggestedLanguageDisplayed === 'true',
      userLanguage: userLanguage,
      isOnboardingRead: isOnboardingRead === 'true',
      palettesView: palettesView,
    },
  })
}

export default checkUserPreferences
