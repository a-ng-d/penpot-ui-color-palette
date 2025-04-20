import { FullConfiguration } from 'src/types/configurations'
import { ColorsMessage } from '../../types/messages'

const updateColors = async (msg: ColorsMessage) => {
  const paletteData: FullConfiguration = JSON.parse(
    penpot.currentPage?.getPluginData(`palette_${msg.id}`) ?? '{}'
  )

  paletteData.base.colors = msg.data

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

export default updateColors
