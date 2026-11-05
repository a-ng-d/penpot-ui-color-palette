import globalConfig from '../../global.config'

const addHours = (date: Date, hours: number) => {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

const addMonths = (date: Date, months: number) => {
  const result = new Date(date.getTime())
  const day = result.getDate()
  result.setDate(1)
  result.setMonth(result.getMonth() + months)
  const lastDay = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0
  ).getDate()
  result.setDate(Math.min(day, lastDay))
  return result
}

const checkCredits = async () => {
  const creditsCountStr = penpot.localStorage.getItem('credits_count')
  const renewDateStr = penpot.localStorage.getItem('credits_renew_date')
  const creditsVersion = penpot.localStorage.getItem('credits_version')

  const now = new Date()

  let creditsCount =
    creditsCountStr !== null ? parseFloat(creditsCountStr) : NaN
  let renewDate: Date | null =
    renewDateStr !== null && !Number.isNaN(parseInt(renewDateStr, 10))
      ? new Date(parseInt(renewDateStr, 10))
      : null

  const periodMonths = globalConfig.plan.creditsRenewalPeriodMonths
  const periodHours =
    globalConfig.plan.creditsRenewalPeriodHours ??
    globalConfig.plan.creditsRenewalPeriodDays * 24
  const addPeriod = (date: Date) =>
    periodMonths !== undefined
      ? addMonths(date, periodMonths)
      : addHours(date, periodHours)

  if (renewDate === null) {
    const next = addPeriod(now)
    penpot.localStorage.setItem('credits_renew_date', next.getTime().toString())
    renewDate = next
  }

  if (renewDate && renewDate.getTime() <= now.getTime()) {
    penpot.localStorage.setItem(
      'credits_count',
      globalConfig.plan.creditsLimit.toString()
    )
    const next = addPeriod(now)
    penpot.localStorage.setItem('credits_renew_date', next.getTime().toString())
    creditsCount = globalConfig.plan.creditsLimit
  }

  if (Number.isNaN(creditsCount)) {
    penpot.localStorage.setItem(
      'credits_count',
      globalConfig.plan.creditsLimit.toString()
    )
    creditsCount = globalConfig.plan.creditsLimit
  }

  if (creditsVersion !== globalConfig.versions.creditsVersion) {
    penpot.localStorage.setItem(
      'credits_version',
      globalConfig.versions.creditsVersion
    )
    penpot.localStorage.setItem(
      'credits_count',
      globalConfig.plan.creditsLimit.toString()
    )
    const next = addPeriod(now)
    penpot.localStorage.setItem('credits_renew_date', next.getTime().toString())
    creditsCount = globalConfig.plan.creditsLimit
    renewDate = next
  }

  penpot.ui.sendMessage({
    type: 'CHECK_CREDITS',
    data: {
      creditsCount: creditsCount,
      creditsRenewalDate: renewDate?.getTime() ?? null,
    },
  })

  return creditsCount
}

export default checkCredits
