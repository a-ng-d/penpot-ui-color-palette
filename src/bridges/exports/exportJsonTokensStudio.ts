import { lang, locals } from '../../content/locals'
import {
  PaletteData,
  PaletteDataColorItem,
  PaletteDataShadeItem,
} from '../../types/data'

const exportJsonTokensStudio = (id: string) => {
  const rawPalette = penpot.currentPage?.getPluginData(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    return penpot.ui.sendMessage({
      type: 'EXPORT_PALETTE_JSON',
      data: {
        id: penpot.currentUser.id,
        context: 'TOKENS_TOKENS_STUDIO',
        code: locals[lang].export,
      },
    })

  const paletteData: PaletteData = JSON.parse(rawPalette).data,
    workingThemes =
      paletteData.themes.filter((theme) => theme.type === 'custom theme')
        .length === 0
        ? paletteData.themes.filter((theme) => theme.type === 'default theme')
        : paletteData.themes.filter((theme) => theme.type === 'custom theme'),
    name: string =
      paletteData.name === '' ? locals[lang].name : paletteData.name,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json: { [key: string]: any } = {}

  const model = (color: PaletteDataColorItem, shade: PaletteDataShadeItem) => {
    return {
      value: shade.hex,
      description:
        color.description !== ''
          ? color.description + locals[lang].separator + shade.description
          : shade.description,
      type: 'color',
    }
  }

  if (workingThemes[0].type === 'custom theme')
    workingThemes.forEach((theme) => {
      json[name + ' - ' + theme.name] = {}
      theme.colors.forEach((color) => {
        json[name + ' - ' + theme.name][color.name] = {}
        color.shades.reverse().forEach((shade) => {
          json[name + ' - ' + theme.name][color.name][shade.name] = model(
            color,
            shade
          )
        })
        json[name + ' - ' + theme.name][color.name]['type'] = 'color'
      })
    })
  else
    workingThemes.forEach((theme) => {
      json[name] = {}
      theme.colors.forEach((color) => {
        json[name][color.name] = {}
        color.shades.sort().forEach((shade) => {
          json[name][color.name][shade.name] = model(color, shade)
        })
        json[name][color.name]['type'] = 'color'
      })
    })

  penpot.ui.sendMessage({
    type: 'EXPORT_PALETTE_JSON',
    data: {
      id: penpot.currentUser.id,
      context: 'TOKENS_TOKENS_STUDIO',
      code: JSON.stringify(json, null, '  '),
    },
  })
}

export default exportJsonTokensStudio
