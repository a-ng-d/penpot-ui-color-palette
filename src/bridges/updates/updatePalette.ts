import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { PaletteMessage } from '../../types/messages'
import { locales } from '../../content/locales'

const updatePalette = async ({
  msg,
  isAlreadyUpdated = false,
  shouldLoadPalette = true,
}: {
  msg: PaletteMessage
  isAlreadyUpdated?: boolean
  shouldLoadPalette?: boolean
}) => {
  const now = new Date().toISOString()
  const palette: FullConfiguration = JSON.parse(
    penpot.currentPage?.getPluginData(`palette_${msg.id}`) ?? '{}'
  )

  msg.items.forEach((item) => {
    const flatPalette = flattenObject(palette)

    if (Object.keys(flatPalette).includes(item.key)) {
      const pathParts = item.key.split('.')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: Record<string, any> = palette

      for (let i = 0; i < pathParts.length - 1; i++)
        current = current[pathParts[i]]

      current[pathParts[pathParts.length - 1]] = item.value
    }
  })

  palette.libraryData = new Data(palette).makeLibraryData(
    ['style_id'],
    palette.libraryData
  )

  if (!isAlreadyUpdated) {
    palette.meta.dates.updatedAt = now
    penpot.ui.sendMessage({
      type: 'UPDATE_PALETTE_DATE',
      data: now,
    })
  }

  if (shouldLoadPalette)
    penpot.ui.sendMessage({
      type: 'LOAD_PALETTE',
      data: palette,
    })

  penpot.currentPage?.setPluginData(
    `palette_${msg.id}`,
    JSON.stringify(palette)
  )

  await new Promise((r) => setTimeout(r, 1000))
  await penpot.currentFile?.saveVersion(
    `${palette.base.name} - ${locales.get().events.paletteUpdated}`
  )

  return palette
}

const flattenObject = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: Record<string, any>,
  prefix = ''
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Object.keys(obj).reduce((acc: Record<string, any>, key: string) => {
    const pre = prefix.length ? `${prefix}.` : ''

    if (
      typeof obj[key] === 'object' &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    )
      Object.assign(acc, flattenObject(obj[key], pre + key))
    else acc[pre + key] = obj[key]

    return acc
  }, {})
}

export default updatePalette
