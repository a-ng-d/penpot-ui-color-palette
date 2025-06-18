import {
  Data,
  FullConfiguration,
  PaletteData,
  PaletteDataThemeItem,
} from '@a_ng_d/utils-ui-color-palette'
import { locales } from '../../content/locales'

const updateLocalStyles = async (id: string) => {
  const rawPalette = penpot.currentPage?.getPluginData(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    throw new Error(locales.get().error.unfoundPalette)

  const palette = JSON.parse(rawPalette) as FullConfiguration

  const paletteData: PaletteData = new Data(palette).makePaletteData(),
    workingThemes =
      paletteData.themes.filter((theme) => theme.type === 'custom theme')
        .length === 0
        ? paletteData.themes.filter((theme) => theme.type === 'default theme')
        : paletteData.themes.filter((theme) => theme.type === 'custom theme')
  const canDeepSyncStyles =
    penpot.root?.getPluginData('can_deep_sync_styles') === 'true'

  const updatedLocalStylesStatusMessage = await Promise.all(
    penpot.library.local.colors
  )
    .then((localStyles) => {
      let i = 0,
        j = 0,
        k = 0
      const messages: Array<string> = []

      if (canDeepSyncStyles ?? false)
        localStyles.forEach((localStyle) => {
          const shadeMatch = workingThemes.find(
            (theme) =>
              theme.colors.find(
                (color) =>
                  color.shades.find(
                    (shade) => shade.styleId === localStyle.id
                  ) !== undefined
              ) !== undefined
          )
          if (shadeMatch === undefined) {
            localStyle.remove()
            k++
          }
        })

      workingThemes.forEach((theme: PaletteDataThemeItem) => {
        theme.colors.forEach((color) => {
          color.shades.forEach((shade) => {
            const path =
              workingThemes[0].type === 'custom theme'
                ? `${paletteData.name === '' ? '' : paletteData.name + ' / '}${
                    theme.name
                  } / ${color.name}`
                : `${paletteData.name === '' ? '' : paletteData.name} / ${
                    color.name
                  }`

            if (
              localStyles.find(
                (localStyle) => localStyle.id === shade.styleId
              ) !== undefined
            ) {
              const styleMatch = localStyles.find(
                (localStyle) => localStyle.id === shade.styleId
              )

              if (styleMatch !== undefined) {
                if (styleMatch.name !== shade.name) {
                  styleMatch.name = shade.name
                  j++
                }

                if (styleMatch.path !== path) {
                  styleMatch.path = path
                  j++
                }

                if (shade.isTransparent) {
                  if (shade.hex.substring(0, 5) !== styleMatch.color) {
                    styleMatch.color = shade.hex.substring(0, 7)
                    j++
                  }

                  if (shade.alpha !== styleMatch.opacity) {
                    styleMatch.opacity = shade.alpha
                    j++
                  }
                } else if (shade.hex !== styleMatch.color) {
                  styleMatch.color = shade.hex
                  styleMatch.opacity = 1
                  j++
                }
              }

              j > 0 ? i++ : i
              j = 0
            } else if (
              localStyles.find(
                (localStyle) => localStyle.name === shade.name
              ) !== undefined
            ) {
              const styleMatch = localStyles.find(
                (localStyle) => localStyle.name === shade.name
              )

              if (styleMatch !== undefined) {
                if (styleMatch.name !== shade.name) {
                  styleMatch.name = shade.name
                  j++
                }

                if (styleMatch.path !== path) {
                  styleMatch.path = path
                  j++
                }

                if (shade.hex !== styleMatch.color) {
                  styleMatch.color = shade.hex
                  j++
                }
              }

              j > 0 ? i++ : i
              j = 0
            }
          })
        })
      })

      if (i > 1)
        messages.push(`${i} ${locales.get().info.updatedLocalStyles.plural}`)
      else if (i === 1)
        messages.push(locales.get().info.updatedLocalStyles.single)
      else messages.push(locales.get().info.updatedLocalStyles.none)

      if (k > 1)
        messages.push(`${k} ${locales.get().info.removedLocalStyles.plural}`)
      else if (k === 1)
        messages.push(locales.get().info.removedLocalStyles.single)
      else messages.push(locales.get().info.removedLocalStyles.none)

      return messages.join(locales.get().separator)
    })
    .catch(() => locales.get().error.generic)

  return await updatedLocalStylesStatusMessage
}

export default updateLocalStyles
