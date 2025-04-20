import { FullConfiguration } from 'src/types/configurations'
import { ColorsMessage } from '../../types/messages'
import Data from 'src/utils/Data'

const updateColors = async (msg: ColorsMessage) => {
  const palette: FullConfiguration = JSON.parse(
    penpot.currentPage?.getPluginData(`palette_${msg.id}`) ?? '{}'
  )

  palette.base.colors = msg.data

  // Update
  const now = new Date().toISOString()
  palette.meta.dates.updatedAt = now
  penpot.ui.sendMessage({
    type: 'UPDATE_PALETTE_DATE',
    data: now,
  })

  palette.data = new Data(palette).makePaletteData()

  penpot.currentPage?.setPluginData(
    `palette_${msg.id}`,
    JSON.stringify(palette)
  )
}

export default updateColors
