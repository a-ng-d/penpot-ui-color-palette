const checkUserPreferences = async () => {
  const isWCAGDisplayed = penpot.root?.getPluginData('is_wcag_displayed')
  const isAPCADisplayed = penpot.root?.getPluginData('is_apca_displayed')
  const canDeepSyncPalette = penpot.root?.getPluginData('can_deep_sync_palette')
  const canDeepSyncVariables = penpot.root?.getPluginData(
    'can_deep_sync_variables'
  )
  const canDeepSyncStyles = penpot.root?.getPluginData('can_deep_sync_styles')
  const isVsCodeMessageDisplayed = penpot.root?.getPluginData(
    'is_vs_code_displayed'
  )

  const plugin_window_width = penpot.root?.getPluginData('plugin_window_width')
  const plugin_window_height = penpot.root?.getPluginData(
    'plugin_window_height'
  )

  if (isWCAGDisplayed) penpot.root?.setPluginData('is_wcag_displayed', 'true')

  if (isAPCADisplayed) penpot.root?.setPluginData('is_apca_displayed', 'true')

  if (canDeepSyncPalette)
    penpot.root?.setPluginData('can_deep_sync_palette', 'false')

  if (canDeepSyncVariables)
    penpot.root?.setPluginData('can_deep_sync_variables', 'false')

  if (canDeepSyncStyles)
    penpot.root?.setPluginData('can_deep_sync_styles', 'false')

  if (isVsCodeMessageDisplayed)
    penpot.root?.setPluginData('is_vs_code_displayed', 'true')

  if (plugin_window_width)
    penpot.root?.setPluginData('plugin_window_width', '640')

  if (plugin_window_height)
    penpot.root?.setPluginData('plugin_window_height', '400')

  penpot.ui.sendMessage({
    type: 'CHECK_USER_PREFERENCES',
    data: {
      isWCAGDisplayed: isWCAGDisplayed ?? true,
      isAPCADisplayed: isAPCADisplayed ?? true,
      canDeepSyncPalette: canDeepSyncPalette ?? false,
      canDeepSyncVariables: canDeepSyncVariables ?? false,
      canDeepSyncStyles: canDeepSyncStyles ?? false,
      isVsCodeMessageDisplayed: isVsCodeMessageDisplayed ?? true,
      plugin_window_width: parseFloat(
        penpot.root?.getPluginData('plugin_window_width') ?? '640'
      ),
      plugin_window_height: parseFloat(
        penpot.root?.getPluginData('plugin_window_height') ?? '400'
      ),
    },
  })

  return null
}

export default checkUserPreferences
