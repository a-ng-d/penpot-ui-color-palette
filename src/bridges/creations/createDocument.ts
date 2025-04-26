import Documents from '../../canvas/Documents'
import {
  FullConfiguration,
  ViewConfiguration,
} from '../../types/configurations'

const createDocument = async (id: string, view: ViewConfiguration) => {
  const palette: FullConfiguration = JSON.parse(
    penpot.currentPage?.getPluginData(`palette_${id}`) ?? '{}'
  )

  const documents = new Documents({
    base: palette.base,
    themes: palette.themes,
    data: palette.data,
    meta: palette.meta,
    view: view,
  })

  penpot.selection = documents.documents
  penpot.viewport.zoomIntoView(penpot.selection)

  return true
}

export default createDocument
