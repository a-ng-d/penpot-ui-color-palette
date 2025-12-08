import zh_Hans_CN from '@ui-lib/content/translations/zh-Hans-CN.json'
import pt_BR from '@ui-lib/content/translations/pt-BR.json'
import fr_FR from '@ui-lib/content/translations/fr-FR.json'
import en_US from '@ui-lib/content/translations/en-US.json'
import { createI18n } from './utils/i18n'
import globalConfig from './global.config'
import loadUI from './bridges/loadUI'

export const tolgee: ReturnType<typeof createI18n> = createI18n(
  {
    'zh-Hans-CN': zh_Hans_CN,
    'pt-BR': pt_BR,
    'fr-FR': fr_FR,
    'en-US': en_US,
  },
  globalConfig.lang
)

// UI
loadUI()
