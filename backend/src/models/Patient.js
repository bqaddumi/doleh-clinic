import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
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
    age: {
      type: Number,
      required: true,
      min: 0
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    condition: {
      type: String,
      required: true,
      trim: true
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    lastVisit: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

patientSchema.index({ fullName: 'text', phone: 'text', condition: 'text' });

export const Patient = mongoose.model('Patient', patientSchema);
