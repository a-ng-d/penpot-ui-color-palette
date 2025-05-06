import { locals } from '../../content/locals'
import { PaletteData, PaletteDataThemeItem } from '../../types/data'

const updateLocalStyles = async (id: string) => {
  const rawPalette = penpot.currentPage?.getPluginData(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    throw new Error(locals.get().error.styles)

  const paletteData: PaletteData = JSON.parse(rawPalette).data,
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
          const source = color.shades.find(
            (shade) => shade.type === 'source color'
          )

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
                  if (source?.hex !== styleMatch.color) {
                    styleMatch.color = source?.hex ?? '#000000'
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
        messages.push(`${i} ${locals.get().info.updatedLocalStyles.plural}`)
      else if (i === 1)
        messages.push(locals.get().info.updatedLocalStyles.single)
      else messages.push(locals.get().info.updatedLocalStyles.none)

      if (k > 1)
        messages.push(`${k} ${locals.get().info.removedLocalStyles.plural}`)
      else if (k === 1)
        messages.push(locals.get().info.removedLocalStyles.single)
      else messages.push(locals.get().info.removedLocalStyles.none)

      return messages.join(locals.get().separator)
    })
    .catch(() => locals.get().error.generic)

  return await updatedLocalStylesStatusMessage
}

export default updateLocalStyles
