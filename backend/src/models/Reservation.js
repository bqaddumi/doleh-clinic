import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    scheduledAt: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    adminNotes: {
      type: String,
      trim: true,
      default: ''
    },
    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

reservationSchema.index({ userId: 1, scheduledAt: -1 });
reservationSchema.index({ status: 1, scheduledAt: -1 });

export const Reservation = mongoose.model('Reservation', reservationSchema);
