import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    diagnosis: {
      type: String,
      required: true,
      trim: true
    },
    treatmentPlan: {
      type: String,
      required: true,
      trim: true
    },
    sessionNotes: {
      type: String,
      required: true,
      trim: true
    },
    progress: {
      type: String,
      enum: ['improving', 'stable', 'worse'],
      required: true
    },
    attachments: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

reportSchema.index({ patientId: 1, date: -1 });

export const Report = mongoose.model('Report', reportSchema);
