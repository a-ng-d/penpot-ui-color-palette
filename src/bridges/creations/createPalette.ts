import { uid } from 'uid'
import { lang, locals } from '../../content/locals'
import {
  ColorConfiguration,
  MetaConfiguration,
  PaletteConfiguration,
  SourceColorConfiguration,
  ThemeConfiguration,
} from '../../types/configurations'
import Data from '../../utils/Data'

interface Msg {
  data: {
    sourceColors: Array<SourceColorConfiguration>
    palette: PaletteConfiguration
    themes?: Array<ThemeConfiguration>
    isRemote?: boolean
    paletteMeta?: MetaConfiguration
  }
}

const createPalette = async (msg: Msg) => {
  const colors: Array<ColorConfiguration> = msg.data.sourceColors
    .map((sourceColor) => {
      return {
        name: sourceColor.name,
        description: '',
        rgb: sourceColor.rgb,
        id: uid(),
        hue: {
          shift: 0,
          isLocked: false,
        },
        chroma: {
          shift: msg.data.palette.shift.chroma,
          isLocked: false,
        },
      }
    })
    .sort((a, b) => {
      if (a.name.localeCompare(b.name) > 0) return 1
      else if (a.name.localeCompare(b.name) < 0) return -1
      else return 0
    })

  const themes: Array<ThemeConfiguration> = [
    {
      name: locals[lang].themes.switchTheme.defaultTheme,
      description: '',
      scale: msg.data.palette.scale,
      paletteBackground: '#FFFFFF',
      visionSimulationMode: 'NONE',
      textColorsTheme: msg.data.palette.textColorsTheme,
      isEnabled: true,
      id: '00000000000',
      type: 'default theme',
    },
  ]

  new Data({
    base: {
      name: msg.data.palette.name,
      description: msg.data.palette.description,
      preset: msg.data.palette.preset,
      scale: msg.data.palette.scale,
      shift: msg.data.palette.shift,
      areSourceColorsLocked: msg.data.palette.areSourceColorsLocked,
      colors: colors,
      themes: themes,
      colorSpace: msg.data.palette.colorSpace,
      visionSimulationMode: msg.data.palette.visionSimulationMode,
      view: msg.data.palette.view,
      textColorsTheme: msg.data.palette.textColorsTheme,
      algorithmVersion: msg.data.palette.algorithmVersion,
    },
    meta: {
      id: uid(),
      dates: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: '',
      },
      creatorIdentity: {
        creatorId: msg.data.paletteMeta?.creatorIdentity?.creatorId ?? '',
        creatorFullName:
          msg.data.paletteMeta?.creatorIdentity?.creatorFullName ?? '',
        creatorAvatar:
          msg.data.paletteMeta?.creatorIdentity?.creatorAvatar ?? '',
      },
      publicationStatus: {
        isShared: false,
        isPublished: false,
      },
    },
  }).makePaletteFullData()

  return true
}

export default createPalette
