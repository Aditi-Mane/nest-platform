import Application from "../models/Application.js";
import Venture from "../models/Venture.js";
import Notification from "../models/Notification.js";

const notify = async ({ recipient, type, message, link, venture, application, triggeredBy }) => {
  await Notification.create({ recipient, type, message, link, venture, application, triggeredBy });
};

export const applyToVenture = async (req, res) => {
  try {
    const venture = await Venture.findById(req.params.id);
    if (!venture) return res.status(404).json({ message: "Venture not found" });

    if (venture.creator.toString() === req.user._id.toString())
      return res.status(400).json({ message: "You cannot apply to your own venture" });

    const alreadyMember = venture.teamMembers.some(
      (m) => m.user.toString() === req.user._id.toString() && m.confirmed
    );
    if (alreadyMember)
      return res.status(400).json({ message: "You are already a member of this venture" });

    if (!venture.isRecruiting)
      return res.status(400).json({ message: "This venture is not currently recruiting" });

    const { roleAppliedFor, whyJoin, portfolioUrl, resumeUrl } = req.body;

    const application = await Application.create({
      venture: venture._id,
      applicant: req.user._id,
      roleAppliedFor,
      whyJoin,
      portfolioUrl: portfolioUrl || null,
      resumeUrl: resumeUrl || null,
    });

    await notify({
      recipient: venture.creator,
      type: "application_received",
      message: `${req.user.name} applied for ${roleAppliedFor} on "${venture.title}"`,
      link: `/marketplace/buyer/ventures/${venture._id}`,
      venture: venture._id,
      application: application._id,
      triggeredBy: req.user._id,
    });

    res.status(201).json({ application });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: "You have already applied to this venture" });
    res.status(400).json({ message: err.message });
  }
};

export const getApplications = async (req, res) => {
  try {
    const venture = await Venture.findById(req.params.id).select("creator");
    if (!venture) return res.status(404).json({ message: "Venture not found" });
    if (venture.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorised" });

    const filter = { venture: req.params.id };
    if (req.query.status && req.query.status !== "all") filter.status = req.query.status;

    const applications = await Application.find(filter)
      .populate("applicant", "name avatar major year email")
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const respondToApplication = async (req, res) => {
  try {
    const venture = await Venture.findById(req.params.id);
    if (!venture) return res.status(404).json({ message: "Venture not found" });
    if (venture.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorised" });

    const application = await Application.findById(req.params.appId);
    if (!application) return res.status(404).json({ message: "Application not found" });

    const { status, creatorNote } = req.body;
    if (!["accepted", "rejected"].includes(status))
      return res.status(400).json({ message: "Status must be accepted or rejected" });

    application.status = status;
    application.creatorNote = creatorNote || null;
    application.respondedAt = new Date();
    await application.save();

    if (status === "accepted") {
      const alreadyMember = venture.teamMembers.some(
        (m) => m.user.toString() === application.applicant.toString()
      );
      if (!alreadyMember) {
        venture.teamMembers.push({
          user: application.applicant,
          role: application.roleAppliedFor,
          confirmed: true,
          joinedAt: null,
        });
        await venture.save();
      }

      await notify({
        recipient: application.applicant,
        type: "application_accepted",
        message: `Your application for "${venture.title}" was accepted! Please confirm to join.`,
        link: `/marketplace/buyer/ventures/${venture._id}`,
        venture: venture._id,
        application: application._id,
        triggeredBy: req.user._id,
      });
    } else {
      await notify({
        recipient: application.applicant,
        type: "application_rejected",
        message: `Your application for "${venture.title}" was not accepted this time.`,
        link: `/marketplace/buyer/ventures/${venture._id}`,
        venture: venture._id,
        application: application._id,
        triggeredBy: req.user._id,
      });
    }

    res.json({ application });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.appId);
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (application.applicant.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorised" });
    if (application.status !== "pending")
      return res.status(400).json({ message: "Can only withdraw a pending application" });

    application.status = "withdrawn";
    await application.save();

    res.json({ message: "Application withdrawn" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate("venture", "title stage category creator")
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getApplicationStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { ventureId } = req.params;

    const application = await Application.findOne({
      venture: ventureId,
      applicant: userId,
    }).select("status creatorNote respondedAt roleAppliedFor");

    if(!application) {
      return res.status(404).json({
        message: "No application found for this venture",
        status: null,
      });
    }

    res.status(200).json({
      status: application.status,
      roleAppliedFor: application.roleAppliedFor,
      creatorNote: application.creatorNote,
      respondedAt: application.respondedAt,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getAcceptedApplications = async (req, res) => {
  try {
    const userId = req.user._id;

    const applications = await Application.find({
      applicant: userId,
      status: "accepted",
    })
      .populate({
        path: "venture",
        select: "title description category stage creator teamMembers teamLimit",
        populate: {
          path: "creator",
          select: "name avatar collegeName",
        },
      })
      .select("venture roleAppliedFor respondedAt");

    res.status(200).json({
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};