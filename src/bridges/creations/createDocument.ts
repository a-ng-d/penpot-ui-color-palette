import {
  Data,
  FullConfiguration,
  ViewConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import scheduleSaveVersion from '../../utils/scheduleSaveVersion'
import Documents from '../../canvas/Documents'
import { tolgee } from '../..'

const createDocument = async (id: string, view: ViewConfiguration) => {
  const rawPalette = penpot.currentPage?.getSharedPluginData(
    'uicp',
    `palette_${id}`
  )

  if (rawPalette === undefined || rawPalette === null)
    throw new Error(tolgee.t('error.unfoundPalette'))

  const palette = JSON.parse(rawPalette) as FullConfiguration

  const documents = new Documents({
    base: palette.base,
    themes: palette.themes,
    data: new Data(palette).makePaletteData(),
    meta: palette.meta,
    view: view,
  })

  penpot.selection = documents.documents
  penpot.viewport.zoomIntoView(penpot.selection)

  scheduleSaveVersion(
    `${palette.base.name} - ${tolgee.t('events.documentCreated')}`
  )

  return palette
}

export default createDocument
