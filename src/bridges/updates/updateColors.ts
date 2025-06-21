import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { ColorsMessage } from '../../types/messages'
import { locales } from '../../content/locales'

const updateColors = async (msg: ColorsMessage) => {
  const now = new Date().toISOString()
  const palette: FullConfiguration = JSON.parse(
    penpot.currentPage?.getPluginData(`palette_${msg.id}`) ?? '{}'
  )

  palette.base.colors = msg.data

  palette.meta.dates.updatedAt = now
  penpot.ui.sendMessage({
    type: 'UPDATE_PALETTE_DATE',
    data: now,
  })

  palette.libraryData = new Data(palette).makeLibraryData(
    ['style_id'],
    palette.libraryData
  )

  penpot.currentFile?.saveVersion(
    `${palette.base.name} - ${locales.get().events.colorsUpdated}`
  )

  return penpot.currentPage?.setPluginData(
    `palette_${msg.id}`,
    JSON.stringify(palette)
  )
}

export default updateColors
