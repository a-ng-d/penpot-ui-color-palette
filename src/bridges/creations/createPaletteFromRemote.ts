import {
  BaseConfiguration,
  Data,
  MetaConfiguration,
  ThemeConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { tolgee } from '../..'

interface Msg {
  data: {
    base: BaseConfiguration
    themes: Array<ThemeConfiguration>
    meta: MetaConfiguration
  }
}

const createPaletteFromRemote = async (msg: Msg) => {
  const localPalette = penpot.currentPage?.getSharedPluginData(
    'uicp',
    `palette_${msg.data.meta.id}`
  )

  if (
    localPalette !== null &&
    localPalette !== undefined &&
    localPalette !== ''
  )
    throw new Error(tolgee.t('info.addToLocal'))

  const palette = new Data({
    base: {
      name: msg.data.base.name,
      description: msg.data.base.description,
      preset: msg.data.base.preset,
      shift: msg.data.base.shift,
      areSourceColorsLocked: msg.data.base.areSourceColorsLocked,
      colors: msg.data.base.colors,
      colorSpace: msg.data.base.colorSpace,
      algorithmVersion: msg.data.base.algorithmVersion,
    },
    themes: msg.data.themes,
    meta: {
      id: msg.data.meta.id,
      dates: {
        createdAt: msg.data.meta.dates.createdAt,
        updatedAt: msg.data.meta.dates.updatedAt,
        publishedAt: msg.data.meta.dates.publishedAt,
        openedAt: new Date().toISOString(),
      },
      creatorIdentity: {
        creatorId: msg.data.meta.creatorIdentity.creatorId,
        creatorFullName: msg.data.meta.creatorIdentity.creatorFullName,
        creatorAvatar: msg.data.meta.creatorIdentity.creatorAvatar,
      },
      publicationStatus: {
        isShared: msg.data.meta.publicationStatus.isShared,
        isPublished: msg.data.meta.publicationStatus.isPublished,
      },
    },
  }).makePaletteFullData()

  penpot.currentPage?.setSharedPluginData(
    'uicp',
    `palette_${palette.meta.id}`,
    JSON.stringify(palette)
  )
  penpot.ui.sendMessage({
    type: 'LOAD_PALETTE',
    data: palette,
  })

  await new Promise((r) => setTimeout(r, 1000))
  await penpot.currentFile?.saveVersion(
    `${palette.base.name} - ${tolgee.t('events.palettePulled')}`
  )

  return palette
}

export default createPaletteFromRemote
