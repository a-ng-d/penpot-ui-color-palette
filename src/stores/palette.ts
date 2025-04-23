import { deepMap } from 'nanostores'
import { BaseConfiguration } from 'src/types/configurations'
import { algorithmVersion } from '../config'
import { lang, locals } from '../content/locals'
import { presets } from './presets'

export const $palette = deepMap<BaseConfiguration>({
  id: '',
  name: locals[lang].settings.global.name.default,
  description: '',
  min: 0,
  max: 100,
  preset: presets[0],
  scale: {},
  shift: {
    chroma: 100,
  },
  areSourceColorsLocked: false,
  colorSpace: 'LCH',
  visionSimulationMode: 'NONE',
  algorithmVersion: algorithmVersion,
  textColorsTheme: {
    lightColor: '#FFFFFF',
    darkColor: '#000000',
  },
  colors: [],
  themes: [],
})
