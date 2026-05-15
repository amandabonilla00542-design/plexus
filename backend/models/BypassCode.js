const mongoose = require('mongoose')

const bypassCodeSchema = new mongoose.Schema(
  {
    /** Uppercase trimmed string — unique, single-use. */
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    used: { type: Boolean, default: false },
    usedAt: { type: Date },
    usedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('BypassCode', bypassCodeSchema)
