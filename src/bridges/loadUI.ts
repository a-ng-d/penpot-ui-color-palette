import setPagePalettesMigration from '../utils/setPagePalettesMigration'
import globalConfig from '../global.config'
import { tolgee } from '..'
import updateThemes from './updates/updateThemes'
import updateSettings from './updates/updateSettings'
import updateScale from './updates/updateScale'
import updatePalette from './updates/updatePalette'
import updateLocalTokens from './updates/updateLocalTokens'
import updateLocalStyles from './updates/updateLocalStyles'
import updateDocument from './updates/updateDocument'
import updateColors from './updates/updateColors'
import enableTrial from './plans/enableTrial'
import processSelection from './gets/processSelection'
import jumpToPalette from './gets/jumpToPalette'
import getPalettesOnCurrentPage from './gets/getPalettesOnCurrentPage'
import deletePalette from './deletions/deletePalette'
import createPaletteFromRemote from './creations/createPaletteFromRemote'
import createPaletteFromDuplication from './creations/createPaletteFromDuplication'
import createPaletteFromDocument from './creations/createPaletteFromDocument'
import createPalette from './creations/createPalette'
import createLocalTokens from './creations/createLocalTokens'
import createLocalStyles from './creations/createLocalStyles'
import createDocument from './creations/createDocument'
import checkUserPreferences from './checks/checkUserPreferences'
import checkUserLicense from './checks/checkUserLicense'
import checkUserConsent from './checks/checkUserConsent'
import checkTrialStatus from './checks/checkTrialStatus'
import checkCredits from './checks/checkCredits'
import checkAnnouncementsStatus from './checks/checkAnnouncementsStatus'

interface Window {
  width: number
  height: number
}

const loadUI = async () => {
  const windowSize: Window = {
    width: globalConfig.limits.width,
    height: globalConfig.limits.height,
  }

  penpot.ui.open(
    tolgee.t('fullName', {
      instance: globalConfig.env.isDev ? '/dev' : '/one',
    }),
    globalConfig.urls.uiUrl,
    {
      width: windowSize.width,
      height: windowSize.height,
    }
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  penpot.ui.onMessage(async (msg: any) => {
    const path = msg.pluginMessage

    const actions: { [key: string]: () => void } = {
      LOAD_DATA: () => {
        const accessToken = penpot.localStorage.getItem('supabase_access_token')
        const refreshToken = penpot.localStorage.getItem(
          'supabase_refresh_token'
        )

        penpot.ui.sendMessage({
          type: 'CHECK_USER_AUTHENTICATION',
          data: {
            id: penpot.currentUser.id,
            fullName: penpot.currentUser.name,
            avatar: penpot.currentUser.avatarUrl,
            accessToken: accessToken ? accessToken : undefined,
            refreshToken: refreshToken ? refreshToken : undefined,
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
        penpot.ui.sendMessage({
          type: 'CHECK_EDITOR',
          data: {
            id: penpot.currentUser.id,
            editor: globalConfig.env.editor,
          },
        })

        checkUserConsent(path.data.userConsent)
          .then(() => checkTrialStatus())
          .then(() => checkCredits())
          .then(() => checkUserLicense())
          .then(() => checkUserPreferences())
          .then(() => processSelection())
      },
      OPEN_DOCUMENT: async () => {
        processSelection()
      },
      //
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
              type: 'REPORT_ERROR',
              data: error,
            })
            penpot.ui.sendMessage({
              type: 'POST_MESSAGE',
              data: {
                type: 'ERROR',
                message: error.message,
              },
            })
          }),
      UPDATE_LANGUAGE: () => {
        penpot.localStorage.setItem('user_language', path.data.lang)
        tolgee.changeLanguage(path.data.lang)
      },
      //
      CREATE_PALETTE: () =>
        createPalette(path)
          .finally(() => {
            getPalettesOnCurrentPage()
            penpot.ui.sendMessage({ type: 'STOP_LOADER' })
          })
          .catch((error) => {
            penpot.ui.sendMessage({
              type: 'REPORT_ERROR',
              data: error,
            })
            penpot.ui.sendMessage({
              type: 'POST_MESSAGE',
              data: {
                type: 'ERROR',
                message: error.message,
              },
            })
          }),
      CREATE_PALETTE_FROM_DOCUMENT: () =>
        createPaletteFromDocument()
          .finally(() => {
            getPalettesOnCurrentPage()
            penpot.ui.sendMessage({ type: 'STOP_LOADER' })
          })
          .catch((error) => {
            penpot.ui.sendMessage({
              type: 'REPORT_ERROR',
              data: error,
            })
            penpot.ui.sendMessage({
              type: 'POST_MESSAGE',
              data: {
                type: 'INFO',
                message: error.message,
              },
            })
          }),
      CREATE_PALETTE_FROM_REMOTE: () =>
        createPaletteFromRemote(path)
          .finally(() => {
            getPalettesOnCurrentPage()
            penpot.ui.sendMessage({ type: 'STOP_LOADER' })
          })
          .catch((error) => {
            penpot.ui.sendMessage({
              type: 'REPORT_ERROR',
              data: error,
            })
            penpot.ui.sendMessage({
              type: 'POST_MESSAGE',
              data: {
                type: 'INFO',
                message: error.message,
              },
            })
          }),
      SYNC_LOCAL_STYLES: async () =>
        createLocalStyles(path.id)
          .then(async (message) => [message, await updateLocalStyles(path.id)])
          .then((messages) =>
            penpot.ui.sendMessage({
              type: 'POST_MESSAGE',
              data: {
                type: 'INFO',
                message: messages.join(tolgee.t('separator')),
                timer: 10000,
              },
            })
          )
          .finally(() => penpot.ui.sendMessage({ type: 'STOP_LOADER' }))
          .catch((error) => {
            penpot.ui.sendMessage({
              type: 'REPORT_ERROR',
              data: error,
            })
            penpot.ui.sendMessage({
              type: 'POST_MESSAGE',
              data: {
                type: 'ERROR',
                message: error.message,
              },
            })
          }),
      SYNC_LOCAL_TOKENS: async () =>
        createLocalTokens(path.id)
          .then(async (message) => [message, await updateLocalTokens(path.id)])
          .then((messages) =>
            penpot.ui.sendMessage({
              type: 'POST_MESSAGE',
              data: {
                type: 'INFO',
                message: messages.join(tolgee.t('separator')),
                timer: 10000,
              },
            })
          )
          .finally(() => penpot.ui.sendMessage({ type: 'STOP_LOADER' }))
          .catch((error) => {
            penpot.ui.sendMessage({
              type: 'REPORT_ERROR',
              data: error,
            })
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
              type: 'REPORT_ERROR',
              data: error,
            })
            penpot.ui.sendMessage({
              type: 'POST_MESSAGE',
              data: {
                type: 'ERROR',
                message: error.message,
              },
            })
          }),
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
            penpot.localStorage.setItem(item.key, JSON.stringify(item.value))
          else if (
            typeof item.value === 'boolean' ||
            typeof item.value === 'number'
          )
            penpot.localStorage.setItem(item.key, item.value.toString())
          else penpot.localStorage.setItem(item.key, item.value as string)
        })
      },
      GET_ITEMS: async () =>
        path.items.map(async (item: string) => {
          const value = penpot.localStorage.getItem(item)
          if (value && typeof value === 'string')
            penpot.ui.sendMessage({
              type: `GET_ITEM_${item.toUpperCase()}`,
              data: { value: value },
            })
        }),
      DELETE_ITEMS: () =>
        path.items.forEach(async (item: string) => {
          penpot.localStorage.setItem(item, '')
        }),
      //
      OPEN_IN_BROWSER: () =>
        penpot.ui.sendMessage({
          type: 'OPEN_IN_BROWSER',
          data: {
            url: path.data.url,
            isNewTab: true,
          },
        }),
      GET_PALETTES: async () => getPalettesOnCurrentPage(),
      JUMP_TO_PALETTE: async () =>
        jumpToPalette(path.id).catch((error) =>
          penpot.ui.sendMessage({
            type: 'POST_MESSAGE',
            data: {
              type: 'ERROR',
              message: error.message,
            },
          })
        ),
      DUPLICATE_PALETTE: async () =>
        createPaletteFromDuplication(path.id)
          .finally(async () => {
            getPalettesOnCurrentPage()
            penpot.ui.sendMessage({ type: 'STOP_LOADER' })
          })
          .catch((error) => {
            penpot.ui.sendMessage({
              type: 'REPORT_ERROR',
              data: error,
            })
            penpot.ui.sendMessage({
              type: 'POST_MESSAGE',
              data: {
                type: 'ERROR',
                message: error.message,
              },
            })
          }),
      DELETE_PALETTE: async () =>
        deletePalette(path.id).finally(async () => {
          getPalettesOnCurrentPage()
          penpot.ui.sendMessage({ type: 'STOP_LOADER' })
        }),
      //
      ENABLE_TRIAL: async () => {
        enableTrial(path.data.trialTime, path.data.trialVersion).then(() =>
          checkTrialStatus()
        )
      },
      GET_TRIAL: async () =>
        penpot.ui.sendMessage({
          type: 'GET_TRIAL',
          data: {
            id: penpot.currentUser.id,
          },
        }),
      GET_PRO: async () =>
        penpot.ui.sendMessage({
          type: 'GET_PRICING',
          data: {
            licenseTrigger: 'ACTIVATE',
          },
        }),
      GET_LICENSE: async () =>
        penpot.ui.sendMessage({
          type: 'GET_LICENSE',
        }),
      GO_TO_ULTIMATE_REQUEST: async () =>
        penpot.ui.sendMessage({
          type: 'OPEN_IN_BROWSER',
          data: {
            url: globalConfig.urls.storeUltimateRequestUrl,
            isNewTab: true,
          },
        }),
      ENABLE_PRO_PLAN: async () =>
        penpot.ui.sendMessage({
          type: 'ENABLE_PRO_PLAN',
          data: {
            id: penpot.currentUser.id,
          },
        }),
      LEAVE_PRO_PLAN: async () => {
        penpot.ui.sendMessage({
          type: 'LEAVE_PRO_PLAN',
          data: {
            id: penpot.currentUser.id,
          },
        })
        checkTrialStatus()
      },
      WELCOME_TO_PRO: async () =>
        penpot.ui.sendMessage({
          type: 'WELCOME_TO_PRO',
          data: {
            id: penpot.currentUser.id,
          },
        }),
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
    setPagePalettesMigration()
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
