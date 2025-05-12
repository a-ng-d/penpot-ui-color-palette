import { deepMap } from 'nanostores'
import { ExchangeConfiguration } from '../types/configurations'
import { algorithmVersion } from '../config'
import { locals } from '../content/locals'
import { presets } from './presets'

export const $palette = deepMap<ExchangeConfiguration>({
  id: '',
  name: locals.get().settings.global.name.default,
  description: '',
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
  isThemeSwitched: false,
})
