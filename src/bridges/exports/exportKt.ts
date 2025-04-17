import { Case } from '@a_ng_d/figmug-utils'
import { Board } from '@penpot/plugin-types'
import { PaletteData } from '../../types/data'

const exportKt = (palette: Board) => {
  const paletteData: PaletteData = JSON.parse(palette.getPluginData('data')),
    workingThemes =
      paletteData.themes.filter((theme) => theme.type === 'custom theme')
        .length === 0
        ? paletteData.themes.filter((theme) => theme.type === 'default theme')
        : paletteData.themes.filter((theme) => theme.type === 'custom theme'),
    kotlin: Array<string> = []

  if (palette.children.length === 1) {
    workingThemes.forEach((theme) => {
      theme.colors.forEach((color) => {
        const colors: Array<string> = []
        colors.unshift(
          `// ${
            workingThemes[0].type === 'custom theme' ? theme.name + ' - ' : ''
          }${color.name}`
        )
        color.shades.forEach((shade) => {
          colors.unshift(
            `val ${
              workingThemes[0].type === 'custom theme'
                ? new Case(theme.name + ' ' + color.name).doSnakeCase()
                : new Case(color.name).doSnakeCase()
            }_${shade.name} = Color(${shade.hex
              .replace('#', '0xFF')
              .toUpperCase()})`
          )
        })
        colors.unshift('')
        colors.reverse().forEach((color) => kotlin.push(color))
      })
    })

    kotlin.pop()

    penpot.ui.sendMessage({
      type: 'EXPORT_PALETTE_KT',
      data: {
        id: penpot.currentUser.id,
        context: 'ANDROID_COMPOSE',
        code: `import androidx.compose.ui.graphics.Color\n\n${kotlin.join('\n')}`,
      },
    })
  } else null //figma.notify(locals[lang].error.corruption);
}

export default exportKt
