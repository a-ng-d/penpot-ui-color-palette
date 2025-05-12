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
import { RgbComponent } from '../types/models'

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
              render: 'RGB',
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
              alpha: color.alpha.isEnabled
                ? parseFloat((lightness[1] / 100).toFixed(2))
                : undefined,
            })

            if (color.alpha.isEnabled) {
              const backgroundColorData = new Color({
                render: 'RGB',
                sourceColor: chroma(color.alpha.backgroundColor).rgb(),
                algorithmVersion: this.base.algorithmVersion,
                visionSimulationMode: theme.visionSimulationMode,
                alpha: 1,
              })

              switch (this.base.colorSpace) {
                case 'LCH':
                  return this.base.areSourceColorsLocked
                    ? [
                        lightness,
                        colorData.setColorWithAlpha(),
                        backgroundColorData.setColorWithAlpha(),
                      ]
                    : [lightness, colorData.lcha(), backgroundColorData.lcha()]
                case 'OKLCH':
                  return this.base.areSourceColorsLocked
                    ? [
                        lightness,
                        colorData.setColorWithAlpha(),
                        backgroundColorData.setColorWithAlpha(),
                      ]
                    : [
                        lightness,
                        colorData.oklcha(),
                        backgroundColorData.oklcha(),
                      ]
                case 'LAB':
                  return this.base.areSourceColorsLocked
                    ? [
                        lightness,
                        colorData.setColorWithAlpha(),
                        backgroundColorData.laba(),
                      ]
                    : [lightness, colorData.laba(), backgroundColorData.laba()]
                case 'OKLAB':
                  return this.base.areSourceColorsLocked
                    ? [
                        lightness,
                        colorData.setColorWithAlpha(),
                        backgroundColorData.setColorWithAlpha(),
                      ]
                    : [
                        lightness,
                        colorData.oklaba(),
                        backgroundColorData.oklaba(),
                      ]
                case 'HSL':
                  return this.base.areSourceColorsLocked
                    ? [
                        lightness,
                        colorData.setColorWithAlpha(),
                        backgroundColorData.setColorWithAlpha(),
                      ]
                    : [lightness, colorData.hsl(), backgroundColorData.hsl()]
                case 'HSLUV':
                  return this.base.areSourceColorsLocked
                    ? [
                        lightness,
                        colorData.setColorWithAlpha(),
                        backgroundColorData.setColorWithAlpha(),
                      ]
                    : [
                        lightness,
                        colorData.hsluv(),
                        backgroundColorData.hsluv(),
                      ]
                default:
                  return [lightness, [0, 0, 0], [255, 255, 255]]
              }
            }

            switch (this.base.colorSpace) {
              case 'LCH':
                return [lightness, colorData.lch()]
              case 'OKLCH':
                return [lightness, colorData.oklch()]
              case 'LAB':
                return [lightness, colorData.lab()]
              case 'OKLAB':
                return [lightness, colorData.oklab()]
              case 'HSL':
                return [lightness, colorData.hsl()]
              case 'HSLUV':
                return [lightness, colorData.hsluv()]
              default:
                return [lightness, [0, 0, 0]]
            }
          })

        const paletteDataColorItem: PaletteDataColorItem = {
            id: color.id,
            name: color.name,
            description: color.description,
            shades: [],
            type: 'color',
          },
          sourceColor: RgbComponent = [
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
            chroma(shade[1] as RgbComponent).hex(),
            'rgb'
          )
        )
        const minDistanceIndex = distances.indexOf(Math.min(...distances))

        scaledColors.forEach((scaledColor, index) => {
          const distance: number = chroma.distance(
            chroma(sourceColor).hex(),
            chroma(scaledColor[1] as RgbComponent).hex(),
            'rgb'
          )

          const scaleName: string =
            Object.keys(this.currentScale).find(
              (key) => key === scaledColor[0][0]
            ) ?? '0'
          const newHsluv = new Hsluv()
          newHsluv.rgb_r = Number(scaledColor[1][0]) / 255
          newHsluv.rgb_g = Number(scaledColor[1][1]) / 255
          newHsluv.rgb_b = Number(scaledColor[1][2]) / 255
          newHsluv.rgbToHsluv()

          paletteDataColorItem.shades.push({
            name: scaleName,
            description: `Shade color with ${typeof scaledColor[0][1] === 'number' ? scaledColor[0][1].toFixed(1) : scaledColor[0][1]}% of ${
              color.alpha.isEnabled ? 'opacity' : 'lightness'
            }`,
            hex:
              index === minDistanceIndex && this.base.areSourceColorsLocked
                ? chroma(sourceColor).hex()
                : chroma(scaledColor[1] as RgbComponent).hex(),
            rgb:
              index === minDistanceIndex && this.base.areSourceColorsLocked
                ? chroma(sourceColor).rgb()
                : chroma(scaledColor[1] as RgbComponent).rgb(),
            gl:
              index === minDistanceIndex && this.base.areSourceColorsLocked
                ? chroma(sourceColor).gl()
                : chroma(scaledColor[1] as RgbComponent).gl(),
            lch:
              index === minDistanceIndex && this.base.areSourceColorsLocked
                ? chroma(sourceColor).lch()
                : chroma(scaledColor[1] as RgbComponent).lch(),
            oklch:
              index === minDistanceIndex && this.base.areSourceColorsLocked
                ? chroma(sourceColor).oklch()
                : chroma(scaledColor[1] as RgbComponent).oklch(),
            lab:
              index === minDistanceIndex && this.base.areSourceColorsLocked
                ? chroma(sourceColor).lab()
                : chroma(scaledColor[1] as RgbComponent).lab(),
            oklab:
              index === minDistanceIndex && this.base.areSourceColorsLocked
                ? chroma(sourceColor).oklab()
                : chroma(scaledColor[1] as RgbComponent).oklab(),
            hsl:
              index === minDistanceIndex && this.base.areSourceColorsLocked
                ? chroma(sourceColor).hsl()
                : chroma(scaledColor[1] as RgbComponent).hsl(),
            hsluv: [newHsluv.hsluv_h, newHsluv.hsluv_s, newHsluv.hsluv_l],
            alpha: color.alpha.isEnabled
              ? parseFloat(((scaledColor[0][1] as number) / 100).toFixed(2))
              : undefined,
            backgroundColor:
              color.alpha.isEnabled && color.alpha.backgroundColor
                ? chroma(scaledColor[2] as RgbComponent).rgb()
                : undefined,
            mixedColor:
              color.alpha.isEnabled && color.alpha.backgroundColor
                ? new Color({
                    visionSimulationMode: theme.visionSimulationMode,
                  }).mixColorsRgb(
                    [
                      ...(scaledColor[1] as RgbComponent),
                      parseFloat(
                        ((scaledColor[0][1] as number) / 100).toFixed(2)
                      ),
                    ],
                    [...(scaledColor[2] as RgbComponent), 1]
                  )
                : undefined,
            styleId: this.searchForShadeStyleId(
              previousData?.themes ?? this.paletteData.themes,
              theme.id,
              color.id,
              scaleName
            ),
            isClosestToRef: distance < 4 && !this.base.areSourceColorsLocked,
            isSourceColorLocked:
              index === minDistanceIndex &&
              this.base.areSourceColorsLocked &&
              !color.alpha.isEnabled,
            isTransparent: color.alpha.isEnabled,
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
