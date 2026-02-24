import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export const sendMessage = async(req, res) =>{
  try {
    const senderId = req.user._id;
    const { conversationId, text } = req.body;

    const message = await Message.create({
      conversationId,
      senderId,
      text
    })

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      updatedAt: new Date(),
    });

    return res.status(201).json({
      message: "Message sent successfully",
      message
    })
  } catch (error) {
    console.log(error);
    
    return res.status(500).json({
      message: "Server error while sending message"
    })
  }
}

export const getMessages = async(req, res) =>{
  try {
    const { conversationId } = req.params;
    
    const messages = await Message.find({ conversationId })
    .populate("senderId", "name")
    .sort({createdAt: 1})

    return res.status(200).json({
      message: "Messages fetched successfully",
      messages
    })
  } catch (error) {
    console.log(error);
    
    return res.status(500).json({
      message: "Server error while sending message"
    })
  }
}
