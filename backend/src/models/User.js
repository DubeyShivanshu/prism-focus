import mongoose from 'mongoose'
import bcryptjs from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // excluded from queries by default
    },
    googleId: { type: String, default: null },
    avatar: { type: String, default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },

    // Prism-specific 
    streak: {
      current: { type: Number, default: 0 },
      best: { type: Number, default: 0 },
      lastActiveDate: { type: Date, default: null },
    },
    productivityScore: { type: Number, default: 0, min: 0, max: 100 },
    totalFocusMinutes: { type: Number, default: 0 },
    settings: {
      pomodoroWork: { type: Number, default: 25 },
      pomodoroBreak: { type: Number, default: 5 },
      dailyGoalHours: { type: Number, default: 4 },
      notifications: { type: Boolean, default: true },
      theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
      frictionMode: { type: String, enum: ['auto', 'manual'], default: 'auto' },
    },

    // Stored hashed refresh tokens for rotation & revocation
    refreshTokens: [
      {
        token: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

// Indexes: email index is created automatically by unique:true above
userSchema.index({ googleId: 1 })

// Hash password on save 
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcryptjs.hash(this.password, 12)
  next()
})

// Instance Methods 
userSchema.methods.comparePassword = async function (candidate) {
  return bcryptjs.compare(candidate, this.password)
}

// Strip sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.refreshTokens
  delete obj.__v
  return obj
}

const User = mongoose.model('User', userSchema)
export default User
