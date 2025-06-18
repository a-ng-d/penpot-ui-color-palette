import {
  Data,
  FullConfiguration,
  ViewConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import Documents from '../../canvas/Documents'
import { locales } from '../../content/locales'

const createDocument = async (id: string, view: ViewConfiguration) => {
  const rawPalette = penpot.currentPage?.getPluginData(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    throw new Error(locales.get().error.unfoundPalette)

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

  return true
}

export default createDocument
