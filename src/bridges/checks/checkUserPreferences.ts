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

  if (!isWCAGDisplayed) {
    penpot.localStorage.setItem('is_wcag_displayed', 'true')
    isWCAGDisplayed = 'true'
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
    },
  })
}

export default checkUserPreferences
