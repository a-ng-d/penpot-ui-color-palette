import { FullConfiguration } from '../../types/configurations'
import { ScaleMessage } from '../../types/messages'
import Data from '../../utils/Data'
import doLightnessScale from '../../utils/doLightnessScale'

const updateScale = async (msg: ScaleMessage) => {
  const palette: FullConfiguration = JSON.parse(
    penpot.currentPage?.getPluginData(`palette_${msg.data.id}`) ?? '{}'
  )

  const theme = palette.base.themes.find((theme) => theme.isEnabled)
  if (theme !== undefined) theme.scale = msg.data.scale

  if (msg.feature === 'ADD_STOP' || msg.feature === 'DELETE_STOP')
    palette.base.themes.forEach((theme) => {
      if (!theme.isEnabled)
        theme.scale = doLightnessScale(
          Object.keys(msg.data.scale).map((stop) => {
            return parseFloat(stop.replace('lightness-', ''))
          }),
          theme.scale[
            Object.keys(theme.scale)[Object.keys(theme.scale).length - 1]
          ],
          theme.scale[Object.keys(theme.scale)[0]]
        )
    })

  palette.base.scale = msg.data.scale
  palette.base.shift = msg.data.shift

  // Update
  const now = new Date().toISOString()
  palette.meta.dates.updatedAt = now
  penpot.ui.sendMessage({
    type: 'UPDATE_PALETTE_DATE',
    data: now,
  })

  palette.data = new Data(palette).makePaletteData()

  penpot.currentPage?.setPluginData(
    `palette_${msg.data.id}`,
    JSON.stringify(palette)
  )
}

export default updateScale
