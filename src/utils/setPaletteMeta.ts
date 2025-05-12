import { ColorConfiguration, ThemeConfiguration } from '../types/configurations'
import { locals } from '../content/locals'

const getPaletteMeta = (
  colors: Array<ColorConfiguration>,
  themes: Array<ThemeConfiguration>
) => {
  const colorsNumber = colors.length,
    themesNumber = themes.filter(
      (theme) => theme.type === 'custom theme'
    ).length,
    shadeNumber = Object.values(themes[0].scale).length

  let colorLabel: string, themeLabel: string, shadeLabel: string

  if (colorsNumber > 1)
    colorLabel = locals
      .get()
      .actions.sourceColorsNumber.several.replace('$1', colorsNumber)
  else
    colorLabel = locals
      .get()
      .actions.sourceColorsNumber.single.replace('$1', colorsNumber)

  if (themesNumber > 1)
    themeLabel = locals
      .get()
      .actions.colorThemesNumber.several.replace('$1', themesNumber)
  else
    themeLabel = locals
      .get()
      .actions.colorThemesNumber.single.replace('$1', themesNumber)

  if (shadeNumber > 1)
    shadeLabel = locals
      .get()
      .actions.shadesNumber.several.replace('$1', shadeNumber)
  else
    shadeLabel = locals
      .get()
      .actions.shadesNumber.single.replace('$1', shadeNumber)

  return `${colorLabel}${locals.get().separator}${shadeLabel}${locals.get().separator}${themeLabel}`
}

export default getPaletteMeta
