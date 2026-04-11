
import Complaint from "../models/Complaint.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { uploadToS3 } from "../utils/uploadToS3.js";        
 
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

export const getReportedSellers = async (req, res) => {
  try {
    const data = await Complaint.aggregate([
      {
        $sort: {
          createdAt: -1,
        },
      },

      // Join Seller
      {
        $lookup: {
          from: "users",
          localField: "seller",
          foreignField: "_id",
          as: "seller"
        }
      },
      { $unwind: "$seller" },

      // Join Buyer
      {
        $lookup: {
          from: "users",
          localField: "buyer",
          foreignField: "_id",
          as: "buyer"
        }
      },
      { $unwind: "$buyer" },

      // Join Product
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },

      // Group by Seller
      {
        $group: {
          _id: "$seller._id",
          seller: { $first: "$seller" },
          complaints: {
            $push: {
              _id: "$_id",
              buyer: "$buyer",
              product: "$product",
              category: "$category",
              description: "$description",
              status: "$status",
              adminNote: "$adminNote",
              resolvedAt: "$resolvedAt",
              updatedAt: "$updatedAt",
              evidence: "$evidence",
              createdAt: "$createdAt"
            }
          },
          totalComplaints: { $sum: 1 }
        }
      },

      // Optional: sort by most reported sellers
      { $sort: { totalComplaints: -1 } },

      // Clean response
      {
        $project: {
          _id: 0,
          seller: 1,
          complaints: 1,
          totalComplaints: 1
        }
      }

    ]);

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });

  } catch (error) {
    console.error("Error fetching reported sellers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reported sellers"
    });
  }
};

const getPendingComplaintById = async (id) => {
  const complaint = await Complaint.findById(id);

  if (!complaint) {
    return { error: { status: 404, message: "Complaint not found" } };
  }

  if (["resolved", "dismissed"].includes(complaint.status)) {
    return {
      error: {
        status: 400,
        message: `Complaint already ${complaint.status}`,
      },
    };
  }

  return { complaint };
};

export const resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { complaint, error } = await getPendingComplaintById(id);

    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    complaint.status = "resolved";
    complaint.resolvedAt = new Date();

    await complaint.save();

    res.status(200).json({
      success: true,
      message: "Complaint resolved successfully",
      complaint,
    });

  } catch (error) {
    console.error("Resolve error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const dismissComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { complaint, error } = await getPendingComplaintById(id);

    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    complaint.status = "dismissed";
    await complaint.save();

    res.status(200).json({
      success: true,
      message: "Complaint dismissed",
      complaint,
    });

  } catch (error) {
    console.error("Dismiss error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const banSellerFromComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { complaint, error } = await getPendingComplaintById(id);

    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const seller = await User.findById(complaint.seller);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.isBanned = true;
    complaint.status = "resolved";
    complaint.resolvedAt = new Date();

    await Promise.all([seller.save(), complaint.save()]);

    res.status(200).json({
      success: true,
      message: "Seller banned and complaint resolved successfully",
      complaint,
      seller: {
        _id: seller._id,
        isBanned: seller.isBanned,
      },
    });
  } catch (error) {
    console.error("Ban seller error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const unbanSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const seller = await User.findById(sellerId);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.isBanned = false;
    await seller.save();

    res.status(200).json({
      success: true,
      message: "Seller unbanned successfully",
      seller: {
        _id: seller._id,
        isBanned: seller.isBanned,
      },
    });
  } catch (error) {
    console.error("Unban seller error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
 
