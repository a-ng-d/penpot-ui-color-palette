import {
  Data,
  FullConfiguration,
  PaletteDataThemeItem,
  ThemeConfiguration,
  ViewConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { Board } from '@penpot/plugin-types'
import setPaletteName from '../../utils/setPaletteName'
import Sheet from '../../canvas/Sheet'
import Palette from '../../canvas/Palette'
import { tolgee } from '../..'

const updateDocument = async (view: ViewConfiguration) => {
  const document = penpot.selection[0] as Board
  const id = document.getPluginData('id')
  const themeId = document.getPluginData('themeId')

  const rawPalette = penpot.currentPage?.getPluginData(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    throw new Error(tolgee.t('error.unfoundPalette'))

  const palette = JSON.parse(rawPalette) as FullConfiguration

  const themeData = new Data(palette)
    .makePaletteData()
    .themes.find((theme: PaletteDataThemeItem) => theme.id === themeId)
  const currentTheme = palette.themes.find(
    (theme: ThemeConfiguration) => theme.id === themeId
  )

  if (themeData === undefined || currentTheme === undefined)
    throw new Error(tolgee.t('error.document'))

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
  document.name = setPaletteName(
    palette.base.name,
    currentTheme.type === 'default theme' ? undefined : currentTheme.name,
    palette.base.preset.name,
    palette.base.colorSpace,
    currentTheme.visionSimulationMode
  )

  // Update
  document.setPluginData('view', view)
  document.setPluginData('updatedAt', palette.meta.dates.updatedAt.toString())
  document.setPluginData('backup', JSON.stringify(palette))

  penpot.ui.sendMessage({
    type: 'DOCUMENT_SELECTED',
    data: {
      view: view,
      id: id,
      updatedAt: palette.meta.dates.updatedAt.toString(),
      isLinkedToPalette: true,
    },
  })

  await new Promise((r) => setTimeout(r, 1000))
  await penpot.currentFile?.saveVersion(
    `${palette.base.name} - ${tolgee.t('events.documentUpdated')}`
  )

  return palette
}

export default updateDocument
