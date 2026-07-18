import zh_Hans_CN from '@ui-lib/content/translations/zh-Hans-CN.json'
import pt_BR from '@ui-lib/content/translations/pt-BR.json'
import ko_KR from '@ui-lib/content/translations/ko-KR.json'
import ja_JP from '@ui-lib/content/translations/ja-JP.json'
import fr_FR from '@ui-lib/content/translations/fr-FR.json'
import es_ES from '@ui-lib/content/translations/es-ES.json'
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
    'es-ES': es_ES,
    'ja-JP': ja_JP,
    'ko-KR': ko_KR,
  },
  globalConfig.lang
)

// UI
loadUI()

// Migration
const dataKeys = penpot.currentPage?.getPluginDataKeys()
  if (dataKeys !== undefined)
    dataKeys
      .filter((data: string) => data.includes('palette_'))
      .forEach((key: string) => {
        const data = penpot.currentPage?.getPluginData(key)
        if (data !== undefined)
          penpot.currentPage?.setSharedPluginData('uicp', key, data)
      })
