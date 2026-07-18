import { FullConfiguration } from '@yelbolt/engine-ui-color-palette'
import { Board } from '@penpot/plugin-types'
import processSelection from '../gets/processSelection'
import scheduleSaveVersion from '../../utils/scheduleSaveVersion'
import { tolgee } from '../..'

const createPaletteFromDocument = async () => {
  const document = penpot.selection[0] as Board
  const backup = JSON.parse(
    document.getSharedPluginData('uicp', 'backup')
  ) as FullConfiguration

  penpot.currentPage?.setSharedPluginData(
    'uicp',
    `palette_${backup.meta.id}`,
    JSON.stringify(backup)
  )
  penpot.ui.sendMessage({
    type: 'LOAD_PALETTE',
    data: backup,
  })
  processSelection()

  scheduleSaveVersion(
    `${backup.base.name} - ${tolgee.t('events.paletteCreatedFromDocument')}`
  )

  return backup
}

export default createPaletteFromDocument
