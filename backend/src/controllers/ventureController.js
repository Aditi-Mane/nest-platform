import Venture from "../models/Venture.js";
import Notification from "../models/Notification.js";
import VentureMessage from "../models/VentureMessage.js";
import { getIO } from "../config/socket.js";

// ─────────────────────────────────────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────────────────────────────────────

export const notify = async ({ recipient, type, message, link, venture, application, triggeredBy }) => {
  await Notification.create({ recipient, type, message, link, venture, application, triggeredBy });
};

// ─────────────────────────────────────────────────────────────────────────────
// VENTURES — CRUD
// ─────────────────────────────────────────────────────────────────────────────

export const getVentures = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 9,
      search,
      category,
      stage,
      isRecruiting,
      sort = "recent",
    } = req.query;

    const filter = { isArchived: false };

    if (search) filter.$text = { $search: search };
    if (category && category !== "all") filter.category = category;
    if (stage && stage !== "all") filter.stage = stage;
    if (isRecruiting === "true") filter.isRecruiting = true;

    const sortMap = {
      recent: { createdAt: -1 },

      popular: { "likes.length": -1 },
      views: { views: -1 },
    };

  let query = Venture.find(filter)
  .skip((page - 1) * limit)
  .limit(Number(limit))
  .populate("creator", "name email collegeName avatar")
  .select("-comments -updates -pitchDeckUrl -pitchDeckAccessList");

  if (sort === "popular") {
   query = Venture.aggregate([
  { $match: filter },

  // Add likes count
  { $addFields: { likesCount: { $size: "$likes" } } },

  // Sort
  { $sort: { likesCount: -1 } },

  // Pagination
  { $skip: (page - 1) * limit },
  { $limit: Number(limit) },

  // 🔥 JOIN creator
  {
    $lookup: {
      from: "users", // collection name in MongoDB
      localField: "creator",
      foreignField: "_id",
      as: "creator",
    },
  },

  // Convert array → object
  {
    $unwind: "$creator",
  },

  // Select only needed fields
  {
    $project: {
      title: 1,
      description: 1,
      category: 1,
      stage: 1,
      tags: 1,
      likes: 1,
      views: 1,
      teamMembers: 1,
      teamLimit: 1,
      isRecruiting: 1,
      createdAt: 1,
      creator: {
        _id: 1,
        name: 1,
        email: 1,
        collegeName: 1,
        avatar: 1,
      },
    },
  },
]);
  } else {
    query = query.sort(sortMap[sort] || { createdAt: -1 });
  }

   const ventures = await query;

    const total = await Venture.countDocuments(filter);

    res.json({
      ventures,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyVentures = async (req, res) => {
  try {
    const ventures = await Venture.find({ creator: req.user._id })
      .sort({ createdAt: -1 })
      .select("-pitchDeckUrl -pitchDeckAccessList");
      

    res.json({ ventures });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getVentureById = async (req, res) => {
  try {
    const venture = await Venture.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
    
      .populate("creator", "name email collegeName avatar")
      .populate("teamMembers.user", "name email collegeName avatar")
      .populate("comments.user", "name avatar");

    if (!venture) return res.status(404).json({ message: "Venture not found" });

    const requesterId = req.user?._id?.toString();
    const hasAccess =
      venture.pitchDeckAccessList.map((id) => id.toString()).includes(requesterId) ||
      venture.creator._id.toString() === requesterId;

    if (!hasAccess) venture.pitchDeckUrl = undefined;

    res.json({ venture });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createVenture = async (req, res) => {
  try {
    const {
      title, description, fullDescription, category,
      stage, teamLimit, openRoles, milestones, tags, isRecruiting,
    } = req.body;

    const similar = await Venture.find({ $text: { $search: title }, isArchived: false })
      .limit(3)
      .select("title _id");

    const venture = await Venture.create({
      title,
      description,
      fullDescription,
      category,
      stage: stage || "active",
      creator: req.user._id,
      teamLimit,
      openRoles,
      milestones,
      tags,
      isRecruiting: isRecruiting || false,
      teamMembers: [
        { user: req.user._id, role: "Founder", confirmed: true, joinedAt: new Date() },
      ],
    });

    res.status(201).json({ venture, similarVentures: similar });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateVenture = async (req, res) => {
  try {
    const venture = await Venture.findById(req.params.id);
    if (!venture) return res.status(404).json({ message: "Venture not found" });
    if (venture.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorised" });

    const allowedFields = [
      "title", "description", "fullDescription", "category",
      "stage", "teamLimit", "openRoles", "tags", "isRecruiting", "pitchDeckUrl",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) venture[field] = req.body[field];
    });

    if (req.body.stage && req.body.stage !== venture.stage) {
      const notifyAll = venture.followers.map((userId) =>
        notify({
          recipient: userId,
          type: "stage_changed",
          message: `"${venture.title}" moved to ${req.body.stage}`,
          link: `/marketplace/buyer/ventures/${venture._id}`,
          venture: venture._id,
          triggeredBy: req.user._id,
        })
      );
      await Promise.all(notifyAll);
    }

    await venture.save();
    res.json({ venture });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteVenture = async (req, res) => {
  try {
    const venture = await Venture.findById(req.params.id);
    if (!venture) return res.status(404).json({ message: "Venture not found" });
    if (venture.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorised" });

    venture.isArchived = true;
    venture.stage = "closed";
    await venture.save();

    res.json({ message: "Venture archived successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TEAM MEMBERS
// ─────────────────────────────────────────────────────────────────────────────

export const inviteTeamMember = async (req, res) => {
  try {
    const venture = await Venture.findById(req.params.id);
    if (!venture) return res.status(404).json({ message: "Venture not found" });
    if (venture.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorised" });

    const { userId, role } = req.body;

    const alreadyMember = venture.teamMembers.some((m) => m.user.toString() === userId);
    if (alreadyMember)
      return res.status(400).json({ message: "User is already on the team" });

    venture.teamMembers.push({ user: userId, role, confirmed: false });
    await venture.save();

    await notify({
      recipient: userId,
      type: "team_invite",
      message: `You've been invited to join "${venture.title}" as ${role}`,
      link: `/marketplace/buyer/ventures/${venture._id}`,
      venture: venture._id,
      triggeredBy: req.user._id,
    });

    res.json({ message: "Invite sent", venture });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const confirmTeamInvite = async (req, res) => {
  try {
    const { accept } = req.body;
    const venture = await Venture.findById(req.params.id);
    if (!venture) return res.status(404).json({ message: "Venture not found" });

    const member = venture.teamMembers.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!member) return res.status(404).json({ message: "Invite not found" });

    if (accept) {
      member.confirmed = true;
      member.joinedAt = new Date();
      await venture.save();

      await notify({
        recipient: venture.creator,
        type: "team_invite_accepted",
        message: `${req.user.name} confirmed their invite to "${venture.title}"`,
        link: `/marketplace/buyer/ventures/${venture._id}`,
        venture: venture._id,
        triggeredBy: req.user._id,
      });

      res.json({ message: "You have joined the team!" });
    } else {
      venture.teamMembers = venture.teamMembers.filter(
        (m) => m.user.toString() !== req.user._id.toString()
      );
      await venture.save();
      res.json({ message: "Invite declined" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const removeTeamMember = async (req, res) => {
  try {
    const venture = await Venture.findById(req.params.id);
    if (!venture) return res.status(404).json({ message: "Venture not found" });
    if (venture.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorised" });

    venture.teamMembers = venture.teamMembers.filter(
      (m) => m.user.toString() !== req.params.userId
    );
    await venture.save();

    res.json({ message: "Member removed", venture });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MILESTONES
// ─────────────────────────────────────────────────────────────────────────────

export const addMilestone = async (req, res) => {
  try {
    const venture = await Venture.findById(req.params.id);
    if (!venture) return res.status(404).json({ message: "Venture not found" });
    if (venture.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorised" });

    venture.milestones.push({ title: req.body.title, targetDate: req.body.targetDate });
    await venture.save();

    res.json({ venture });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateMilestone = async (req, res) => {
  try {
    const venture = await Venture.findById(req.params.id);
    if (!venture) return res.status(404).json({ message: "Venture not found" });
    if (venture.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorised" });

    const milestone = venture.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ message: "Milestone not found" });

    if (req.body.title !== undefined) milestone.title = req.body.title;
    if (req.body.targetDate !== undefined) milestone.targetDate = req.body.targetDate;
    if (req.body.completed !== undefined) {
      milestone.completed = req.body.completed;
      milestone.completedAt = req.body.completed ? new Date() : null;

      if (req.body.completed) {
        const notifyAll = venture.followers.map((userId) =>
          notify({
            recipient: userId,
            type: "milestone_updated",
            message: `"${venture.title}" completed milestone: ${milestone.title}`,
            link: `/marketplace/buyer/ventures/${venture._id}`,
            venture: venture._id,
            triggeredBy: req.user._id,
          })
        );
        await Promise.all(notifyAll);
      }
    }

    await venture.save();
    res.json({ venture });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteMilestone = async (req, res) => {
  try {
    const venture = await Venture.findById(req.params.id);
    if (!venture) return res.status(404).json({ message: "Venture not found" });
    if (venture.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorised" });

    venture.milestones.pull({ _id: req.params.milestoneId });
    await venture.save();

    res.json({ venture });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATES FEED
// ─────────────────────────────────────────────────────────────────────────────

export const postUpdate = async (req, res) => {
  try {
    const venture = await Venture.findById(req.params.id);
    if (!venture) return res.status(404).json({ message: "Venture not found" });
    if (venture.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorised" });

    venture.updates.unshift({ text: req.body.text });
    await venture.save();

    const notifyAll = venture.followers.map((userId) =>
      notify({
        recipient: userId,
        type: "new_update",
        message: `"${venture.title}" posted a new update`,
        link: `/marketplace/buyer/ventures/${venture._id}`,
        venture: venture._id,
        triggeredBy: req.user._id,
      })
    );
    await Promise.all(notifyAll);

    res.json({ venture });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// COMMENTS
// ─────────────────────────────────────────────────────────────────────────────

export const addComment = async (req, res) => {
  try {
    const venture = await Venture.findById(req.params.id);
    if (!venture) return res.status(404).json({ message: "Venture not found" });

    venture.comments.push({ user: req.user._id, text: req.body.text });
    await venture.save();

    await notify({
      recipient: venture.creator,
      type: "new_comment",
      message: `${req.user.name} commented on "${venture.title}"`,
      link: `/marketplace/buyer/ventures/${venture._id}`,
      venture: venture._id,
      triggeredBy: req.user._id,
    });

    res.json({ venture });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ENGAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export const toggleLike = async (req, res) => {
  try {
    const venture = await Venture.findById(req.params.id);
    if (!venture) return res.status(404).json({ message: "Venture not found" });

    const idx = venture.likes.indexOf(req.user._id);
    idx === -1 ? venture.likes.push(req.user._id) : venture.likes.splice(idx, 1);

    await venture.save();
    res.json({ likes: venture.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleFollow = async (req, res) => {
  try {
    const venture = await Venture.findById(req.params.id);
    if (!venture) return res.status(404).json({ message: "Venture not found" });

    const idx = venture.followers.indexOf(req.user._id);
    idx === -1 ? venture.followers.push(req.user._id) : venture.followers.splice(idx, 1);

    await venture.save();
    res.json({ followers: venture.followers.length, following: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleEndorse = async (req, res) => {
  try {
    const venture = await Venture.findById(req.params.id);
    if (!venture) return res.status(404).json({ message: "Venture not found" });

    const idx = venture.endorsements.indexOf(req.user._id);
    if (idx === -1) {
      venture.endorsements.push(req.user._id);
      await notify({
        recipient: venture.creator,
        type: "venture_endorsed",
        message: `${req.user.name} endorsed "${venture.title}"`,
        link: `/marketplace/buyer/ventures/${venture._id}`,
        venture: venture._id,
        triggeredBy: req.user._id,
      });
    } else {
      venture.endorsements.splice(idx, 1);
    }

    await venture.save();
    res.json({ endorsements: venture.endorsements.length, endorsed: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { ventureId } = req.params;
    const venture = await Venture.findById(ventureId).select("creator teamMembers");

    if (!venture) {
      return res.status(404).json({ message: "Venture not found" });
    }

    const userId = req.user._id.toString();
    const isCreator = venture.creator.toString() === userId;
    const isConfirmedMember = venture.teamMembers.some(
      (member) => member.user.toString() === userId && member.confirmed
    );

    if (!isCreator && !isConfirmedMember) {
      return res.status(403).json({ message: "Not authorised" });
    }

    const messages = await VentureMessage.find({ venture: ventureId })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { ventureId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const venture = await Venture.findById(ventureId).select("creator teamMembers");

    if (!venture) {
      return res.status(404).json({ message: "Venture not found" });
    }

    const userId = req.user._id.toString();
    const isCreator = venture.creator.toString() === userId;
    const isConfirmedMember = venture.teamMembers.some(
      (member) => member.user.toString() === userId && member.confirmed
    );

    if (!isCreator && !isConfirmedMember) {
      return res.status(403).json({ message: "Not authorised" });
    }

    const message = await VentureMessage.create({
      venture: ventureId,
      sender: req.user._id,
      text: text.trim(),
    });

    const populated = await message.populate("sender", "name avatar");
    const io = getIO();
    io.to(`venture:${ventureId}`).emit("receive_venture_message", populated);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
