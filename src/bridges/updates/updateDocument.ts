import { Board } from '@penpot/plugin-types'
import {
  Data,
  FullConfiguration,
  PaletteDataThemeItem,
  ThemeConfiguration,
  ViewConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { locales } from '../../content/locales'
import Sheet from '../../canvas/Sheet'
import Palette from '../../canvas/Palette'

const updateDocument = async (view: ViewConfiguration) => {
  const document = penpot.selection[0] as Board
  const id = document.getPluginData('id')
  const themeId = document.getPluginData('themeId')

  const rawPalette = penpot.currentPage?.getPluginData(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    throw new Error(locales.get().error.unfoundPalette)

  const palette = JSON.parse(rawPalette) as FullConfiguration

  const themeData = new Data(palette)
    .makePaletteData()
    .themes.find((theme: PaletteDataThemeItem) => theme.id === themeId)
  const currentTheme = palette.themes.find(
    (theme: ThemeConfiguration) => theme.id === themeId
  )

  if (themeData === undefined || currentTheme === undefined)
    throw new Error(locales.get().error.document)

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

  await new Promise((r) => setTimeout(r, 1000))
  await penpot.currentFile?.saveVersion(
    `${palette.base.name} - ${locales.get().events.documentUpdated}`
  )

  return palette
}

export default updateDocument
