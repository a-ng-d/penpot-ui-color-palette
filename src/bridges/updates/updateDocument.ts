import { Board } from '@penpot/plugin-types'
import Palette from '../../canvas/Palette'
import Sheet from '../../canvas/Sheet'
import {
  FullConfiguration,
  ThemeConfiguration,
  ViewConfiguration,
} from '../../types/configurations'
import { PaletteDataThemeItem } from '../../types/data'

const updateDocument = async (view: ViewConfiguration) => {
  const document = penpot.selection[0] as Board
  const id = document.getPluginData('id')
  const themeId = document.getPluginData('themeId')

  const palette = JSON.parse(
    penpot.currentPage?.getPluginData(`palette_${id}`) ?? '{}'
  ) as FullConfiguration
  const themeData = palette.data.themes.find(
    (theme: PaletteDataThemeItem) => theme.id === themeId
  )
  const currentTheme = palette.themes.find(
    (theme: ThemeConfiguration) => theme.id === themeId
  )

  if (themeData === undefined || currentTheme === undefined)
    throw new Error('Theme not found')

  const newDocument =
    view === 'PALETTE_WITH_PROPERTIES' || view === 'PALETTE'
      ? new Palette({
          base: palette.base,
          theme: currentTheme,
          data: themeData,
          meta: palette.meta,
          view: view,
        }).node
      : new Sheet({
          base: palette.base,
          theme: currentTheme,
          data: themeData,
          meta: palette.meta,
          view: view,
        }).node

  document.children[0].remove()
  document.appendChild(newDocument)
  document.fills = [
    {
      fillColor: currentTheme.paletteBackground,
    },
  ]

  // Update
  document.setPluginData('view', view)
  document.setPluginData('updatedAt', palette.meta.dates.updatedAt.toString())
  document.setPluginData('backup', JSON.stringify(palette))

  return true
}

export default updateDocument
