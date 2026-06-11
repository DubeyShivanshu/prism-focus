import mongoose from 'mongoose'

const overrideSchema = new mongoose.Schema({
  site:         { type: String },
  frictionLevel:{ type: Number },
  timestamp:    { type: Date, default: Date.now },
}, { _id: false })

const focusSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['pomodoro', 'deep_work', 'custom'],
      default: 'pomodoro',
    },
    startTime:       { type: Date, required: true, default: Date.now },
    endTime:         { type: Date, default: null },
    plannedDuration: { type: Number, required: true },  // minutes
    actualDuration:  { type: Number, default: null },   // minutes (set on complete)
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
    },

    // Cognitive friction overrides during this session
    overrides: { type: [overrideSchema], default: [] },

    // AI-scored productivity (0–100) set by scoring engine post-session
    productivityScore: { type: Number, min: 0, max: 100, default: null },

    // User-supplied metadata
    notes: { type: String, default: '' },
    tags:  { type: [String], default: [] },

    // Pomodoro break tracking
    breaksTaken: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Indexes
focusSessionSchema.index({ user: 1, startTime: -1 })
focusSessionSchema.index({ user: 1, status: 1 })

// Virtual 
focusSessionSchema.virtual('overrideCount').get(function () {
  return this.overrides.length
})

const FocusSession = mongoose.model('FocusSession', focusSessionSchema)
export default FocusSession
