import mongoose from "mongoose";

const { Schema } = mongoose;

const ApplicationSchema = new Schema(
  {
    venture: {
      type: Schema.Types.ObjectId,
      ref: "Venture",
      required: true,
    },

    applicant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    roleAppliedFor: {
      type: String,
      required: true,           // must match one of venture.openRoles titles
    },

    whyJoin: {
      type: String,
      required: true,
      maxlength: 200,           // short pitch, not a full cover letter
    },

    portfolioUrl: {
      type: String,
      default: null,            // GitHub / LinkedIn / personal site
    },

    resumeUrl: {
      type: String,
      default: null,            // optional PDF upload
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn"],
      default: "pending",
    },

    // Message creator sends back when accepting or rejecting
    creatorNote: {
      type: String,
      maxlength: 500,
      default: null,
    },

    // Track when status last changed
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,   // appliedAt = createdAt, updatedAt auto-managed
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

ApplicationSchema.index({ venture: 1, status: 1 });
ApplicationSchema.index({ applicant: 1 });

// One application per user per venture — prevent duplicate applications
ApplicationSchema.index({ venture: 1, applicant: 1 }, { unique: true });

export default mongoose.model("Application", ApplicationSchema);