import { Board } from '@penpot/plugin-types'
import { lang, locals } from '../content/locals'
import { windowSize } from '../types/app'
import { ActionsList } from '../types/models'
import checkHighlightStatus from './checks/checkHighlightStatus'
import checkPlanStatus from './checks/checkPlanStatus'
import checkUserConsent from './checks/checkUserConsent'
import checkUserPreferences from './checks/checkUserPreferences'
import createLocalStyles from './creations/createLocalStyles'
import createPalette from './creations/createPalette'
import exportCss from './exports/exportCss'
import exportCsv from './exports/exportCsv'
import exportJson from './exports/exportJson'
import exportJsonAmznStyleDictionary from './exports/exportJsonAmznStyleDictionary'
import exportJsonTokensStudio from './exports/exportJsonTokensStudio'
import exportKt from './exports/exportKt'
import exportSwiftUI from './exports/exportSwiftUI'
import exportTailwind from './exports/exportTailwind'
import exportUIKit from './exports/exportUIKit'
import exportXml from './exports/exportXml'
import getPalettesOnCurrentPage from './getPalettesOnCurrentPage'
import getProPlan from './getProPlan'
import processSelection from './processSelection'
import updateColors from './updates/updateColors'
import updateGlobal from './updates/updateGlobal'
import updateLocalStyles from './updates/updateLocalStyles'
import updatePalette from './updates/updatePalette'
import updateScale from './updates/updateScale'
import updateSettings from './updates/updateSettings'
import updateThemes from './updates/updateThemes'
import updateView from './updates/updateView'

const loadUI = async () => {
  const windowSize: windowSize = {
    w: parseFloat(penpot.root?.getPluginData('plugin_window_width') ?? '640'),
    h: parseFloat(penpot.root?.getPluginData('plugin_window_height') ?? '400'),
  }

  penpot.ui.open(
    `${locals[lang].name}${locals[lang].separator}${locals[lang].tagline}`,
    '',
    {
      width: windowSize.w,
      height: windowSize.h,
    }
  )

  setTimeout(() => {
    // Checks
    checkUserConsent()
      .then(() => checkPlanStatus())
      .then(() => checkUserPreferences())
      .then(() => processSelection())

    // Canvas > UI
    penpot.ui.sendMessage({
      type: 'CHECK_USER_AUTHENTICATION',
      id: penpot.currentUser.id,
      fullName: penpot.currentUser.name,
      avatar: penpot.currentUser.avatarUrl,
      data: {
        accessToken: penpot.root?.getPluginData('supabase_access_token'),
        refreshToken: penpot.root?.getPluginData('supabase_refresh_token'),
      },
    })
    penpot.ui.sendMessage({
      type: 'SET_THEME',
      data: {
        theme: penpot.theme,
      },
    })
  }, 1000)

  // UI > Canvas
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  penpot.ui.onMessage(async (msg: any) => {
    const palette = penpot.selection[0] as Board
    const path = msg.pluginMessage

    const actions: ActionsList = {
      CHECK_USER_CONSENT: () => checkUserConsent(),
      CHECK_HIGHLIGHT_STATUS: () => checkHighlightStatus(path.version),
      //
      UPDATE_SCALE: () => updateScale(path),
      UPDATE_VIEW: () => updateView(path),
      UPDATE_COLORS: () => updateColors(path),
      UPDATE_THEMES: () => updateThemes(path),
      UPDATE_SETTINGS: () => updateSettings(path),
      UPDATE_GLOBAL: () => updateGlobal(path),
      UPDATE_PALETTE: () => updatePalette(path.items),
      UPDATE_SCREENSHOT: async () =>
        penpot.ui.sendMessage({
          type: 'UPDATE_SCREENSHOT',
          data: await palette
            .export({
              type: 'png',
              scale: 0.25,
            })
            .catch(() => null),
        }),
      //
      CREATE_PALETTE: () =>
        createPalette(path).finally(() =>
          penpot.ui.sendMessage({ type: 'STOP_LOADER' })
        ),
      SYNC_LOCAL_STYLES: async () =>
        createLocalStyles(palette)
          .then(async (message) => [message, await updateLocalStyles(palette)])
          .then(
            (messages) =>
              null /*figma.notify(messages.join(locals[lang].separator), {
              timeout: 10000,
            })*/
          )
          .finally(() => penpot.ui.sendMessage({ type: 'STOP_LOADER' }))
          .catch((error) => {
            /*figma.notify(locals[lang].error.generic)*/
            throw error
          }),
      SYNC_LOCAL_VARIABLES: () => null,
      /*createLocalVariables(palette)
          .then(async (message) => [
            message,
            await updateLocalVariables(palette),
          ])
          .then((messages) =>
            figma.notify(messages.join(locals[lang].separator), {
              timeout: 10000,
            })
          )
          .finally(() => penpot.ui.sendMessage({ type: 'STOP_LOADER' }))
          .catch((error) => {
            figma.notify(locals[lang].error.generic)
            throw error
          }),*/
      //
      EXPORT_PALETTE: () => {
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
      SEND_MESSAGE: () => null, //figma.notify(path.message),
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
        path.items.map(async (item: string) =>
          penpot.ui.sendMessage({
            type: `GET_ITEM_${item.toUpperCase()}`,
            value: penpot.root?.getPluginData(item),
          })
        ),
      DELETE_ITEMS: () =>
        path.items.forEach(async (item: string) =>
          penpot.root?.setPluginData(item, '')
        ),
      SET_DATA: () =>
        path.items.forEach((item: { key: string; value: string }) =>
          palette.setPluginData(item.key, JSON.stringify(item.value))
        ),
      //
      GET_PALETTES: async () => await getPalettesOnCurrentPage(),
      JUMP_TO_PALETTE: async () => {
        const palette = penpot.currentPage?.getPluginData(`palette_${path.id}`)
        if (palette !== undefined)
          penpot.ui.sendMessage({
            type: 'LOAD_PALETTE',
            data: JSON.parse(palette),
          })
      },
      GET_VARIABLES_COLLECTIONS: async () => {
        /*const collections =
          await figma.variables.getLocalVariableCollectionsAsync()
        const collectionId = JSON.parse(
          palette.getPluginData('data')
        ).collectionId
        penpot.ui.sendMessage({
          type: 'GET_VARIABLES_COLLECTIONS',
          data: {
            collections: collections.map((collections) => ({
              id: collections.id,
              name: collections.name,
            })),
            collectionId: collectionId,
          },
        })*/
      },
      //
      GET_PRO_PLAN: async () => await getProPlan(),
      //
      SIGN_OUT: () =>
        penpot.ui.sendMessage({
          type: 'SIGN_OUT',
          data: {
            connectionStatus: 'UNCONNECTED',
            userFullName: '',
            userAvatar: '',
            userId: undefined,
            accessToken: undefined,
            refreshToken: undefined,
          },
        }),
    }

    return actions[path.type]?.()
  })

  // Listeners
  penpot.on('pagechange', () => {
    penpot.ui.sendMessage({
      type: 'LOAD_PALETTES',
    })
    setTimeout(() => getPalettesOnCurrentPage(), 1000)
  })

  penpot.on('selectionchange', () => processSelection())

  penpot.on('themechange', () => {
    penpot.ui.sendMessage({
      type: 'SET_THEME',
      data: {
        theme: penpot.theme,
      },
    })
  })
}

export default loadUI
