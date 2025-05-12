import { HexModel } from '@a_ng_d/figmug-ui'

import {
  ColorConfiguration,
  PresetConfiguration,
  ThemeConfiguration,
} from './configurations'
import { RgbaComponent, RgbComponent } from './models'

export interface PaletteData {
  name: string
  description: string
  themes: Array<PaletteDataThemeItem>
  collectionId?: string
  version: string
  type: 'palette'
}

export interface PaletteDataThemeItem {
  id: string
  name: string
  description: string
  colors: Array<PaletteDataColorItem>
  modeId?: string
  type: 'default theme' | 'custom theme'
}

export interface PaletteDataColorItem {
  id: string
  name: string
  description: string
  shades: Array<PaletteDataShadeItem>
  type: 'color'
}

export interface PaletteDataShadeItem {
  name: string
  description: string
  hex: HexModel
  rgb: RgbComponent
  gl: RgbaComponent
  lch: RgbComponent
  oklch: RgbComponent
  lab: RgbComponent
  oklab: RgbComponent
  hsl: RgbComponent
  hsluv: RgbComponent
  alpha?: number
  backgroundColor?: RgbComponent
  mixedColor?: RgbComponent
  styleId: string
  isClosestToRef?: boolean
  isSourceColorLocked?: boolean
  isTransparent?: boolean
  type: 'source color' | 'color shade'
}

export interface ColourLovers {
  id: number
  apiUrl: string
  badgeUrl: string
  colors: Array<HexModel>
  dateCreated: Date | string
  description: string
  imageUrl: string
  numComments: number
  numHearts: number
  numViews: number
  numVotes: number
  rank: number
  title: string
  url: string
  userName: string
}

export interface ExternalPalettes {
  palette_id: string
  screenshot: string
  name: string
  preset: PresetConfiguration
  colors: Array<ColorConfiguration>
  themes: Array<ThemeConfiguration>
  creator_avatar: string
  creator_full_name: string
  creator_id: string
  is_shared: boolean
}
