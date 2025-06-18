import { uid } from 'uid'
import chroma from 'chroma-js'
import { Board, Fill, Shape } from '@penpot/plugin-types'
import {
  HexModel,
  SourceColorConfiguration,
} from '@a_ng_d/utils-ui-color-palette'

export let currentSelection: Array<Shape> = []
export let previousSelection: Array<Shape> = []
export let isSelectionChanged = false

const processSelection = () => {
  previousSelection = currentSelection.length === 0 ? [] : currentSelection
  isSelectionChanged = true

  const selection: Array<Shape> = penpot.selection
  currentSelection = penpot.selection

  const viableSelection: Array<SourceColorConfiguration> = []

  const document = selection[0] as Board
  const selectionHandler = (state: string) => {
    const actions: { [key: string]: () => void } = {
      DOCUMENT_SELECTED: async () => {
        penpot.ui.sendMessage({
          type: 'DOCUMENT_SELECTED',
          data: {
            view: document.getPluginData('view'),
            id: document.getPluginData('id'),
            updatedAt: document.getPluginData('updatedAt'),
            isLinkedToPalette:
              penpot.currentPage?.getPluginData(
                `palette_${document.getPluginData('id')}`
              ) !== '',
          },
        })
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
    document.getPluginData('type') === 'UI_COLOR_PALETTE' &&
    !(document.isComponentInstance() || document.isComponentMainInstance())
  )
    selectionHandler('DOCUMENT_SELECTED')
  else if (
    selection.length === 1 &&
    document.getPluginDataKeys().length > 0 &&
    !(document.isComponentInstance() || document.isComponentMainInstance())
  )
    selectionHandler('DOCUMENT_SELECTED')
  else if (selection.length === 0) selectionHandler('EMPTY_SELECTION')
  else if (selection.length > 1 && document.getPluginDataKeys().length !== 0)
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
            hue: {
              shift: 0,
              isLocked: false,
            },
            chroma: {
              shift: 100,
              isLocked: false,
            },
          })
        })
        selectionHandler('COLOR_SELECTED')
      }
  })

  setTimeout(() => (isSelectionChanged = false), 1000)
}

export default processSelection
