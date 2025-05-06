import { HexModel, RgbModel } from '@a_ng_d/figmug-ui'

import { Easing, ThirdParty } from './app'
import { TextColorsThemeHexModel } from './models'
import { PaletteData } from './data'

export interface SourceColorConfiguration {
  name: string
  rgb: RgbModel
  source: 'CANVAS' | 'REMOTE' | ThirdParty
  id: string
  isRemovable: boolean
  hue?: {
    shift: number
    isLocked: boolean
  }
  chroma?: {
    shift: number
    isLocked: boolean
  }
}

export interface BaseConfiguration {
  [key: string]: string | number | boolean | object | undefined
  name: string
  description: string
  preset: PresetConfiguration
  shift: ShiftConfiguration
  areSourceColorsLocked: LockedSourceColorsConfiguration
  colors: Array<ColorConfiguration>
  colorSpace: ColorSpaceConfiguration
  algorithmVersion: AlgorithmVersionConfiguration
}

export interface ExchangeConfiguration {
  [key: string]: string | number | boolean | object | undefined
  name: string
  description: string
  preset: PresetConfiguration
  scale: ScaleConfiguration
  shift: ShiftConfiguration
  areSourceColorsLocked: LockedSourceColorsConfiguration
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  textColorsTheme: TextColorsThemeHexModel
  algorithmVersion: AlgorithmVersionConfiguration
}

export interface ExtractOfBaseConfiguration {
  id: string
  name: string
  preset: string
  colors: Array<ColorConfiguration>
  themes: Array<ThemeConfiguration>
  screenshot: Uint8Array | null
  devStatus: string | null
}

export interface PresetConfiguration {
  id: string
  name: string
  scale: Array<number>
  min: number
  max: number
  easing: Easing
  family?: string
}

export type ScaleConfiguration = Record<string, number>

export interface ShiftConfiguration {
  chroma: number
}

export type LockedSourceColorsConfiguration = boolean

export interface ColorConfiguration {
  id: string
  name: string
  description: string
  rgb: RgbModel
  hue: {
    shift: number
    isLocked: boolean
  }
  chroma: {
    shift: number
    isLocked: boolean
  }
  transparency: {
    isEnabled: boolean
    backgroundColor: HexModel
  }
}

export interface ThemeConfiguration {
  id: string
  name: string
  description: string
  scale: ScaleConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  textColorsTheme: TextColorsThemeHexModel
  paletteBackground: HexModel
  isEnabled: boolean
  type: 'default theme' | 'custom theme'
}

export interface ExportConfiguration {
  format: 'JSON' | 'CSS' | 'TAILWIND' | 'SWIFT' | 'KT' | 'XML' | 'CSV'
  context:
    | 'TOKENS_DTCG'
    | 'TOKENS_GLOBAL'
    | 'TOKENS_AMZN_STYLE_DICTIONARY'
    | 'TOKENS_TOKENS_STUDIO'
    | 'CSS'
    | 'TAILWIND'
    | 'APPLE_SWIFTUI'
    | 'APPLE_UIKIT'
    | 'ANDROID_COMPOSE'
    | 'ANDROID_XML'
    | 'CSV'
  label: string
  colorSpace: ColorSpaceConfiguration
  mimeType:
    | 'application/json'
    | 'text/css'
    | 'text/javascript'
    | 'text/swift'
    | 'text/x-kotlin'
    | 'text/xml'
    | 'text/csv'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}

export type ColorSpaceConfiguration =
  | 'LCH'
  | 'OKLCH'
  | 'LAB'
  | 'OKLAB'
  | 'HSL'
  | 'HSLUV'
  | 'RGB'
  | 'HEX'
  | 'P3'

export type VisionSimulationModeConfiguration =
  | 'NONE'
  | 'PROTANOMALY'
  | 'PROTANOPIA'
  | 'DEUTERANOMALY'
  | 'DEUTERANOPIA'
  | 'TRITANOMALY'
  | 'TRITANOPIA'
  | 'ACHROMATOMALY'
  | 'ACHROMATOPSIA'

export type ViewConfiguration = 'PALETTE_WITH_PROPERTIES' | 'PALETTE' | 'SHEET'

export type AlgorithmVersionConfiguration = 'v1' | 'v2' | 'v3'

export interface DatesConfiguration {
  createdAt: Date | string
  updatedAt: Date | string
  publishedAt: Date | string
}

export interface PublicationConfiguration {
  isPublished: boolean
  isShared: boolean
}

export interface CreatorConfiguration {
  creatorFullName: string
  creatorAvatar: string
  creatorId: string
}

export interface UserConfiguration {
  id: string
  fullName: string
  avatar: string
}

export interface MetaConfiguration {
  id: string
  dates: DatesConfiguration
  publicationStatus: PublicationConfiguration
  creatorIdentity: CreatorConfiguration
}

export interface FullConfiguration {
  base: BaseConfiguration
  themes: Array<ThemeConfiguration>
  meta: MetaConfiguration
  data: PaletteData
  type: 'UI_COLOR_PALETTE'
}

export interface DocumentConfiguration {
  id?: string
  view?: ViewConfiguration
  isLinkedToPalette?: boolean
  updatedAt?: Date | string
}
