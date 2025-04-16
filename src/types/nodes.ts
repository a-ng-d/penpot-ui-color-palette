import { ImageData } from '@penpot/plugin-types'
import { Service } from './app'
import {
  AlgorithmVersionConfiguration,
  ColorConfiguration,
  ColorSpaceConfiguration,
  LockedSourceColorsConfiguration,
  PresetConfiguration,
  ScaleConfiguration,
  ThemeConfiguration,
  ViewConfiguration,
  VisionSimulationModeConfiguration,
} from './configurations'
import { TextColorsThemeHexModel } from './models'

export interface PaletteNode {
  name: string
  description: string
  preset: PresetConfiguration
  scale: ScaleConfiguration
  areSourceColorsLocked: LockedSourceColorsConfiguration
  colors: Array<ColorConfiguration>
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  themes: Array<ThemeConfiguration>
  view: ViewConfiguration
  algorithmVersion: AlgorithmVersionConfiguration
  textColorsTheme: TextColorsThemeHexModel
  creatorFullName?: string
  creatorAvatar?: string
  creatorAvatarImg?: ImageData | null
  service?: Service
}
