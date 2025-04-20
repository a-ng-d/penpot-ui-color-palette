import { FullConfiguration } from 'src/types/configurations'
import { SettingsMessage } from '../../types/messages'

const updateSettings = async (msg: SettingsMessage) => {
  const paletteData: FullConfiguration = JSON.parse(
    penpot.currentPage?.getPluginData(`palette_${msg.id}`) ?? '{}'
  )

  paletteData.base.name = msg.data.name
  paletteData.base.description = msg.data.description
  paletteData.base.colorSpace = msg.data.colorSpace
  paletteData.base.visionSimulationMode = msg.data.visionSimulationMode
  paletteData.base.algorithmVersion = msg.data.algorithmVersion
  paletteData.base.textColorsTheme = msg.data.textColorsTheme

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

export default updateSettings
