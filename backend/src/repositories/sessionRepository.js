import FocusSession from '../models/FocusSession.js'

export const sessionRepository = {
  create: (data) => FocusSession.create(data),

  findById: (id) => FocusSession.findById(id),

  findByIdAndUser: (id, userId) =>
    FocusSession.findOne({ _id: id, user: userId }),

  findActive: (userId) =>
    FocusSession.findOne({ user: userId, status: 'active' }),

  findByUser: (userId, { limit = 20, skip = 0, status } = {}) => {
    const query = { user: userId }
    if (status) query.status = status
    return FocusSession.find(query)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit)
  },

  countByUser: (userId, query = {}) =>
    FocusSession.countDocuments({ user: userId, ...query }),

  update: (id, data) =>
    FocusSession.findByIdAndUpdate(id, data, { new: true, runValidators: true }),

  pushOverride: (id, override) =>
    FocusSession.findByIdAndUpdate(
      id,
      { $push: { overrides: override } },
      { new: true }
    ),

  delete: (id) => FocusSession.findByIdAndDelete(id),

  // Analytics aggregations: Daily focus minutes for heatmap (last N days)
  getDailyMinutes: (userId, days = 90) => {
    const since = new Date()
    since.setDate(since.getDate() - days)
    return FocusSession.aggregate([
      { $match: { user: userId, status: 'completed', startTime: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
          totalMinutes: { $sum: '$actualDuration' },
          sessionCount: { $sum: 1 },
          avgScore: { $avg: '$productivityScore' },
        },
      },
      { $sort: { _id: 1 } },
    ])
  },

  // Weekly summary
  getWeeklySummary: (userId) => {
    const since = new Date()
    since.setDate(since.getDate() - 7)
    return FocusSession.aggregate([
      { $match: { user: userId, status: 'completed', startTime: { $gte: since } } },
      {
        $group: {
          _id: null,
          totalMinutes:   { $sum: '$actualDuration' },
          sessionCount:   { $sum: 1 },
          totalOverrides: { $sum: { $size: '$overrides' } },
          avgScore:       { $avg: '$productivityScore' },
        },
      },
    ])
  },

  // Productivity over time (for charts)
  getScoreSeries: (userId, days = 30) => {
    const since = new Date()
    since.setDate(since.getDate() - days)
    return FocusSession.aggregate([
      {
        $match: {
          user: userId, status: 'completed',
          startTime: { $gte: since },
          productivityScore: { $ne: null },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
          avgScore: { $avg: '$productivityScore' },
        },
      },
      { $sort: { _id: 1 } },
    ])
  },
}
