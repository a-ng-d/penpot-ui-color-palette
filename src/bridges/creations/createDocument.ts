import {
  Data,
  FullConfiguration,
  ViewConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import { locales } from '../../content/locales'
import Documents from '../../canvas/Documents'

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

  await new Promise((r) => setTimeout(r, 1000))
  await penpot.currentFile?.saveVersion(
    `${palette.base.name} - ${locales.get().events.documentCreated}`
  )

  return palette
}

export default createDocument
