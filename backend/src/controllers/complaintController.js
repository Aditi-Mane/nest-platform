
import Complaint from "../models/Complaint.js";
import Order from "../models/Order.js";
import { uploadToS3 } from "../utils/uploadToS3.js";        
import { s3 } from "../utils/s3.js"              
 
/* ─────────────────────────────────────────────
   POST /complaints
   Buyer files a complaint against a seller
───────────────────────────────────────────── */
export const fileComplaint = async (req, res) => {
  try {
    const buyerId = req.user._id;
    const { sellerId, productId, category, description } = req.body;
 
    /* ── Validate required fields ── */
    if (!sellerId || !productId || !category || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }
 
    if (description.trim().length < 20) {
      return res.status(400).json({
        message: "Description must be at least 20 characters",
      });
    }
 
    /* ── Verify the buyer actually ordered this product from this seller ──
       Prevents bogus complaints from users who never transacted with them  */
    const validOrder = await Order.findOne({
      buyerId:   buyerId,
      sellerId:  sellerId,
      productId: productId,
    });
 
    if (!validOrder) {
      return res.status(403).json({
        message: "You can only report a seller for an order you have placed with them",
      });
    }
    console.log("validOrder:", validOrder);
 
    /* ── Upload each evidence file to S3 using your existing uploadToS3 ── */
    const evidence = await Promise.all(
      (req.files || []).map(async (file) => {
        /* Re-key into a dedicated complaints folder so evidence is
           separate from your existing product image uploads         */
        const s3File = {
          ...file,
          originalname: `complaints/${buyerId}/${Date.now()}-${file.originalname}`,
        };
 
        const url   = await uploadToS3(s3File);
        /* Derive the S3 key from the returned URL so we can delete it later */

        const s3Key = url.split(".amazonaws.com/")[1];
 
        return {
          url,
          s3Key,
          fileType: file.mimetype === "application/pdf" ? "pdf" : "image",
        };
      })
    );
 
    /* ── Create complaint (unique index blocks duplicates) ── */
    const complaint = await Complaint.create({
      buyer:       buyerId,
      seller:      sellerId,
      product:     productId,
      category,
      description: description.trim(),
      evidence,
    });
 
    return res.status(201).json({
      message: "Complaint filed successfully",
      complaint,
    });
  } catch (error) {
    /* Compound unique index violation */
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already filed a complaint of this type for this order",
      });
    }
    console.error("fileComplaint error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
 