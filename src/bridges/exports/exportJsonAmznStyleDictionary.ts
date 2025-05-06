import chroma from 'chroma-js'
import { locals } from '../../content/locals'
import {
  PaletteData,
  PaletteDataColorItem,
  PaletteDataShadeItem,
} from '../../types/data'

const exportJsonAmznStyleDictionary = (id: string) => {
  const rawPalette = penpot.currentPage?.getPluginData(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    return penpot.ui.sendMessage({
      type: 'EXPORT_PALETTE_JSON',
      data: {
        id: penpot.currentUser.id,
        context: 'TOKENS_AMZN_STYLE_DICTIONARY',
        code: locals.get().error.export,
      },
    })

  const paletteData: PaletteData = JSON.parse(rawPalette).data,
    workingThemes =
      paletteData.themes.filter((theme) => theme.type === 'custom theme')
        .length === 0
        ? paletteData.themes.filter((theme) => theme.type === 'default theme')
        : paletteData.themes.filter((theme) => theme.type === 'custom theme'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json: { [key: string]: any } = {
      color: {},
    }

  const model = (
    color: PaletteDataColorItem,
    shade: PaletteDataShadeItem,
    source: PaletteDataShadeItem
  ) => {
    return {
      value: shade.isTransparent
        ? chroma(source.hex)
            .alpha(shade.alpha ?? 1)
            .hex()
        : shade.hex,
      comment:
        color.description !== ''
          ? color.description + locals.get().separator + shade.description
          : shade.description,
    }
  }

  paletteData.themes[0].colors.forEach((color) => {
    json['color'][color.name] = {}
  })

  if (workingThemes[0].type === 'custom theme')
    workingThemes.forEach((theme) => {
      theme.colors.forEach((color) => {
        const source = color.shades.find(
          (shade) => shade.type === 'source color'
        )

        json['color'][color.name][theme.name] = {}
        color.shades.forEach((shade) => {
          if (shade && source)
            json['color'][color.name][theme.name][shade.name] = model(
              color,
              shade,
              source
            )
        })
      })
    })
  else
    workingThemes.forEach((theme) => {
      theme.colors.forEach((color) => {
        const source = color.shades.find(
          (shade) => shade.type === 'source color'
        )

        json['color'][color.name] = {}
        color.shades.forEach((shade) => {
          if (shade && source)
            json['color'][color.name][shade.name] = model(color, shade, source)
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
