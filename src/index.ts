import zh_Hans_CN from '@ui-lib/content/translations/zh-Hans-CN.json'
import pt_BR from '@ui-lib/content/translations/pt-BR.json'
import fr_FR from '@ui-lib/content/translations/fr-FR.json'
import en_US from '@ui-lib/content/translations/en-US.json'
import { DevTools, Tolgee } from '@tolgee/web'
import { FormatIcu } from '@tolgee/format-icu'
import globalConfig from './global.config'
import loadUI from './bridges/loadUI'

export const tolgee = Tolgee()
  .use(DevTools())
  .use(FormatIcu())
  .init({
    language: globalConfig.lang,
    apiUrl: import.meta.env.VITE_TOLGEE_URL,
    apiKey: import.meta.env.VITE_TOLGEE_API_KEY,
    fallbackLanguage: globalConfig.lang,
    staticData: {
      'zh-Hans-CN': zh_Hans_CN,
      'pt-BR': pt_BR,
      'fr-FR': fr_FR,
      'en-US': en_US,
    },
  })

// UI
loadUI()
