const enableTrial = async (trialTime: number, trialVersion: string) => {
  const now = new Date().getTime()

  penpot.root?.setPluginData('trial_start_date', now.toString())
  penpot.root?.setPluginData('trial_version', trialVersion)
  penpot.root?.setPluginData('trial_time', trialTime.toString())

  return penpot.ui.sendMessage({
    type: 'ENABLE_TRIAL',
    data: {
      date: now,
      trialTime: trialTime,
    },
  })
}

export default enableTrial
