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
    if (
      conversation.buyerId.toString() !== senderId.toString() &&
      conversation.sellerId.toString() !== senderId.toString()
    ) {
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
    await conversation.save();

    //Emit via socket
    const io = getIO();

    // populate sender before emitting (important for frontend UI)
    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "_id name");

    io.to(conversationId).emit("receive_message", populatedMessage);

    return res.status(201).json({
      message: "Message sent successfully",
      data: populatedMessage,
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