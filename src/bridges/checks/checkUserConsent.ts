import { userConsentVersion } from '../../config'
import { userConsent } from '../../utils/userConsent'

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
        currentUserConsentVersion !== userConsentVersion ||
        currentUserConsentVersion === undefined,
      userConsent: userConsentData,
    },
  })
}

export default checkUserConsent
