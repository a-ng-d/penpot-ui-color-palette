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
    console.log(msg)
    const palette = penpot.selection[0] as Board

    const actions: ActionsList = {
      CHECK_USER_CONSENT: () => checkUserConsent(),
      CHECK_HIGHLIGHT_STATUS: () =>
        checkHighlightStatus(msg.pluginMessage.version),
      //
      UPDATE_SCALE: () => updateScale(msg.pluginMessage),
      UPDATE_VIEW: () => updateView(msg.pluginMessage),
      UPDATE_COLORS: () => updateColors(msg.pluginMessage),
      UPDATE_THEMES: () => updateThemes(msg.pluginMessage),
      UPDATE_SETTINGS: () => updateSettings(msg.pluginMessage),
      UPDATE_GLOBAL: () => updateGlobal(msg.pluginMessage),
      UPDATE_PALETTE: () => updatePalette(msg.pluginMessage.items),
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
        createPalette(msg.pluginMessage).finally(() =>
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
        msg.pluginMessage.export === 'TOKENS_GLOBAL' && exportJson(palette)
        msg.pluginMessage.export === 'TOKENS_AMZN_STYLE_DICTIONARY' &&
          exportJsonAmznStyleDictionary(palette)
        msg.pluginMessage.export === 'TOKENS_TOKENS_STUDIO' &&
          exportJsonTokensStudio(palette)
        msg.pluginMessage.export === 'CSS' &&
          exportCss(palette, msg.pluginMessage.colorSpace)
        msg.pluginMessage.export === 'TAILWIND' && exportTailwind(palette)
        msg.pluginMessage.export === 'APPLE_SWIFTUI' && exportSwiftUI(palette)
        msg.pluginMessage.export === 'APPLE_UIKIT' && exportUIKit(palette)
        msg.pluginMessage.export === 'ANDROID_COMPOSE' && exportKt(palette)
        msg.pluginMessage.export === 'ANDROID_XML' && exportXml(palette)
        msg.pluginMessage.export === 'CSV' && exportCsv(palette)
      },
      //
      SEND_MESSAGE: () => null, //figma.notify(msg.pluginMessage.message),
      SET_ITEMS: () => {
        msg.pluginMessage.items.forEach(
          (item: { key: string; value: unknown }) => {
            if (typeof item.value === 'object')
              penpot.root?.setPluginData(item.key, JSON.stringify(item.value))
            else if (
              typeof item.value === 'boolean' ||
              typeof item.value === 'number'
            )
              penpot.root?.setPluginData(item.key, item.value.toString())
            else penpot.root?.setPluginData(item.key, item.value as string)
          }
        )
      },
      GET_ITEMS: async () =>
        msg.pluginMessage.items.map(async (item: string) =>
          penpot.ui.sendMessage({
            type: `GET_ITEM_${item.toUpperCase()}`,
            value: penpot.root?.getPluginData(item),
          })
        ),
      DELETE_ITEMS: () =>
        msg.pluginMessage.items.forEach(async (item: string) =>
          penpot.root?.setPluginData(item, '')
        ),
      SET_DATA: () =>
        msg.pluginMessage.items.forEach(
          (item: { key: string; value: string }) =>
            palette.setPluginData(item.key, JSON.stringify(item.value))
        ),
      //
      GET_PALETTES: async () => await getPalettesOnCurrentPage(),
      JUMP_TO_PALETTE: async () => {
        /*const scene: Array<Shape> = []
        const palette = await penpot.currentPage
          .then(() => figma.currentPage.findOne((node) => node.id === msg.pluginMessage.id))
          .catch((error) => {
            figma.notify(locals[lang].error.generic)
            throw error
          })
        palette !== null && scene.push(palette)
        figma.currentPage.selection = scene
        figma.viewport.scrollAndZoomIntoView(scene)*/
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

    return actions[msg.pluginMessage.type]?.()
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
