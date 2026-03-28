import mongoose from "mongoose";

const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "application_received",    // creator: someone applied to your venture
        "application_accepted",    // applicant: you were accepted
        "application_rejected",    // applicant: you were rejected
        "team_invite",             // user: creator manually added you, confirm?
        "team_invite_accepted",    // creator: invitee confirmed
        "milestone_updated",       // followers: creator marked milestone done
        "stage_changed",           // followers: venture moved to new stage
        "new_update",              // followers: creator posted a progress update
        "new_comment",             // creator + team: someone commented
        "investor_viewed",         // creator: an investor viewed your pitch deck
        "venture_endorsed",        // creator: someone endorsed your venture
      ],
    },

    // Human-readable message shown in the bell dropdown
    message: {
      type: String,
      required: true,
    },

    // Deep-link so clicking the notification goes to the right page
    link: {
      type: String,
      required: true,
    },

    // References so we can build rich notification cards
    venture: {
      type: Schema.Types.ObjectId,
      ref: "Venture",
      default: null,
    },

    application: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      default: null,
    },

    triggeredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,             // who caused this notification
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.model("Notification", NotificationSchema);