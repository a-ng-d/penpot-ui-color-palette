import { ShapeBase } from '@penpot/plugin-types'

const getPalettesOnCurrentPage = async () => {
  const palettes = penpot.currentPage?.findShapes({
    nameLike: 'UI Color Palette',
  }) as Array<ShapeBase>
  /*.catch(() => {
      figma.notify(locals[lang].error.palettesPicking)
      return []
    })*/

  if (palettes !== undefined && palettes.length !== 0) {
    const palettesList = async () => {
      const palettePromises = palettes.map(async (palette) => {
        const name = palette.getPluginData('name')
        const preset = palette.getPluginData('preset')
        const colors = palette.getPluginData('colors')
        const themes = palette.getPluginData('themes')

        if (preset === '' || colors === '' || themes === '') return null

        const bytes = await palette.export({
          type: 'png',
          scale: 0.25,
        })
        return {
          id: palette.id,
          name: name,
          preset: JSON.parse(preset).name,
          colors: JSON.parse(colors),
          themes: JSON.parse(themes),
          screenshot: bytes,
        }
      })
      const filteredPalettes = (await Promise.all(palettePromises)).filter(
        (palette) => palette !== null
      )
      return filteredPalettes
    }

    penpot.ui.sendMessage({
      type: 'EXPOSE_PALETTES',
      data: palettesList(),
    })
  } else
    penpot.ui.sendMessage({
      type: 'EXPOSE_PALETTES',
      data: [],
    })
}

export default getPalettesOnCurrentPage
