import { FullConfiguration } from 'src/types/configurations'
import { SettingsMessage } from '../../types/messages'
import Data from 'src/utils/Data'

const updateSettings = async (msg: SettingsMessage) => {
  const palette: FullConfiguration = JSON.parse(
    penpot.currentPage?.getPluginData(`palette_${msg.id}`) ?? '{}'
  )

  palette.base.name = msg.data.name
  palette.base.description = msg.data.description
  palette.base.colorSpace = msg.data.colorSpace
  palette.base.visionSimulationMode = msg.data.visionSimulationMode
  palette.base.algorithmVersion = msg.data.algorithmVersion
  palette.base.textColorsTheme = msg.data.textColorsTheme

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

export default updateSettings
