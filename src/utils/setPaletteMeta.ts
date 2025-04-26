import {
  ColorConfiguration,
  ThemeConfiguration,
} from 'src/types/configurations'
import { lang, locals } from '../content/locals'

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
    colorLabel = locals[lang].actions.sourceColorsNumber.several.replace(
      '$1',
      colorsNumber
    )
  else
    colorLabel = locals[lang].actions.sourceColorsNumber.single.replace(
      '$1',
      colorsNumber
    )

  if (themesNumber > 1)
    themeLabel = locals[lang].actions.colorThemesNumber.several.replace(
      '$1',
      themesNumber
    )
  else
    themeLabel = locals[lang].actions.colorThemesNumber.single.replace(
      '$1',
      themesNumber
    )

    if (shadeNumber > 1)
      shadeLabel = locals[lang].actions.shadesNumber.several.replace(
        '$1',
        shadeNumber
      )
    else
      shadeLabel = locals[lang].actions.shadesNumber.single.replace(
        '$1',
        shadeNumber
      )

    return `${colorLabel}${locals[lang].separator}${shadeLabel}${locals[lang].separator}${themeLabel}`
}

export default getPaletteMeta
