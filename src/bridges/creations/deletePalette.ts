import { locales } from '../../content/locales'

const deletePalette = async (id: string) => {
  const rawPalette = penpot.currentPage?.getPluginData(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    throw new Error(locales.get().error.unfoundPalette)

  const palette = JSON.parse(rawPalette)

  penpot.currentFile?.saveVersion(
    `${palette.base.name} - ${locales.get().events.paletteRemoved}`
  )

  return penpot.currentPage?.setPluginData(`palette_${id}`, '')
}

export default deletePalette
