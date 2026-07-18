import { Data, FullConfiguration } from '@yelbolt/engine-ui-color-palette'
import scheduleSaveVersion from '../../utils/scheduleSaveVersion'
import { ColorsMessage } from '../../types/messages'
import { tolgee } from '../..'

const updateColors = async (msg: ColorsMessage) => {
  const now = new Date().toISOString()
  const palette: FullConfiguration = JSON.parse(
    penpot.currentPage?.getSharedPluginData('uicp', `palette_${msg.id}`) ?? '{}'
  )

  palette.base.colors = msg.data

  palette.meta.dates.updatedAt = now
  penpot.ui.sendMessage({
    type: 'UPDATE_PALETTE_DATE',
    data: now,
  })

  palette.libraryData = new Data(palette).makeLibraryData(
    ['style_id', 'theme_id', 'set_id', 'token_id'],
    palette.libraryData
  )

  penpot.currentPage?.setSharedPluginData(
    'uicp',
    `palette_${msg.id}`,
    JSON.stringify(palette)
  )

  scheduleSaveVersion(
    `${palette.base.name} - ${tolgee.t('events.colorsUpdated')}`
  )

  return palette
}

export default updateColors
