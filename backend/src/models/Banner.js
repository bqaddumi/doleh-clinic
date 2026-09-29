import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    messageEn: {
      type: String,
      required: true,
      trim: true
    },
    messageAr: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export const Banner = mongoose.model('Banner', bannerSchema);
