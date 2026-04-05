import mongoose from "mongoose";

const { Schema } = mongoose;

// ── Sub-schemas ──────────────────────────────────────────────────────────────

const TeamMemberSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },// "UI/UX Designer"
    collegeName: { type: String, },
    confirmed: { type: Boolean, default: false },    // must accept invite
    joinedAt: { type: Date },
  },
  { _id: false }
);

const OpenRoleSchema = new Schema(
  {
    title: { type: String, required: true },         // "ML Engineer"
    skills: [{ type: String }],                      // ["Python", "TensorFlow"]
    spots: { type: Number, default: 1 },
  },
  { _id: true }
);

const MilestoneSchema = new Schema(
  {
    title: { type: String, required: true },
    targetDate: { type: Date },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { _id: true }
);

const UpdateSchema = new Schema(
  {
    text: { type: String, required: true, maxlength: 1000 },
    postedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const CommentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ── Main schema ───────────────────────────────────────────────────────────────

const VentureSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      maxlength: 300,                               // short card description
    },

    fullDescription: {
      type: String,
      required: true,
      maxlength: 5000,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "EdTech",
        "Social Impact",
        "Marketplace",
        "E-commerce",
        "Health & Wellness",
        "Sustainability",
        "Fintech",
        "Entertainment",
        "Other",
      ],
    },

    // Lifecycle stage — gates what features are visible
    stage: {
      type: String,
      enum: ["draft", "active", "recruiting", "building", "ready-to-pitch", "funded", "closed"],
      default: "draft",
    },

    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    teamMembers: [TeamMemberSchema],

    teamLimit: {
      type: Number,
      default: 5,
      min: 2,
      max: 20,
    },

    openRoles: [OpenRoleSchema],

    milestones: [MilestoneSchema],

    tags: {
      type: [String],
      validate: [(v) => v.length <= 5, "Maximum 5 tags allowed"],
    },

    // Engagement
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],         // array of user IDs who liked
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],     // array of user IDs following
    endorsements: [{ type: Schema.Types.ObjectId, ref: "User" }],  // social proof for investors
    views: { type: Number, default: 0 },

    // Flags
    isRecruiting: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },

    // Updates feed (creator posts progress updates)
    updates: [UpdateSchema],

    // Public discussion thread
    comments: [CommentSchema],

    // Investor pitch deck — only visible to approved investors
    pitchDeckUrl: { type: String, default: null },
    pitchDeckAccessList: [{ type: Schema.Types.ObjectId, ref: "User" }],

    // Duplicate detection helper — store embedding or keyword hash later
    similarityHash: { type: String, default: null },
  },
  {
    timestamps: true,   // createdAt + updatedAt auto-managed
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

VentureSchema.index({ creator: 1 });
VentureSchema.index({ stage: 1 });
VentureSchema.index({ category: 1 });
VentureSchema.index({ tags: 1 });
VentureSchema.index({ isRecruiting: 1 });
VentureSchema.index({ createdAt: -1 });
VentureSchema.index({ title: "text", description: "text", tags: "text" }); // full-text search

// ── Virtual: team count ───────────────────────────────────────────────────────

VentureSchema.virtual("teamCount").get(function () {
  return this.teamMembers.filter((m) => m.confirmed).length;
});

VentureSchema.set("toJSON", { virtuals: true });
VentureSchema.set("toObject", { virtuals: true });

export default mongoose.model("Venture", VentureSchema);