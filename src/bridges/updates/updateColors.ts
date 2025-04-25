import { FullConfiguration } from '../../types/configurations'
import { ColorsMessage } from '../../types/messages'
import Data from '../../utils/Data'

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

  palette.data = new Data(palette).makePaletteData(palette.data)

  penpot.currentPage?.setPluginData(
    `palette_${msg.id}`,
    JSON.stringify(palette)
  )
}

export default updateColors
