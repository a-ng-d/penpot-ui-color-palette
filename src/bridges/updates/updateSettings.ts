import { FullConfiguration } from '../../types/configurations'
import { SettingsMessage } from '../../types/messages'
import Data from '../../utils/Data'

const updateSettings = async (msg: SettingsMessage) => {
  const now = new Date().toISOString()
  const palette: FullConfiguration = JSON.parse(
    penpot.currentPage?.getPluginData(`palette_${msg.id}`) ?? '{}'
  )

  const theme = palette.base.themes.find((theme) => theme.isEnabled)
  if (theme !== undefined) {
    theme.visionSimulationMode = msg.data.visionSimulationMode
    theme.textColorsTheme = msg.data.textColorsTheme
  }

  palette.base.name = msg.data.name
  palette.base.description = msg.data.description
  palette.base.colorSpace = msg.data.colorSpace
  palette.base.algorithmVersion = msg.data.algorithmVersion

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

export default updateSettings
