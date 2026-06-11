import mongoose from 'mongoose'

const scheduleSchema = new mongoose.Schema({
  enabled:   { type: Boolean, default: false },
  days:      { type: [Number], default: [1,2,3,4,5] }, // 0=Sun … 6=Sat
  startTime: { type: String, default: '09:00' }, // HH:mm
  endTime:   { type: String, default: '18:00' },
}, { _id: false })

const blockedSiteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    domain: {
      type: String,
      required: [true, 'Domain is required'],
      trim: true,
      lowercase: true,
    },
    name: { type: String, trim: true }, // display name e.g. "YouTube"
    category: {
      type: String,
      enum: ['social', 'entertainment', 'news', 'gaming', 'shopping', 'other'],
      default: 'other',
    },

    // 0 = off, 1 = mild, 2 = moderate, 3 = severe
    frictionLevel: { type: Number, min: 0, max: 3, default: 1 },
    isEnabled:     { type: Boolean, default: true },

    // Time-based activation schedule
    schedule: { type: scheduleSchema, default: () => ({}) },

    // Running stats (updated by extension sync)
    stats: {
      overrideCount:    { type: Number, default: 0 },
      lastOverrideAt:   { type: Date,   default: null },
      totalVisitCount:  { type: Number, default: 0 },
      totalTimeWasted:  { type: Number, default: 0 }, // minutes
    },
  },
  { timestamps: true }
)

// Compound unique index: one entry per domain per user 
blockedSiteSchema.index({ user: 1, domain: 1 }, { unique: true })

const BlockedSite = mongoose.model('BlockedSite', blockedSiteSchema)
export default BlockedSite
