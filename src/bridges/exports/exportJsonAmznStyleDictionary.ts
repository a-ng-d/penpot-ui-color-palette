import { lang, locals } from '../../content/locals'
import {
  PaletteData,
  PaletteDataColorItem,
  PaletteDataShadeItem,
} from '../../types/data'

const exportJsonAmznStyleDictionary = (id: string) => {
  const palette = penpot.currentPage?.getPluginData(`palette_${id}`)

  if (palette === null)
    return penpot.ui.sendMessage({
      type: 'EXPORT_PALETTE_JSON',
      data: {
        id: penpot.currentUser.id,
        context: 'TOKENS_AMZN_STYLE_DICTIONARY',
        code: locals[lang].export,
      },
    })

  const paletteData: PaletteData = JSON.parse(palette ?? '{}').data,
    workingThemes =
      paletteData.themes.filter((theme) => theme.type === 'custom theme')
        .length === 0
        ? paletteData.themes.filter((theme) => theme.type === 'default theme')
        : paletteData.themes.filter((theme) => theme.type === 'custom theme'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json: { [key: string]: any } = {
      color: {},
    }

  const model = (color: PaletteDataColorItem, shade: PaletteDataShadeItem) => {
    return {
      value: shade.hex,
      comment:
        color.description !== ''
          ? color.description + locals[lang].separator + shade.description
          : shade.description,
    }
  }

  paletteData.themes[0].colors.forEach((color) => {
    json['color'][color.name] = {}
  })

  if (workingThemes[0].type === 'custom theme')
    workingThemes.forEach((theme) => {
      theme.colors.forEach((color) => {
        json['color'][color.name][theme.name] = {}
        color.shades.reverse().forEach((shade) => {
          json['color'][color.name][theme.name][shade.name] = model(
            color,
            shade
          )
        })
      })
    })
  else
    workingThemes.forEach((theme) => {
      theme.colors.forEach((color) => {
        json['color'][color.name] = {}
        color.shades.sort().forEach((shade) => {
          json['color'][color.name][shade.name] = model(color, shade)
        })
      })
    })

  penpot.ui.sendMessage({
    type: 'EXPORT_PALETTE_JSON',
    data: {
      id: penpot.currentUser.id,
      context: 'TOKENS_AMZN_STYLE_DICTIONARY',
      code: JSON.stringify(json, null, '  '),
    },
  })
}

export default exportJsonAmznStyleDictionary
