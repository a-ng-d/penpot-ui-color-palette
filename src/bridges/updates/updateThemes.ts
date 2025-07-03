import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { ThemesMessage } from '../../types/messages'
import { locales } from '../../content/locales'

const updateThemes = async (msg: ThemesMessage) => {
  const now = new Date().toISOString()
  const palette: FullConfiguration = JSON.parse(
    penpot.currentPage?.getPluginData(`palette_${msg.id}`) ?? '{}'
  )

  palette.themes = msg.data

  palette.libraryData = new Data(palette).makeLibraryData(
    ['style_id'],
    palette.libraryData
  )

  palette.meta.dates.updatedAt = now
  penpot.ui.sendMessage({
    type: 'UPDATE_PALETTE_DATE',
    data: now,
  })
  
  penpot.currentPage?.setPluginData(
    `palette_${msg.id}`,
    JSON.stringify(palette)
  )

  await new Promise((r) => setTimeout(r, 1000))
  await penpot.currentFile?.saveVersion(
    `${palette.base.name} - ${locales.get().events.themesUpdated}`
  )

  return palette
}

export default updateThemes
