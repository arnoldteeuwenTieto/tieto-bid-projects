export const dashboardConfig = { customerInactivityDays: 180, stalledBidDays: 45, upcomingDecisionDays: 30 }
export const dashboardPeriods = [
  { value: 'all', label: 'All time' }, { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' }, { value: 'year', label: 'This year' },
] as const
