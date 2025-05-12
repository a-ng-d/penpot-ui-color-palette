import { HexModel } from '@a_ng_d/figmug-ui'

export interface RgbModel {
  r: number
  g: number
  b: number
}

export type RgbComponent = [number, number, number]

export type RgbaComponent = [number, number, number, number]

export type ColorFormat<T extends 'HEX' | 'RGB'> = T extends 'HEX'
  ? HexModel
  : RgbComponent | RgbaComponent

export interface TextColorsThemeHexModel {
  lightColor: HexModel
  darkColor: HexModel
}

export interface TextColorsThemeGLModel {
  lightColor: Array<number>
  darkColor: Array<number>
}

export interface ActionsList {
  [action: string]: () => void
}
