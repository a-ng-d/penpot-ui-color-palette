import { Board } from '@penpot/plugin-types'
import { FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import processSelection from '../processSelection'
import { locales } from '../../content/locales'

const createPaletteFromDocument = async () => {
  const document = penpot.selection[0] as Board
  const backup = JSON.parse(
    document.getPluginData('backup')
  ) as FullConfiguration

  penpot.currentPage?.setPluginData(
    `palette_${backup.meta.id}`,
    JSON.stringify(backup)
  )
  penpot.ui.sendMessage({
    type: 'LOAD_PALETTE',
    data: backup,
  })
  processSelection()

  await new Promise((r) => setTimeout(r, 1000))
  await penpot.currentFile?.saveVersion(
    `${backup.base.name} - ${locales.get().events.paletteCreatedFromDocument}`
  )

  return backup
}

export default createPaletteFromDocument
