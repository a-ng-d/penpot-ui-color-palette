import {
  AlgorithmVersionConfiguration,
  ColorConfiguration,
  ColorSpaceConfiguration,
  BaseConfiguration,
  ThemeConfiguration,
  VisionSimulationModeConfiguration,
  ViewConfiguration,
} from './configurations'
import { TextColorsThemeHexModel } from './models'

export interface ScaleMessage {
  type: 'UPDATE_SCALE'
  id: string
  data: BaseConfiguration
  isEditedInRealTime: boolean
  feature?: string
}

export interface ColorsMessage {
  type: 'UPDATE_COLORS'
  id: string
  data: Array<ColorConfiguration>
  isEditedInRealTime: boolean
}

export interface ThemesMessage {
  type: 'UPDATE_THEMES'
  id: string
  data: Array<ThemeConfiguration>
  isEditedInRealTime: boolean
}

export interface ViewMessage {
  type: 'UPDATE_VIEW'
  data: BaseConfiguration
  isEditedInRealTime: boolean
}

export interface SettingsMessage {
  type: 'UPDATE_SETTINGS'
  id: string
  data: {
    name: string
    description: string
    colorSpace: ColorSpaceConfiguration
    visionSimulationMode: VisionSimulationModeConfiguration
    algorithmVersion: AlgorithmVersionConfiguration
    textColorsTheme: TextColorsThemeHexModel
  }
  isEditedInRealTime: boolean
}

export interface CollectionMessage {
  type: 'UPDATE_COLLECTION'
  data: {
    id: string
  }
  isEditedInRealTime: boolean
}
