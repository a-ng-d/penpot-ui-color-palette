import { Data, FullConfiguration } from '@yelbolt/engine-ui-color-palette'
import scheduleSaveVersion from '../../utils/scheduleSaveVersion'
import { PaletteMessage } from '../../types/messages'
import { tolgee } from '../..'

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
    penpot.currentPage?.getSharedPluginData('uicp', `palette_${msg.id}`) ?? '{}'
  )

  msg.items.forEach((item) => {
    const pathParts = item.key.split('.')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: Record<string, any> = palette

    for (let i = 0; i < pathParts.length - 1; i++) {
      if (current[pathParts[i]] === undefined) current[pathParts[i]] = {}
      current = current[pathParts[i]]
    }

    current[pathParts[pathParts.length - 1]] = item.value
  })

  palette.libraryData = new Data(palette).makeLibraryData(
    ['style_id', 'theme_id', 'set_id', 'token_id'],
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

  penpot.currentPage?.setSharedPluginData(
    'uicp',
    `palette_${msg.id}`,
    JSON.stringify(palette)
  )

  scheduleSaveVersion(
    `${palette.base.name} - ${tolgee.t('events.paletteUpdated')}`
  )

  return palette
}

export default updatePalette
