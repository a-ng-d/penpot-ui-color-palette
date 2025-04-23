import { Board } from '@penpot/plugin-types'
import { uid } from 'uid'
import { FullConfiguration } from '../../types/configurations'

const createPaletteFromDocument = async () => {
  const document = penpot.selection[0] as Board
  const backup = JSON.parse(
    document.getPluginData('backup')
  ) as FullConfiguration

  // Update
  const now = new Date().toISOString()
  backup.meta.id = uid()
  backup.meta.dates.createdAt = now
  backup.meta.dates.updatedAt = now

  document.setPluginData('id', backup.meta.id)
  document.setPluginData('createdAt', now)
  document.setPluginData('updatedAt', now)

  penpot.currentPage?.setPluginData(
    `palette_${backup.meta.id}`,
    JSON.stringify(backup)
  )

  penpot.ui.sendMessage({
    type: 'LOAD_PALETTE',
    data: backup,
  })

  return true
}

export default createPaletteFromDocument
