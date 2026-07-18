import scheduleSaveVersion from '../../utils/scheduleSaveVersion'
import { tolgee } from '../..'

const deletePalette = async (id: string) => {
  const rawPalette = penpot.currentPage?.getSharedPluginData(
    'uicp',
    `palette_${id}`
  )

  if (rawPalette === undefined || rawPalette === null)
    throw new Error(tolgee.t('error.unfoundPalette'))

  const palette = JSON.parse(rawPalette)

  penpot.currentPage?.setSharedPluginData('uicp', `palette_${id}`, '')

  scheduleSaveVersion(
    `${palette.base.name} - ${tolgee.t('events.paletteRemoved')}`
  )

  return palette
}

export default deletePalette
