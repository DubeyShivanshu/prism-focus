import User from '../models/User.js'

export const userRepository = {
  findById: (id) => User.findById(id),

  findByEmail: (email) => User.findOne({ email: String(email).toLowerCase().trim() }).select('+password +refreshTokens'),

  findByGoogleId: (googleId) => User.findOne({ googleId }),

  findByIdPublic: (id) => User.findById(id).select('-password -refreshTokens'),

  create: (data) => User.create(data),

  update: (id, data) =>
    User.findByIdAndUpdate(id, data, { new: true, runValidators: true }),

  addRefreshToken: (userId, token) =>
    User.findByIdAndUpdate(userId, {
      $push: { refreshTokens: { token, createdAt: new Date() } },
    }),

  removeRefreshToken: (userId, token) =>
    User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: { token } },
    }),

  clearAllRefreshTokens: (userId) =>
    User.findByIdAndUpdate(userId, { $set: { refreshTokens: [] } }),

  // Prism data queries
  updateStreak: (userId, streakData) =>
    User.findByIdAndUpdate(userId, { $set: { streak: streakData } }, { new: true }),

  incrementFocusTime: (userId, minutes) =>
    User.findByIdAndUpdate(
      userId,
      { $inc: { totalFocusMinutes: minutes } },
      { new: true }
    ),

  updateProductivityScore: (userId, score) =>
    User.findByIdAndUpdate(userId, { productivityScore: score }, { new: true }),

  // Leaderboard
  getLeaderboard: (userIds, limit = 10) =>
    User.find({ _id: { $in: userIds } })
      .select('name avatar streak productivityScore totalFocusMinutes')
      .sort({ totalFocusMinutes: -1 })
      .limit(limit),
}
