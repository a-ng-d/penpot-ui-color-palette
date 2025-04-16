import { uid } from 'uid'

import { HexModel } from '@a_ng_d/figmug-ui'
import { Board, Fill, Shape } from '@penpot/plugin-types'
import chroma from 'chroma-js'
import {
  SourceColorConfiguration,
  ThemeConfiguration,
} from '../types/configurations'
import { ActionsList } from '../types/models'

export let currentSelection: Array<Shape> = []
export let previousSelection: Array<Shape> = []
export let isSelectionChanged = false

const processSelection = () => {
  previousSelection = currentSelection.length === 0 ? [] : currentSelection
  isSelectionChanged = true

  const selection: Array<Shape> = penpot.selection
  currentSelection = penpot.selection

  const viableSelection: Array<SourceColorConfiguration> = []

  const palette = selection[0] as Board
  const selectionHandler = (state: string) => {
    const actions: ActionsList = {
      PALETTE_SELECTED: async () => {
        penpot.ui.sendMessage({
          type: 'PALETTE_SELECTED',
          data: {
            id: palette.getPluginData('id'),
            name: palette.getPluginData('name'),
            description: palette.getPluginData('description'),
            preset: JSON.parse(palette.getPluginData('preset')),
            scale: JSON.parse(palette.getPluginData('themes')).find(
              (theme: ThemeConfiguration) => theme.isEnabled
            ).scale,
            shift: JSON.parse(palette.getPluginData('shift')),
            areSourceColorsLocked:
              palette.getPluginData('areSourceColorsLocked') === 'true',
            colors: JSON.parse(palette.getPluginData('colors')),
            colorSpace: palette.getPluginData('colorSpace'),
            visionSimulationMode: palette.getPluginData('visionSimulationMode'),
            themes: JSON.parse(palette.getPluginData('themes')),
            view: palette.getPluginData('view'),
            algorithmVersion: palette.getPluginData('algorithmVersion'),
            textColorsTheme: JSON.parse(
              palette.getPluginData('textColorsTheme')
            ),
            isPublished: palette.getPluginData('isPublished') === 'true',
            isShared: palette.getPluginData('isShared') === 'true',
            creatorFullName: palette.getPluginData('creatorFullName'),
            creatorAvatar: palette.getPluginData('creatorAvatar'),
            creatorId: palette.getPluginData('creatorId'),
            createdAt: palette.getPluginData('createdAt'),
            updatedAt: palette.getPluginData('updatedAt'),
            publishedAt: palette.getPluginData('publishedAt'),
          },
        })

        await palette
          .export({
            type: 'png',
            scale: 0.25,
          })
          .then((image) =>
            penpot.ui.sendMessage({
              type: 'UPDATE_SCREENSHOT',
              data: image,
            })
          )
          .catch(() =>
            penpot.ui.sendMessage({
              type: 'UPDATE_SCREENSHOT',
              data: null,
            })
          )
      },
      EMPTY_SELECTION: () =>
        penpot.ui.sendMessage({
          type: 'EMPTY_SELECTION',
          data: {},
        }),
      COLOR_SELECTED: () => {
        penpot.ui.sendMessage({
          type: 'COLOR_SELECTED',
          data: {
            selection: viableSelection,
          },
        })
      },
    }

    return actions[state]?.()
  }

  if (
    selection.length === 1 &&
    palette.getPluginData('type') === 'UI_COLOR_PALETTE' &&
    !(palette.isComponentInstance() || palette.isComponentMainInstance())
  )
    selectionHandler('PALETTE_SELECTED')
  else if (
    selection.length === 1 &&
    palette.getPluginDataKeys().length > 0 &&
    !(palette.isComponentInstance() || palette.isComponentMainInstance())
  )
    selectionHandler('PALETTE_SELECTED')
  else if (selection.length === 0) selectionHandler('EMPTY_SELECTION')
  else if (selection.length > 1 && palette.getPluginDataKeys().length !== 0)
    selectionHandler('EMPTY_SELECTION')
  else if (
    selection[0].isComponentInstance() ||
    selection[0].isComponentMainInstance()
  )
    selectionHandler('EMPTY_SELECTION')
  else if (selection[0].fills === undefined) selectionHandler('EMPTY_SELECTION')
  else if (
    (selection[0] as Board).fills &&
    ((selection[0] as Board).fills as readonly Fill[]).length === 0
  )
    selectionHandler('EMPTY_SELECTION')

  selection.forEach((element) => {
    const foundColors = (element as Board).fills.filter(
      (fill) => fill.fillColor !== undefined
    )
    if (
      element.type !== 'group' &&
      element.type !== 'image' &&
      element.type !== 'boolean'
    )
      if (foundColors.length > 0 && element.getPluginDataKeys().length === 0) {
        foundColors.forEach((color) => {
          const hexToGl = chroma(color.fillColor as HexModel).gl()
          viableSelection.push({
            name: element.name,
            rgb: {
              r: hexToGl[0],
              g: hexToGl[1],
              b: hexToGl[2],
            },
            source: 'CANVAS',
            id: uid(),
            isRemovable: false,
          })
        })
        selectionHandler('COLOR_SELECTED')
      }
  })

  setTimeout(() => (isSelectionChanged = false), 1000)
}

export default processSelection
