import mongoose from "mongoose";

const evidenceSchema = new mongoose.Schema({
  url:      { type: String, required: true },  // S3 public URL
  s3Key:    { type: String },                  // S3 object key — used for deletion
  fileType: { type: String, enum: ["image", "pdf"] },
});

const complaintSchema = new mongoose.Schema(
  {
    /* ── PARTIES ── */
    buyer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    seller: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    product: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Product",
      required: true,
    },

    /* ── COMPLAINT BODY ── */
    category: {
      type:     String,
      required: true,
      enum: [
        "fraud",
        "item_not_received",
        "item_not_as_described",
        "damaged_item",
        "harassment",
        "counterfeit",
        "other",
      ],
    },
    description: {
      type:      String,
      required:  true,
      minlength: [20,   "Description must be at least 20 characters"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    evidence: [evidenceSchema],

    /* ── ADMIN WORKFLOW ── */
    status: {
      type:    String,
      enum:    ["pending", "under_review", "resolved", "dismissed"],
      default: "pending",
    },
    adminNote:  { type: String, default: "" },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

/* Prevents a buyer filing the same category complaint
   against the same seller for the same product twice */
complaintSchema.index(
  { buyer: 1, seller: 1, product: 1, category: 1 },
  { unique: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;