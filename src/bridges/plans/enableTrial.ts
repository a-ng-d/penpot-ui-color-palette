const enableTrial = async (trialTime: number, trialVersion: string) => {
  const now = new Date().getTime()

  penpot.localStorage.setItem('trial_start_date', now.toString())
  penpot.localStorage.setItem('trial_version', trialVersion)
  penpot.localStorage.setItem('trial_time', trialTime.toString())

  return penpot.ui.sendMessage({
    type: 'ENABLE_TRIAL',
    data: {
      date: now,
      trialTime: trialTime,
    },
  })
}

export default enableTrial
