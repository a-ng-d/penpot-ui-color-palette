import { FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { locales } from '../../content/locales'

const updateLocalStyles = async (id: string) => {
  const rawPalette = penpot.currentPage?.getPluginData(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    throw new Error(locales.get().error.unfoundPalette)

  const palette = JSON.parse(rawPalette) as FullConfiguration

  const canDeepSyncStyles =
    penpot.root?.getPluginData('can_deep_sync_styles') === 'true'

  const updatedLocalStylesStatusMessage = await Promise.all(
    penpot.library.local.colors
  ).then((localStyles) => {
    let i = 0,
      j = 0,
      k = 0
    const messages: Array<string> = []

    if (canDeepSyncStyles ?? false)
      localStyles.forEach((localStyle) => {
        const hasStyleMatch = palette.libraryData.some(
          (libraryItem) => libraryItem.styleId === localStyle.id
        )

        if (!hasStyleMatch) {
          localStyle.remove()
          k++
        }
      })

    palette.libraryData?.forEach((item) => {
      const styleMatch = localStyles.find(
        (localStyle) => localStyle.id === item.styleId
      )

      if (styleMatch !== undefined) {
        if (styleMatch.name !== item.name) {
          styleMatch.name = item.name
          j++
        }

        if (styleMatch.path !== item.path) {
          styleMatch.path = item.path
          j++
        }

        if (item.alpha !== undefined) {
          if (item.hex?.substring(0, 7) !== styleMatch.color) {
            styleMatch.color = item.hex?.substring(0, 7)
            j++
          }

          if (item.alpha !== styleMatch.opacity) {
            styleMatch.opacity = item.alpha
            j++
          }
        } else if (item.hex !== styleMatch.color) {
          styleMatch.color = item.hex?.substring(0, 7)
          styleMatch.opacity = 1
          j++
        }

        j > 0 ? i++ : i
        j = 0
      }
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

  return updatedLocalStylesStatusMessage
}

export default updateLocalStyles
