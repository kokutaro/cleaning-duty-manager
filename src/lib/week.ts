export function getWeekStart(date: Date = new Date()): Date {
  const start = new Date(date)
  start.setUTCHours(0, 0, 0, 0)
  const dayOfWeek = start.getUTCDay()
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  start.setUTCDate(start.getUTCDate() - daysToSubtract)
  return start
}
