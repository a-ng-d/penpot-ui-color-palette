import globalConfig from '../global.config'
import { locales } from '../content/locales'
import updateThemes from './updates/updateThemes'
import updateSettings from './updates/updateSettings'
import updateScale from './updates/updateScale'
import updatePalette from './updates/updatePalette'
import updateLocalStyles from './updates/updateLocalStyles'
import updateDocument from './updates/updateDocument'
import updateColors from './updates/updateColors'
import processSelection from './processSelection'
import jumpToPalette from './jumpToPalette'
import getPalettesOnCurrentPage from './getPalettesOnCurrentPage'
import exportXml from './exports/exportXml'
import exportUIKit from './exports/exportUIKit'
import exportTailwind from './exports/exportTailwind'
import exportSwiftUI from './exports/exportSwiftUI'
import exportKt from './exports/exportKt'
import exportJsonTokensStudio from './exports/exportJsonTokensStudio'
import exportJsonDtcg from './exports/exportJsonDtcg'
import exportJsonAmznStyleDictionary from './exports/exportJsonAmznStyleDictionary'
import exportJson from './exports/exportJson'
import exportCsv from './exports/exportCsv'
import exportCss from './exports/exportCss'
import enableTrial from './enableTrial'
import deletePalette from './creations/deletePalette'
import createPalette from './creations/createPalette'
import createLocalStyles from './creations/createLocalStyles'
import createFromRemote from './creations/createFromRemote'
import createFromDuplication from './creations/createFromDuplication'
import createFromDocument from './creations/createFromDocument'
import createDocument from './creations/createDocument'
import checkUserPreferences from './checks/checkUserPreferences'
import checkUserLicense from './checks/checkUserLicense'
import checkUserConsent from './checks/checkUserConsent'
import checkTrialStatus from './checks/checkTrialStatus'
import checkAnnouncementsStatus from './checks/checkAnnouncementsStatus'

/*penpot.currentPage?.getPluginDataKeys().forEach((key) => {
  if (key.startsWith('palette_')) penpot.currentPage?.setPluginData(key, '')
})*/

interface Window {
  width: number
  height: number
}

const loadUI = async () => {
  const windowSize: Window = {
    width: parseFloat(
      penpot.root?.getPluginData('plugin_window_width') ?? '640'
    ),
    height: parseFloat(
      penpot.root?.getPluginData('plugin_window_height') ?? '640'
    ),
  }

  penpot.ui.open(
    `${locales.get().name}${locales.get().separator}${locales.get().tagline}`,
    globalConfig.urls.uiUrl,
    {
      width: windowSize.width,
      height: windowSize.height,
    }
  )

  setTimeout(() => {
    // Checks
    checkUserConsent()
      .then(() => checkTrialStatus())
      .then(() => checkUserPreferences())
      .then(() => checkUserLicense())
      .then(() => processSelection())

    // Canvas > UI
    penpot.ui.sendMessage({
      type: 'CHECK_USER_AUTHENTICATION',
      data: {
        id: penpot.currentUser.id,
        fullName: penpot.currentUser.name,
        avatar: penpot.currentUser.avatarUrl,
        accessToken: penpot.root?.getPluginData('supabase_access_token'),
        refreshToken: penpot.root?.getPluginData('supabase_refresh_token'),
      },
    })
    penpot.ui.sendMessage({
      type: 'SET_THEME',
      data: {
        theme: penpot.theme === 'light' ? 'penpot-light' : 'penpot-dark',
      },
    })
    penpot.ui.sendMessage({
      type: 'CHECK_ANNOUNCEMENTS_VERSION',
    })
  }, 1000)

  // UI > Canvas
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  penpot.ui.onMessage(async (msg: any) => {
    const path = msg.pluginMessage

    const actions: { [key: string]: () => void } = {
      CHECK_USER_CONSENT: () => checkUserConsent(),
      CHECK_ANNOUNCEMENTS_STATUS: () =>
        checkAnnouncementsStatus(path.data.version),
      //
      UPDATE_SCALE: () => updateScale(path),
      UPDATE_COLORS: () => updateColors(path),
      UPDATE_THEMES: () => updateThemes(path),
      UPDATE_SETTINGS: () => updateSettings(path),
      UPDATE_PALETTE: () =>
        updatePalette({
          msg: path,
          isAlreadyUpdated: path.isAlreadyUpdated,
          shouldLoadPalette: path.shouldLoadPalette,
        }),
      UPDATE_DOCUMENT: () =>
        updateDocument(path.view)
          .finally(() => penpot.ui.sendMessage({ type: 'STOP_LOADER' }))
          .catch((error) => {
            penpot.ui.sendMessage({
              type: 'POST_MESSAGE',
              data: {
                type: 'ERROR',
                message: error.message,
              },
            })
          }),
      UPDATE_LANGUAGE: () => {
        penpot.root?.setPluginData('user_language', path.data.lang)
        locales.set(path.data.lang)
      },
      //
      CREATE_PALETTE: () =>
        createPalette(path).finally(() =>
          penpot.ui.sendMessage({ type: 'STOP_LOADER' })
        ),
      CREATE_PALETTE_FROM_DOCUMENT: () =>
        createFromDocument().finally(() =>
          penpot.ui.sendMessage({ type: 'STOP_LOADER' })
        ),
      CREATE_PALETTE_FROM_REMOTE: () =>
        createFromRemote(path)
          .catch((error) => {
            penpot.ui.sendMessage({
              type: 'POST_MESSAGE',
              data: {
                type: 'INFO',
                message: error.message,
              },
            })
          })
          .finally(() => penpot.ui.sendMessage({ type: 'STOP_LOADER' })),
      SYNC_LOCAL_STYLES: async () =>
        createLocalStyles(path.id)
          .then(async (message) => [message, await updateLocalStyles(path.id)])
          .then((messages) =>
            penpot.ui.sendMessage({
              type: 'POST_MESSAGE',
              data: {
                type: 'INFO',
                message: messages.join(locales.get().separator),
                timer: 10000,
              },
            })
          )
          .finally(() => penpot.ui.sendMessage({ type: 'STOP_LOADER' }))
          .catch((error) => {
            penpot.ui.sendMessage({
              type: 'POST_MESSAGE',
              data: {
                type: 'ERROR',
                message: error.message,
              },
            })
          }),
      CREATE_DOCUMENT: () =>
        createDocument(path.id, path.view)
          .finally(() => penpot.ui.sendMessage({ type: 'STOP_LOADER' }))
          .catch((error) => {
            penpot.ui.sendMessage({
              type: 'POST_MESSAGE',
              data: {
                type: 'ERROR',
                message: error.message,
              },
            })
          }),
      //
      EXPORT_PALETTE: () => {
        path.export === 'TOKENS_DTCG' &&
          exportJsonDtcg(path.id, path.colorSpace)
        path.export === 'TOKENS_GLOBAL' && exportJson(path.id)
        path.export === 'TOKENS_AMZN_STYLE_DICTIONARY' &&
          exportJsonAmznStyleDictionary(path.id)
        path.export === 'TOKENS_TOKENS_STUDIO' &&
          exportJsonTokensStudio(path.id)
        path.export === 'CSS' && exportCss(path.id, path.colorSpace)
        path.export === 'TAILWIND' && exportTailwind(path.id)
        path.export === 'APPLE_SWIFTUI' && exportSwiftUI(path.id)
        path.export === 'APPLE_UIKIT' && exportUIKit(path.id)
        path.export === 'ANDROID_COMPOSE' && exportKt(path.id)
        path.export === 'ANDROID_XML' && exportXml(path.id)
        path.export === 'CSV' && exportCsv(path.id)
      },
      //
      POST_MESSAGE: () => {
        penpot.ui.sendMessage({
          type: 'POST_MESSAGE',
          data: {
            type: path.data.type,
            message: path.data.message,
          },
        })
      },
      SET_ITEMS: () => {
        path.items.forEach((item: { key: string; value: unknown }) => {
          if (typeof item.value === 'object')
            penpot.root?.setPluginData(item.key, JSON.stringify(item.value))
          else if (
            typeof item.value === 'boolean' ||
            typeof item.value === 'number'
          )
            penpot.root?.setPluginData(item.key, item.value.toString())
          else penpot.root?.setPluginData(item.key, item.value as string)
        })
      },
      GET_ITEMS: async () =>
        path.items.map(async (item: string) => {
          const value = penpot.root?.getPluginData(item)
          if (value && typeof value === 'string')
            penpot.ui.sendMessage({
              type: `GET_ITEM_${item.toUpperCase()}`,
              value: JSON.parse(value),
            })
        }),
      DELETE_ITEMS: () =>
        path.items.forEach(async (item: string) =>
          penpot.root?.setPluginData(item, '')
        ),
      SET_DATA: () =>
        path.items.forEach((item: { key: string; value: string }) =>
          penpot.root?.setPluginData(item.key, JSON.stringify(item.value))
        ),
      GET_DATA: async () =>
        path.items.map(async (item: string) => {
          const value = penpot.root?.getPluginData(item)
          if (value && typeof value === 'string')
            penpot.ui.sendMessage({
              type: `GET_DATA_${item.toUpperCase()}`,
              value: JSON.parse(value),
            })
        }),
      DELETE_DATA: () =>
        path.items.forEach(async (item: string) =>
          penpot.root?.setPluginData(item, '')
        ),
      //
      OPEN_IN_BROWSER: () => window.open(msg.url, '_blank'),
      GET_PALETTES: async () => await getPalettesOnCurrentPage(),
      JUMP_TO_PALETTE: async () =>
        await jumpToPalette(path.id).catch((error) =>
          penpot.ui.sendMessage({
            type: 'POST_MESSAGE',
            data: {
              type: 'ERROR',
              message: error.message,
            },
          })
        ),
      DUPLICATE_PALETTE: async () =>
        await createFromDuplication(path.id)
          .finally(async () => await getPalettesOnCurrentPage())
          .catch((error) => {
            penpot.ui.sendMessage({
              type: 'POST_MESSAGE',
              data: {
                type: 'ERROR',
                message: error.message,
              },
            })
          }),
      DELETE_PALETTE: async () =>
        await deletePalette(path.id).finally(
          async () => await getPalettesOnCurrentPage()
        ),
      //
      GET_PRO_PLAN: async () =>
        window.open(globalConfig.urls.storeUrl, '_blank')?.focus(),
      GET_TRIAL: async () =>
        penpot.ui.sendMessage({
          type: 'GET_TRIAL',
          data: {
            id: penpot.currentUser.id,
          },
        }),
      WELCOME_TO_PRO: async () =>
        penpot.ui.sendMessage({
          type: 'WELCOME_TO_PRO',
          data: {
            id: penpot.currentUser.id,
          },
        }),
      ENABLE_PRO_PLAN: async () =>
        penpot.ui.sendMessage({
          type: 'ENABLE_PRO_PLAN',
          data: {
            id: penpot.currentUser.id,
          },
        }),
      LEAVE_PRO_PLAN: async () =>
        penpot.ui.sendMessage({
          type: 'LEAVE_PRO_PLAN',
          data: {
            id: penpot.currentUser.id,
          },
        }),
      ENABLE_TRIAL: async () => {
        enableTrial(path.data.trialTime, path.data.trialVersion).then(() =>
          checkTrialStatus()
        )
      },
      SIGN_OUT: () =>
        penpot.ui.sendMessage({
          type: 'SIGN_OUT',
          data: {
            connectionStatus: 'UNCONNECTED',
            userFullName: '',
            userAvatar: '',
            userId: undefined,
          },
        }),
      //
      DEFAULT: () => null,
    }

    try {
      return actions[path.type]?.()
    } catch {
      return actions['DEFAULT']?.()
    }
  })

  // Listeners
  penpot.on('pagechange', () => {
    penpot.ui.sendMessage({
      type: 'LOAD_PALETTES',
    })
    penpot.ui.sendMessage({
      type: 'RESET_PALETTE',
    })
    setTimeout(() => getPalettesOnCurrentPage(), 1000)
  })

  penpot.on('selectionchange', () => processSelection())

  penpot.on('themechange', () => {
    penpot.ui.sendMessage({
      type: 'SET_THEME',
      data: {
        theme: penpot.theme === 'light' ? 'penpot-light' : 'penpot-dark',
      },
    })
  })
}

export default loadUI
