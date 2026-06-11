import { sessionRepository } from '../repositories/sessionRepository.js'
import { blockRepository }   from '../repositories/blockRepository.js'
import { userRepository }    from '../repositories/userRepository.js'

export const analyticsService = {
  // Dashboard summary card
  async getSummary(userId) {
    const user = await userRepository.findByIdPublic(userId)
    const [weeklyRaw, activeSession, siteStats] = await Promise.all([
      sessionRepository.getWeeklySummary(userId),
      sessionRepository.findActive(userId),
      blockRepository.getSiteStats(userId),
    ])

    const weekly = weeklyRaw[0] || {
      totalMinutes: 0, sessionCount: 0, totalOverrides: 0, avgScore: 0,
    }

    // Top distraction this week
    const topSite = siteStats[0] || null

    return {
      streak:            user?.streak || { current: 0, best: 0 },
      productivityScore: user?.productivityScore || 0,
      totalFocusHours:   Math.round((user?.totalFocusMinutes || 0) / 60 * 10) / 10,
      weekly: {
        focusMinutes:  Math.round(weekly.totalMinutes || 0),
        sessions:      weekly.sessionCount || 0,
        overrides:     weekly.totalOverrides || 0,
        avgScore:      Math.round(weekly.avgScore || 0),
      },
      activeSession,
      topDistraction: topSite ? {
        domain:        topSite.domain,
        name:          topSite.name,
        overrideCount: topSite.stats?.overrideCount || 0,
      } : null,
    }
  },

  // Heatmap data (last 90 days) 
  async getHeatmap(userId, days = 90) {
    const data = await sessionRepository.getDailyMinutes(userId, days)

    // Build a full date map so frontend gets 0s for empty days
    const result = {}
    const today = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      result[key] = { minutes: 0, sessions: 0, avgScore: null }
    }

    data.forEach(({ _id, totalMinutes, sessionCount, avgScore }) => {
      if (result[_id]) {
        result[_id] = {
          minutes:  Math.round(totalMinutes),
          sessions: sessionCount,
          avgScore: avgScore ? Math.round(avgScore) : null,
        }
      }
    })

    return Object.entries(result).map(([date, v]) => ({ date, ...v }))
  },

  // Productivity score series 
  async getScoreSeries(userId, days = 30) {
    return sessionRepository.getScoreSeries(userId, days)
  },

  // Per-site breakdown 
  async getSiteBreakdown(userId) {
    return blockRepository.getSiteStats(userId)
  },
}
