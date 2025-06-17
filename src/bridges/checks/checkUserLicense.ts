const checkUserLicense = async () => {
  const licenseKey = penpot.root?.getPluginData('user_license_key')
  const instanceId = penpot.root?.getPluginData('user_license_instance_id')

  if (licenseKey !== null && instanceId !== null)
    return penpot.ui.sendMessage({
      type: 'CHECK_USER_LICENSE',
      data: {
        licenseKey: licenseKey,
        instanceId: instanceId,
      },
    })
  return false
}

export default checkUserLicense
