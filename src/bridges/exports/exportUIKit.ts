import { Case } from '@a_ng_d/figmug-utils'
import { locals } from '../../content/locals'
import { PaletteData } from '../../types/data'

const exportUIKit = (id: string) => {
  const rawPalette = penpot.currentPage?.getPluginData(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    return penpot.ui.sendMessage({
      type: 'EXPORT_PALETTE_UIKIT',
      data: {
        id: penpot.currentUser.id,
        context: 'APPLE_UIKIT',
        code: locals.get().error.export,
      },
    })

  const paletteData: PaletteData = JSON.parse(rawPalette).data,
    workingThemes =
      paletteData.themes.filter((theme) => theme.type === 'custom theme')
        .length === 0
        ? paletteData.themes.filter((theme) => theme.type === 'default theme')
        : paletteData.themes.filter((theme) => theme.type === 'custom theme'),
    swift: Array<string> = []

  workingThemes.forEach((theme) => {
    const UIColors: Array<string> = []
    theme.colors.forEach((color) => {
      UIColors.unshift(`// ${color.name}`)
      color.shades.forEach((shade) => {
        UIColors.unshift(
          `static let ${new Case(color.name).doCamelCase()}${
            shade.name === 'source' ? 'Source' : shade.name
          } = UIColor(red: ${shade.gl[0].toFixed(
            3
          )}, green: ${shade.gl[1].toFixed(3)}, blue: ${shade.gl[2].toFixed(
            3
          )})`
        )
      })
      UIColors.unshift('')
    })
    UIColors.shift()
    if (workingThemes[0].type === 'custom theme')
      swift.push(
        `struct ${new Case(theme.name).doPascalCase()} {\n    ${UIColors.reverse().join(
          '\n    '
        )}\n  }`
      )
    else swift.push(`${UIColors.reverse().join('\n  ')}`)
  })

  penpot.ui.sendMessage({
    type: 'EXPORT_PALETTE_UIKIT',
    data: {
      id: penpot.currentUser.id,
      context: 'APPLE_UIKIT',
      code: `import UIKit\n\nstruct Color {\n  ${swift.join('\n\n  ')}\n}`,
    },
  })
}

export default exportUIKit
