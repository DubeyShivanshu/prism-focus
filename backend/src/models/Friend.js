import mongoose from 'mongoose'

const friendSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'blocked'],
      default: 'pending',
    },
    acceptedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

// Indexes 
// Unique pair: one friendship record between two users
friendSchema.index({ requester: 1, recipient: 1 }, { unique: true })
friendSchema.index({ recipient: 1, status: 1 })

// Static helpers 
friendSchema.statics.areFriends = async function (userA, userB) {
  const record = await this.findOne({
    status: 'accepted',
    $or: [
      { requester: userA, recipient: userB },
      { requester: userB, recipient: userA },
    ],
  })
  return !!record
}

friendSchema.statics.getFriendIds = async function (userId) {
  const records = await this.find({
    status: 'accepted',
    $or: [{ requester: userId }, { recipient: userId }],
  }).select('requester recipient')

  return records.map((r) =>
    r.requester.toString() === userId.toString() ? r.recipient : r.requester
  )
}

const Friend = mongoose.model('Friend', friendSchema)
export default Friend
