import { Data, FullConfiguration } from '@yelbolt/engine-ui-color-palette'
import { ThemesMessage } from '../../types/messages'
import { tolgee } from '../..'

const updateThemes = async (msg: ThemesMessage) => {
  const now = new Date().toISOString()
  const palette: FullConfiguration = JSON.parse(
    penpot.currentPage?.getSharedPluginData('uicp', `palette_${msg.id}`) ?? '{}'
  )

  palette.themes = msg.data

  palette.libraryData = new Data(palette).makeLibraryData(
    ['style_id', 'theme_id', 'set_id', 'token_id'],
    palette.libraryData
  )

  palette.meta.dates.updatedAt = now
  penpot.ui.sendMessage({
    type: 'UPDATE_PALETTE_DATE',
    data: now,
  })

  penpot.currentPage?.setSharedPluginData(
    'uicp',
    `palette_${msg.id}`,
    JSON.stringify(palette)
  )

  await new Promise((r) => setTimeout(r, 1000))
  await penpot.currentFile?.saveVersion(
    `${palette.base.name} - ${tolgee.t('events.themesUpdated')}`
  )

  return palette
}

export default updateThemes
