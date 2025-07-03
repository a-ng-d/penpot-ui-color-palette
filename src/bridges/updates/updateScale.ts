import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { doScale } from '@a_ng_d/figmug-utils'
import { ScaleMessage } from '../../types/messages'
import { locales } from '../../content/locales'

const updateScale = async (msg: ScaleMessage) => {
  const now = new Date().toISOString()
  const palette: FullConfiguration = JSON.parse(
    penpot.currentPage?.getPluginData(`palette_${msg.data.id}`) ?? '{}'
  )

  const theme = palette.themes.find((theme) => theme.isEnabled)
  if (theme !== undefined) theme.scale = msg.data.scale

  if (msg.feature === 'ADD_STOP' || msg.feature === 'DELETE_STOP')
    palette.themes
      .filter((theme) => !theme.isEnabled)
      .forEach((theme) => {
        const currentScaleArray = Object.entries(theme.scale)

        const isInverted = currentScaleArray.every((val, index, arr) => {
          if (index === 0) return true
          return (
            parseFloat(val[1].toString()) <
            parseFloat(arr[index - 1][1].toString())
          )
        })

        const scaleValues = Object.values(theme.scale)
        const scaleMin = !isInverted
          ? Math.max(...scaleValues)
          : Math.min(...scaleValues)
        const scaleMax = !isInverted
          ? Math.min(...scaleValues)
          : Math.max(...scaleValues)

        theme.scale = doScale(
          Object.keys(msg.data.scale).map((stop) => parseFloat(stop)),
          scaleMin,
          scaleMax
        )

        if (!isInverted) {
          const newScaleArray = Object.entries(theme.scale)
          theme.scale = Object.fromEntries(newScaleArray.reverse())
        }
      })

  palette.base.preset = msg.data.preset
  palette.base.shift = msg.data.shift
  palette.base.preset = msg.data.preset

  palette.libraryData = new Data(palette).makeLibraryData(
    ['style_id'],
    palette.libraryData
  )

  palette.meta.dates.updatedAt = now
  penpot.ui.sendMessage({
    type: 'UPDATE_PALETTE_DATE',
    data: now,
  })

  penpot.ui.sendMessage({
    type: 'LOAD_PALETTE',
    data: palette,
  })
  penpot.currentPage?.setPluginData(
    `palette_${msg.data.id}`,
    JSON.stringify(palette)
  )

  await new Promise((r) => setTimeout(r, 1000))
  await penpot.currentFile?.saveVersion(
    `${palette.base.name} - ${locales.get().events.scaleUpdated}`
  )

  return palette
}

export default updateScale
