import { tolgee } from '../..'

const deletePalette = async (id: string) => {
  const rawPalette = penpot.currentPage?.getPluginData(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    throw new Error(tolgee.t('error.unfoundPalette'))

  const palette = JSON.parse(rawPalette)

  penpot.currentPage?.setPluginData(`palette_${id}`, '')

  await new Promise((r) => setTimeout(r, 1000))
  await penpot.currentFile?.saveVersion(
    `${palette.base.name} - ${tolgee.t('events.paletteRemoved')}`
  )

  return palette
}

export default deletePalette
