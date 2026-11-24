function toUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function calculateLearningStreak(completedTimestamps: (string | null)[]): {
  currentStreak: number
  learnedToday: boolean
} {
  const uniqueDays = new Set<string>()

  for (const ts of completedTimestamps) {
    if (!ts) continue
    const parsed = new Date(ts)
    if (!Number.isNaN(parsed.getTime())) {
      uniqueDays.add(toUtcDateKey(parsed))
    }
  }

  if (uniqueDays.size === 0) {
    return { currentStreak: 0, learnedToday: false }
  }

  const today = new Date()
  const todayKey = toUtcDateKey(today)
  const learnedToday = uniqueDays.has(todayKey)

  const cursor = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  )
  if (!learnedToday) {
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }

  let currentStreak = 0
  while (uniqueDays.has(toUtcDateKey(cursor))) {
    currentStreak += 1
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }

  return { currentStreak, learnedToday }
}
