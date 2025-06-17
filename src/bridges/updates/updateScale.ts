import { doScale } from '@a_ng_d/figmug-utils'
import { FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { ScaleMessage } from '../../types/messages'

const updateScale = async (msg: ScaleMessage) => {
  const now = new Date().toISOString()
  const palette: FullConfiguration = JSON.parse(
    penpot.currentPage?.getPluginData(`palette_${msg.data.id}`) ?? '{}'
  )

  const theme = palette.themes.find((theme) => theme.isEnabled)
  if (theme !== undefined) theme.scale = msg.data.scale

  if (msg.feature === 'ADD_STOP' || msg.feature === 'DELETE_STOP')
    palette.themes.forEach((theme) => {
      if (!theme.isEnabled)
        theme.scale = doScale(
          Object.keys(msg.data.scale).map((stop) => {
            return parseFloat(stop)
          }),
          theme.scale[
            Object.keys(theme.scale)[Object.keys(theme.scale).length - 1]
          ],
          theme.scale[Object.keys(theme.scale)[0]]
        )
    })

  palette.base.preset = msg.data.preset
  palette.base.shift = msg.data.shift
  palette.base.preset = msg.data.preset

  palette.meta.dates.updatedAt = now
  penpot.ui.sendMessage({
    type: 'UPDATE_PALETTE_DATE',
    data: now,
  })

  return penpot.currentPage?.setPluginData(
    `palette_${msg.data.id}`,
    JSON.stringify(palette)
  )
}

export default updateScale
