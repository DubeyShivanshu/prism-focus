import mongoose from 'mongoose'

// Badge definitions
export const BADGE_CATALOG = {
  first_focus:        { name: 'First Focus',         tier: 'initiate',  description: 'Completed your first focus session.' },
  streak_7:           { name: '7-Day Streak',         tier: 'adept',     description: '7 consecutive days with at least one session.' },
  streak_30:          { name: '30-Day Streak',        tier: 'expert',    description: '30 consecutive days of focus.' },
  hours_100:          { name: '100 Hours',            tier: 'master',    description: 'Recorded 100 total hours of focus.' },
  override_free_week: { name: 'Override-Free Week',   tier: 'sentinel',  description: '7 days without a single override.' },
  deep_work_master:   { name: 'Deep Work Master',     tier: 'legendary', description: '30 days, score ≥90, override rate <5%.' },
  night_owl:          { name: 'Night Owl',            tier: 'adept',     description: '10 sessions completed after 10 PM.' },
  early_bird:         { name: 'Early Bird',           tier: 'adept',     description: '10 sessions started before 7 AM.' },
  friction_survivor:  { name: 'Friction Survivor',    tier: 'expert',    description: 'Resisted 50 distraction attempts in a single week.' },
}

export const BADGE_IDS = Object.keys(BADGE_CATALOG)

const achievementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    badgeId: {
      type: String,
      enum: BADGE_IDS,
      required: true,
    },
    name:        { type: String },
    description: { type: String },
    tier: {
      type: String,
      enum: ['initiate', 'adept', 'expert', 'master', 'sentinel', 'legendary'],
    },
    unlockedAt: { type: Date, default: Date.now },
    seen:       { type: Boolean, default: false }, // for "new badge" notification dot
  },
  { timestamps: true }
)

// One achievement per badge per user
achievementSchema.index({ user: 1, badgeId: 1 }, { unique: true })

const Achievement = mongoose.model('Achievement', achievementSchema)
export default Achievement
