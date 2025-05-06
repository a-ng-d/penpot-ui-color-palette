import chroma from 'chroma-js'
import { Hsluv } from 'hsluv'
import { paletteDataVersion } from '../config'
import { locals } from '../content/locals'
import {
  MetaConfiguration,
  BaseConfiguration,
  ScaleConfiguration,
  ThemeConfiguration,
  FullConfiguration,
} from '../types/configurations'
import {
  PaletteData,
  PaletteDataColorItem,
  PaletteDataThemeItem,
} from '../types/data'
import Color from './Color'
import defaultTheme from '../stores/theme'

export default class Data {
  private base: BaseConfiguration
  private themes: Array<ThemeConfiguration>
  private meta: MetaConfiguration
  private paletteData: PaletteData
  private currentScale: ScaleConfiguration

  constructor({
    base,
    themes,
    meta,
  }: {
    base: BaseConfiguration
    themes: Array<ThemeConfiguration>
    meta: MetaConfiguration
  }) {
    this.base = base
    this.themes = themes
    this.meta = meta
    this.paletteData = {
      name: base.name ?? locals.get().name,
      description: base.description,
      themes: [],
      version: paletteDataVersion,
      type: 'palette',
    }
    this.currentScale =
      themes.find((theme) => theme.isEnabled)?.scale ?? defaultTheme.scale
  }

  searchForShadeStyleId = (
    themes: Array<PaletteDataThemeItem>,
    themeId: string,
    colorId: string,
    shadeName: string
  ) => {
    const themeMatch = themes.find((theme) => theme.id === themeId),
      colorMatch =
        themeMatch === undefined
          ? undefined
          : themeMatch.colors.find((color) => color.id === colorId),
      shadeMatch =
        colorMatch === undefined
          ? undefined
          : colorMatch.shades.find((shade) => shade.name === shadeName),
      styleId = shadeMatch === undefined ? '' : shadeMatch.styleId

    return styleId === undefined ? '' : styleId
  }

  makePaletteData = (previousData?: PaletteData) => {
    this.themes.forEach((theme) => {
      const paletteDataThemeItem: PaletteDataThemeItem = {
        id: theme.id,
        name: theme.name,
        description: theme.description,
        colors: [],
        type: theme.type,
      }
      this.base.colors.forEach((color) => {
        const scaledColors = Object.entries(theme.scale)
          .reverse()
          .map((lightness) => {
            const colorData = new Color({
              render: 'RGB' as 'HEX' | 'RGB',
              sourceColor: [
                color.rgb.r * 255,
                color.rgb.g * 255,
                color.rgb.b * 255,
              ],
              lightness: lightness[1],
              hueShifting: color.hue.shift !== undefined ? color.hue.shift : 0,
              chromaShifting:
                color.chroma.shift !== undefined ? color.chroma.shift : 100,
              algorithmVersion: this.base.algorithmVersion,
              visionSimulationMode: theme.visionSimulationMode,
            })
            if (color.transparency.isEnabled)
              return [
                lightness,
                colorData.mixColorsRgb(
                  [
                    color.rgb.r * 255,
                    color.rgb.g * 255,
                    color.rgb.b * 255,
                    lightness[1] / 100,
                  ],
                  chroma(color.transparency.backgroundColor).rgba(false)
                ),
              ]
            if (this.base.colorSpace === 'LCH')
              return [lightness, colorData.lch()]
            else if (this.base.colorSpace === 'OKLCH')
              return [lightness, colorData.oklch()]
            else if (this.base.colorSpace === 'LAB')
              return [lightness, colorData.lab()]
            else if (this.base.colorSpace === 'OKLAB')
              return [lightness, colorData.oklab()]
            else if (this.base.colorSpace === 'HSL')
              return [lightness, colorData.hsl()]
            else if (this.base.colorSpace === 'HSLUV')
              return [lightness, colorData.hsluv()]
            return [lightness, colorData.lch()]
          }) as Array<[[string, number], [number, number, number]]>

        const paletteDataColorItem: PaletteDataColorItem = {
            id: color.id,
            name: color.name,
            description: color.description,
            shades: [],
            type: 'color',
          },
          sourceColor: [number, number, number] = [
            color.rgb.r * 255,
            color.rgb.g * 255,
            color.rgb.b * 255,
          ]

        const sourceHsluv = new Hsluv()
        sourceHsluv.rgb_r = color.rgb.r
        sourceHsluv.rgb_g = color.rgb.g
        sourceHsluv.rgb_b = color.rgb.b
        sourceHsluv.rgbToHsluv()

        paletteDataColorItem.shades.push({
          name: 'source',
          description: 'Source color',
          hex: chroma(sourceColor).hex(),
          rgb: sourceColor,
          gl: chroma(sourceColor).gl(),
          lch: chroma(sourceColor).lch(),
          oklch: chroma(sourceColor).oklch(),
          lab: chroma(sourceColor).lab(),
          oklab: chroma(sourceColor).oklab(),
          hsl: chroma(sourceColor).hsl(),
          hsluv: [
            sourceHsluv.hsluv_h,
            sourceHsluv.hsluv_s,
            sourceHsluv.hsluv_l,
          ],
          styleId: this.searchForShadeStyleId(
            previousData?.themes ?? this.paletteData.themes,
            theme.id,
            color.id,
            'source'
          ),
          type: 'source color',
        })

        const distances = scaledColors.map((shade) =>
          chroma.distance(
            chroma(sourceColor).hex(),
            chroma(shade[1]).hex(),
            'rgb'
          )
        )
        const minDistanceIndex = distances.indexOf(Math.min(...distances))

        scaledColors.forEach((scaledColor, index) => {
          const distance: number = chroma.distance(
            chroma(sourceColor).hex(),
            chroma(scaledColor[1]).hex(),
            'rgb'
          )

          const scaleName: string =
            Object.keys(this.currentScale).find(
              (key) => key === scaledColor[0][0]
            ) ?? '0'

          const newHsluv = new Hsluv()
          newHsluv.rgb_r = scaledColor[1][0] / 255
          newHsluv.rgb_g = scaledColor[1][1] / 255
          newHsluv.rgb_b = scaledColor[1][2] / 255
          newHsluv.rgbToHsluv()

          console.log(scaledColor[0])

          paletteDataColorItem.shades.push({
            name: scaleName,
            description: `Shade color with ${scaledColor[0][1].toFixed(1)}% of ${
              color.transparency.isEnabled ? 'opacity' : 'lightness'
            }`,
            hex:
              index === minDistanceIndex &&
              this.base.areSourceColorsLocked &&
              !color.transparency.isEnabled
                ? chroma(sourceColor).hex()
                : chroma(scaledColor[1]).hex(),
            rgb:
              index === minDistanceIndex &&
              this.base.areSourceColorsLocked &&
              !color.transparency.isEnabled
                ? chroma(sourceColor).rgb()
                : chroma(scaledColor[1]).rgb(),
            gl:
              index === minDistanceIndex &&
              this.base.areSourceColorsLocked &&
              !color.transparency.isEnabled
                ? chroma(sourceColor).gl()
                : chroma(scaledColor[1]).gl(),
            lch:
              index === minDistanceIndex &&
              this.base.areSourceColorsLocked &&
              !color.transparency.isEnabled
                ? chroma(sourceColor).lch()
                : chroma(scaledColor[1]).lch(),
            oklch:
              index === minDistanceIndex &&
              this.base.areSourceColorsLocked &&
              !color.transparency.isEnabled
                ? chroma(sourceColor).oklch()
                : chroma(scaledColor[1]).oklch(),
            lab:
              index === minDistanceIndex &&
              this.base.areSourceColorsLocked &&
              !color.transparency.isEnabled
                ? chroma(sourceColor).lab()
                : chroma(scaledColor[1]).lab(),
            oklab:
              index === minDistanceIndex &&
              this.base.areSourceColorsLocked &&
              !color.transparency.isEnabled
                ? chroma(sourceColor).oklab()
                : chroma(scaledColor[1]).oklab(),
            hsl:
              index === minDistanceIndex &&
              this.base.areSourceColorsLocked &&
              !color.transparency.isEnabled
                ? chroma(sourceColor).hsl()
                : chroma(scaledColor[1]).hsl(),
            hsluv: [newHsluv.hsluv_h, newHsluv.hsluv_s, newHsluv.hsluv_l],
            alpha: color.transparency.isEnabled
              ? parseFloat((scaledColor[0][1] / 100).toFixed(2))
              : undefined,
            styleId: this.searchForShadeStyleId(
              previousData?.themes ?? this.paletteData.themes,
              theme.id,
              color.id,
              scaleName
            ),
            isClosestToRef: distance < 4 && !this.base.areSourceColorsLocked,
            isSourceColorLocked:
              index === minDistanceIndex && this.base.areSourceColorsLocked,
            isTransparent: color.transparency.isEnabled,
            type: 'color shade',
          })
        })

        paletteDataThemeItem.colors.push(paletteDataColorItem)
      })
      this.paletteData.themes.push(paletteDataThemeItem)
    })

    return this.paletteData
  }

  makePaletteFullData = () => {
    const fullPaletteData = {
      base: this.base,
      themes: this.themes,
      meta: this.meta,
      data: this.makePaletteData(),
      type: 'UI_COLOR_PALETTE',
    } as FullConfiguration

    penpot.currentPage?.setPluginData(
      `palette_${this.meta.id}`,
      JSON.stringify(fullPaletteData)
    )

    return fullPaletteData
  }
}
