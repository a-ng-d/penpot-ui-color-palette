import { Case } from '@unoff/utils'
import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { tolgee } from '../..'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TokenCatalog = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TokenSet = any

const updateLocalTokens = async (id: string): Promise<string> => {
  const rawPalette = penpot.currentPage?.getPluginData(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    throw new Error(tolgee.t('error.unfoundPalette'))

  const palette = JSON.parse(rawPalette) as FullConfiguration

  palette.libraryData = new Data(palette).makeLibraryData(
    ['style_id', 'theme_id', 'set_id', 'token_id', 'hex', 'description'],
    palette.libraryData
  )

  const name: string =
    palette.base.name === '' ? tolgee.t('name') : palette.base.name
  const hasThemes = palette.libraryData.some(
    (item) => !item.id.includes('00000000000')
  )

  const catalog: TokenCatalog = (penpot as any).library.local.tokens // eslint-disable-line @typescript-eslint/no-explicit-any

  let i = 0,
    j = 0,
    l = 0,
    m = 0,
    k = 0
  const messages: Array<string> = []

  const canDeepSyncTokens =
    penpot.localStorage.getItem('can_deep_sync_tokens') === 'true'

  if (canDeepSyncTokens) {
    catalog.themes
      .filter((s: TokenSet) => s.group === name)
      .forEach((theme: TokenSet) => {
        const shadeMatch = palette.libraryData.some(
          (item) =>
            item.themeId === theme.id && !item.id.includes('00000000000')
        )
        if (!shadeMatch) {
          theme.remove()
          m++
        }
      })

    catalog.sets
      .filter((s: TokenSet) => s.name.startsWith(`${name}/`))
      .forEach((set: TokenSet) => {
        const shadeMatch = palette.libraryData.some(
          (item) => item.setId === set.id && !item.id.includes('00000000000')
        )
        if (!shadeMatch) set.remove()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set.tokens.forEach((token: any) => {
          const shadeMatch = palette.libraryData.some(
            (item) => item.tokenId === token.id
          )
          if (!shadeMatch) {
            token.remove()
            l++
          }
        })
      })
  }

  if (!hasThemes)
    palette.libraryData
      .filter((item) => item.id.includes('00000000000'))
      .forEach((item) => {
        const tokenName = [
          item.colorName === ''
            ? new Case(tolgee.t('colors.defaultName')).doSnakeCase()
            : new Case(item.colorName).doSnakeCase(),
          item.shadeName,
        ]
          .filter((n) => n !== '' && n !== 'None')
          .map((n) => n.replace(/\s+/g, '-'))
          .join('.')
          .replace('・', '_')

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tokenMatch = catalog.sets
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .flatMap((set: any) => set.tokens)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .find((token: any) => token.id === item.tokenId)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const setMatch = catalog.sets.find((set: any) => set.id === item.setId)

        if (setMatch !== undefined)
          if (setMatch.name !== name) setMatch.name = name

        if (tokenMatch !== undefined) {
          if (tokenMatch.name !== tokenName) {
            tokenMatch.name = tokenName
            k++
          }

          if (tokenMatch.value !== item.hex) {
            tokenMatch.value = item.hex
            k++
          }

          if (tokenMatch.description !== item.description) {
            tokenMatch.description = item.description
            k++
          }
        }

        k > 0 ? i++ : i
        k = 0
      })
  else {
    const uniqueThemes = palette.libraryData
      .filter((item) => !item.id.includes('00000000000'))
      .reduce((acc: typeof palette.libraryData, current) => {
        const x = acc.find(
          (item) =>
            item.themeName === current.themeName &&
            item.paletteName === current.paletteName
        )
        if (!x) return acc.concat([current])
        return acc
      }, [])

    uniqueThemes.forEach((uniqueThemeItem) => {
      const [themeId] = uniqueThemeItem.id.split(':')
      const themeName =
        uniqueThemeItem.themeName === ''
          ? tolgee.t('themes.defaultName')
          : uniqueThemeItem.themeName
      const setName = `${name}/${themeName}`

      const themeMatch = catalog.themes.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (theme: any) => theme.id === uniqueThemeItem.themeId
      )

      if (themeMatch !== undefined) {
        if (themeMatch.group !== name) {
          themeMatch.group = name
          k++
        }

        if (themeMatch.name !== themeName) {
          themeMatch.name = themeName
          k++
        }

        k > 0 ? j++ : j
        k = 0
      }

      const setMatch = catalog.sets.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (set: any) => set.id === uniqueThemeItem.setId
      )

      if (setMatch !== undefined)
        if (setMatch.name !== setName) setMatch.name = setName

      palette.libraryData
        .filter(
          (d) => d.id.split(':')[0] === themeId && !d.id.includes('00000000000')
        )
        .forEach((themeItem) => {
          const tokenName = [
            themeItem.colorName === ''
              ? new Case(tolgee.t('colors.defaultName')).doSnakeCase()
              : new Case(themeItem.colorName).doSnakeCase(),
            themeItem.shadeName,
          ]
            .filter((n) => n !== '' && n !== 'None')
            .map((n) => n.replace(/\s+/g, '-'))
            .join('.')
            .replace('・', '_')

          const tokenMatch = catalog.sets
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .flatMap((set: any) => set.tokens)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .find((token: any) => token.id === themeItem.tokenId)

          if (tokenMatch !== undefined) {
            if (tokenMatch.name !== tokenName) {
              tokenMatch.name = tokenName
              k++
            }

            if (tokenMatch.value !== themeItem.hex) {
              tokenMatch.value = themeItem.hex
              k++
            }

            if (tokenMatch.description !== themeItem.description) {
              tokenMatch.description = themeItem.description
              k++
            }
          }

          k > 0 ? i++ : i
          k = 0
        })
    })
  }

  if (i > 0)
    messages.push(
      tolgee.t('info.updatedLocalTokens', {
        count: i,
      })
    )
  if (j > 0)
    messages.push(
      tolgee.t('info.updatedLocalThemes', {
        count: j,
      })
    )
  if (l > 0)
    messages.push(
      tolgee.t('info.removedLocalTokens', {
        count: l,
      })
    )
  if (m > 0)
    messages.push(
      tolgee.t('info.removedLocalThemes', {
        count: m,
      })
    )

  if (i + j + l + m === 0) messages.push(tolgee.t('info.noChange'))

  penpot.currentFile?.saveVersion(
    `${palette.base.name} - ${tolgee.t('events.tokensSynced')}`
  )

  return messages.join(tolgee.t('separator'))
}

export default updateLocalTokens
