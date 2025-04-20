import { FullConfiguration } from 'src/types/configurations'
import { ScaleMessage } from '../../types/messages'
import doLightnessScale from '../../utils/doLightnessScale'

const updateScale = async (msg: ScaleMessage) => {
  const paletteData: FullConfiguration = JSON.parse(
    penpot.currentPage?.getPluginData(`palette_${msg.data.id}`) ?? '{}'
  )

  const theme = paletteData.base.themes.find((theme) => theme.isEnabled)
  if (theme !== undefined) theme.scale = msg.data.scale

  if (msg.feature === 'ADD_STOP' || msg.feature === 'DELETE_STOP')
    paletteData.base.themes.forEach((theme) => {
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

  paletteData.base.scale = msg.data.scale
  paletteData.base.shift = msg.data.shift

  // Update
  const now = new Date().toISOString()
  paletteData.meta.dates.updatedAt = now
  penpot.ui.sendMessage({
    type: 'UPDATE_PALETTE_DATE',
    data: now,
  })

  penpot.currentPage?.setPluginData(
    `palette_${msg.data.id}`,
    JSON.stringify(paletteData)
  )
}

export default updateScale
