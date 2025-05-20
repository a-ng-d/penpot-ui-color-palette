import { Board } from '@penpot/plugin-types'
import { locals } from '../content/locals'
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
import updateLocalStyles from './updates/updateLocalStyles'
import updatePalette from './updates/updatePalette'
import updateScale from './updates/updateScale'
import updateSettings from './updates/updateSettings'
import updateThemes from './updates/updateThemes'
import createDocument from './creations/createDocument'
import createPaletteFromDocument from './creations/createPaletteFromDocument'
import updateDocument from './updates/updateDocument'
import exportJsonDtcg from './exports/exportJsonDtcg'
import createPaletteFromDuplication from './creations/createFromDuplication'
import deletePalette from './creations/deletePalette'

/*penpot.currentPage?.getPluginDataKeys().forEach((key) => {
  if (key.startsWith('palette_')) penpot.currentPage?.setPluginData(key, '')
})*/

const loadUI = async () => {
  const windowSize: windowSize = {
    w: parseFloat(penpot.root?.getPluginData('plugin_window_width') ?? '640'),
    h: parseFloat(penpot.root?.getPluginData('plugin_window_height') ?? '400'),
  }

  penpot.ui.open(
    `${locals.get().name}${locals.get().separator}${locals.get().tagline}`,
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
      CHECK_HIGHLIGHT_STATUS: () => checkHighlightStatus(path.data.version),
      //
      UPDATE_SCALE: () => updateScale(path),
      UPDATE_COLORS: () => updateColors(path),
      UPDATE_THEMES: () => updateThemes(path),
      UPDATE_SETTINGS: () => updateSettings(path),
      UPDATE_PALETTE: () => updatePalette(path),
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
      UPDATE_DOCUMENT: () =>
        updateDocument(path.view)
          .finally(() => penpot.ui.sendMessage({ type: 'STOP_LOADER' }))
          .catch((error) => {
            throw error
          }),
      UPDATE_LANGUAGE: () => {
        penpot.root?.setPluginData('user_language', path.data.lang)
        locals.set(path.data.lang)
      },
      //
      CREATE_PALETTE: () =>
        createPalette(path).finally(() =>
          penpot.ui.sendMessage({ type: 'STOP_LOADER' })
        ),
      CREATE_PALETTE_FROM_DOCUMENT: () =>
        createPaletteFromDocument().finally(() =>
          penpot.ui.sendMessage({ type: 'STOP_LOADER' })
        ),
      SYNC_LOCAL_STYLES: async () =>
        createLocalStyles(path.id)
          .then(async (message) => [message, await updateLocalStyles(path.id)])
          .then(
            (messages) =>
              null /*figma.notify(messages.join(locals.get().separator), {
              timeout: 10000,
            })*/
          )
          .finally(() => penpot.ui.sendMessage({ type: 'STOP_LOADER' }))
          .catch((error) => {
            /*figma.notify(locals.get().error.generic)*/
            throw error
          }),
      CREATE_DOCUMENT: () =>
        createDocument(path.id, path.view)
          .finally(() => penpot.ui.sendMessage({ type: 'STOP_LOADER' }))
          .catch((error) => {
            throw error
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
      DUPLICATE_PALETTE: async () =>
        await createPaletteFromDuplication(path.id)
          .finally(async () => await getPalettesOnCurrentPage())
          .catch((error) => {
            throw error
          }),
      DELETE_PALETTE: async () =>
        await deletePalette(path.id)
          .finally(async () => await getPalettesOnCurrentPage())
          .catch((error) => {
            throw error
          }),
      //
      GET_PRO_PLAN: async () => await getProPlan(),
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
