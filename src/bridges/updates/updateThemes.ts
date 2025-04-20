import { FullPaletteConfiguration } from 'src/types/configurations'
import { ThemesMessage } from '../../types/messages'

const updateThemes = async (msg: ThemesMessage) => {
  const paletteData: FullPaletteConfiguration = JSON.parse(
    penpot.currentPage?.getPluginData(`palette_${msg.id}`) ?? '{}'
  )

  paletteData.base.themes = msg.data

  // Update
  const now = new Date().toISOString()
  paletteData.meta.dates.updatedAt = now
  penpot.ui.sendMessage({
    type: 'UPDATE_PALETTE_DATE',
    data: now,
  })

  penpot.currentPage?.setPluginData(
    `palette_${msg.id}`,
    JSON.stringify(paletteData)
  )
}

export default updateThemes
