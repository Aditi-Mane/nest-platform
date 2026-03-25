import { getIO } from "../config/socket.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";


//SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { conversationId, text } = req.body;

    // Validate message
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    //Get conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    //Authorization check
    const isSenderBuyer =
      conversation.buyerId.toString() === senderId.toString();

    const isSenderSeller =
      conversation.sellerId.toString() === senderId.toString();

    if (!isSenderBuyer && !isSenderSeller) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // STATUS UPDATE → negotiating
    if (
      conversation.status === "initiated" &&
      senderId.toString() === conversation.sellerId.toString()
    ) {
      // Seller replied → move to negotiating
      conversation.status = "negotiating";
    }

    //Create message
    const message = await Message.create({
      conversationId,
      senderId,
      text,
    });

    // Update conversation meta
    conversation.lastMessage = text;
    conversation.updatedAt = new Date();

    // Update unread counts
    if (isSenderBuyer) {
      // Buyer sent → increment seller unread
      conversation.unreadCountSeller += 1;
    } else if (isSenderSeller) {
      // Seller sent → increment buyer unread
      conversation.unreadCountBuyer += 1;
    }

    await conversation.save();

    //Emit via socket
    const io = getIO();

    // populate sender before emitting (important for frontend UI)
    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "_id name");

    io.to(conversationId).emit("receive_message", populatedMessage);

    io.to(conversation.buyerId.toString()).emit("unread_update", {
        conversationId,
        unreadCountBuyer: conversation.unreadCountBuyer,
      });

    io.to(conversation.sellerId.toString()).emit("unread_update", {
        conversationId,
        unreadCountSeller: conversation.unreadCountSeller,
      });

    return res.status(201).json({
      message: "Message sent successfully",
      data: populatedMessage,
      unreadCountSeller: conversation.unreadCountSeller,
      unreadCountBuyer: conversation.unreadCountBuyer,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Server error while sending message",
    });
  }
};

//GET MESSAGES
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Validate conversation access
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (
      conversation.buyerId.toString() !== userId.toString() &&
      conversation.sellerId.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    //Fetch messages
    const messages = await Message.find({ conversationId })
      .populate("senderId", "_id name")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      message: "Messages fetched successfully",
      messages,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Server error while fetching messages",
    });
  }
};

//MARK AS READ
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (userId.toString() === conversation.buyerId.toString()) {
      conversation.unreadCountBuyer = 0;
    } else {
      conversation.unreadCountSeller = 0;
    }

    await conversation.save();
    const io = getIO();

    io.to(userId.toString()).emit("unread_update", {
      conversationId,
      unreadCountBuyer: conversation.unreadCountBuyer,
      unreadCountSeller: conversation.unreadCountSeller,
    });
    return res.status(200).json({
      message: "Marked as read",
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error marking as read",
    });
  }
};
