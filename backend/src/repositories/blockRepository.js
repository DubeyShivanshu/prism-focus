import BlockedSite from '../models/BlockedSite.js'

export const blockRepository = {
  findByUser: (userId) =>
    BlockedSite.find({ user: userId }).sort({ createdAt: -1 }),

  findById: (id) => BlockedSite.findById(id),

  findByIdAndUser: (id, userId) =>
    BlockedSite.findOne({ _id: id, user: userId }),

  findByDomainAndUser: (domain, userId) =>
    BlockedSite.findOne({ domain: domain.toLowerCase(), user: userId }),

  // Used by extension to get all enabled rules for a user
  findEnabled: (userId) =>
    BlockedSite.find({ user: userId, isEnabled: true }).select(
      'domain frictionLevel schedule category'
    ),

  create: (data) => BlockedSite.create(data),

  update: (id, data) =>
    BlockedSite.findByIdAndUpdate(id, data, { new: true, runValidators: true }),

  delete: (id) => BlockedSite.findByIdAndDelete(id),

  // Increment override counter (called by extension sync)
  recordOverride: (id) =>
    BlockedSite.findByIdAndUpdate(
      id,
      {
        $inc: { 'stats.overrideCount': 1 },
        $set: { 'stats.lastOverrideAt': new Date() },
      },
      { new: true }
    ),

  // Per-site stats for analytics
  getSiteStats: (userId) =>
    BlockedSite.find({ user: userId })
      .select('domain name category stats frictionLevel')
      .sort({ 'stats.overrideCount': -1 }),
}
