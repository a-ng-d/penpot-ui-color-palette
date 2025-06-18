import { userConsent } from '../../utils/userConsent'
import globalConfig from '../../global.config'

const checkUserConsent = async () => {
  const currentUserConsentVersion = penpot.root?.getPluginData(
    'user_consent_version'
  )

  const userConsentData = await Promise.all(
    userConsent.map(async (consent) => {
      return {
        ...consent,
        isConsented:
          penpot.root?.getPluginData(`${consent.id}_user_consent`) === 'true',
      }
    })
  )

  return penpot.ui.sendMessage({
    type: 'CHECK_USER_CONSENT',
    data: {
      mustUserConsent:
        currentUserConsentVersion !==
          globalConfig.versions.userConsentVersion ||
        currentUserConsentVersion === undefined,
      userConsent: userConsentData,
    },
  })
}

export default checkUserConsent
