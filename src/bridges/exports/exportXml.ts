import { Case } from '@a_ng_d/figmug-utils'
import { locals } from '../../content/locals'
import { PaletteData } from '../../types/data'
import chroma from 'chroma-js'

const exportXml = (id: string) => {
  const rawPalette = penpot.currentPage?.getPluginData(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    return penpot.ui.sendMessage({
      type: 'EXPORT_PALETTE_XML',
      data: {
        id: penpot.currentUser.id,
        context: 'ANDROID_XML',
        code: locals.get().error.export,
      },
    })

  const paletteData: PaletteData = JSON.parse(rawPalette).data,
    workingThemes =
      paletteData.themes.filter((theme) => theme.type === 'custom theme')
        .length === 0
        ? paletteData.themes.filter((theme) => theme.type === 'default theme')
        : paletteData.themes.filter((theme) => theme.type === 'custom theme'),
    resources: Array<string> = []

  workingThemes.forEach((theme) => {
    theme.colors.forEach((color) => {
      const source = color.shades.find((shade) => shade.type === 'source color')
      const colors: Array<string> = []

      colors.unshift(
        `${'<'}!--` + workingThemes[0].type === 'custom theme'
          ? theme.name + ' - ' + color.name + `--${'>'}`
          : color.name + `--${'>'}`
      )
      color.shades.forEach((shade) => {
        colors.unshift(
          `<color name="${
            workingThemes[0].type === 'custom theme'
              ? new Case(theme.name + ' ' + color.name).doSnakeCase()
              : new Case(color.name).doSnakeCase()
          }_${shade.name}">${
            shade.alpha !== undefined
              ? chroma(source?.hex ?? '#000000')
                  .alpha(shade.alpha)
                  .hex()
              : shade.hex
          }</color>`
        )
      })
      colors.unshift('')
      colors.reverse().forEach((color) => resources.push(color))
    })
  })

  resources.pop()

  penpot.ui.sendMessage({
    type: 'EXPORT_PALETTE_XML',
    data: {
      id: penpot.currentUser.id,
      context: 'ANDROID_XML',
      code: `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n  ${resources.join(
        '\n  '
      )}\n</resources>`,
    },
  })
}

export default exportXml
