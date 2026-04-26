import { getTransporter } from "./mailer.js";

const clean = (value) => value?.toString().trim();
const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getAppBaseUrl = () =>
  clean(process.env.FRONTEND_URL) ||
  clean(process.env.CLIENT_URL) ||
  clean(process.env.APP_URL) ||
  "https://nestplatform.website";

const getAdminRecipients = () =>
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

const sendEmail = async ({ to, subject, html }) => {
  if (!to || (Array.isArray(to) && to.length === 0)) {
    return false;
  }

  const transporter = getTransporter();

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to,
    subject,
    html,
  });

  return true;
};

export const sendVerificationSubmittedToAdminsEmail = async (user) => {
  try {
    const recipients = getAdminRecipients();

    if (recipients.length === 0) {
      return false;
    }

    const adminLink = `${getAppBaseUrl()}/admin`;

    return await sendEmail({
      to: recipients,
      subject: "New user verification request on NEST",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #222;">
          <h2 style="margin-bottom: 12px;">New verification request</h2>
          <p>A user has submitted their signup verification request for admin review.</p>
          <p><strong>Name:</strong> ${escapeHtml(user.name || "N/A")}</p>
          <p><strong>Email:</strong> ${escapeHtml(user.email || "N/A")}</p>
          <p><strong>PRN:</strong> ${escapeHtml(user.collegeId || "N/A")}</p>
          <p style="margin-top: 20px;">
            <a href="${adminLink}" style="display: inline-block; padding: 10px 16px; background: #C96A2B; color: #fff; text-decoration: none; border-radius: 8px;">
              Open Admin Dashboard
            </a>
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send verification submission email:", error.message);
    return false;
  }
};

export const sendVerificationApprovedEmail = async (user) => {
  try {
    if (!user?.email) {
      return false;
    }

    const marketplaceLink = `${getAppBaseUrl()}/marketplace/buyer`;

    return await sendEmail({
      to: user.email,
      subject: "Your NEST signup request has been approved",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #222;">
          <h2 style="margin-bottom: 12px;">Your account is approved</h2>
          <p>Hi ${escapeHtml(user.name || "there")},</p>
          <p>Your signup verification request has been approved. You can now continue using NEST.</p>
          <p style="margin-top: 20px;">
            <a href="${marketplaceLink}" style="display: inline-block; padding: 10px 16px; background: #6E7B5C; color: #fff; text-decoration: none; border-radius: 8px;">
              Open Marketplace
            </a>
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send approval email:", error.message);
    return false;
  }
};

export const sendOfflineChatEmail = async ({
  recipient,
  senderName,
  productName,
  messageText,
  conversationId,
  recipientRole,
}) => {
  try {
    if (!recipient?.email) {
      return false;
    }

    if (recipient?.notifications?.messages === false) {
      return false;
    }

    const safePreview =
      messageText?.length > 140
        ? `${messageText.slice(0, 137)}...`
        : messageText;

    const chatPath =
      recipientRole === "seller"
        ? `/marketplace/seller/messages/${conversationId}`
        : `/marketplace/buyer/messages/${conversationId}`;

    const chatLink = `${getAppBaseUrl()}${chatPath}`;

    return await sendEmail({
      to: recipient.email,
      subject: `New message from ${senderName} on NEST`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #222;">
          <h2 style="margin-bottom: 12px;">You have a new message</h2>
          <p><strong>${escapeHtml(senderName)}</strong> sent you a message${productName ? ` about <strong>${escapeHtml(productName)}</strong>` : ""}.</p>
          <div style="margin: 16px 0; padding: 14px; background: #FBF6ED; border: 1px solid #CFAE8E; border-radius: 10px;">
            ${escapeHtml(safePreview || "")}
          </div>
          <p>
            <a href="${chatLink}" style="display: inline-block; padding: 10px 16px; background: #C96A2B; color: #fff; text-decoration: none; border-radius: 8px;">
              Open Chat
            </a>
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send offline chat email:", error.message);
    return false;
  }
};

export const sendDealConfirmedEmail = async ({
  buyer,
  sellerName,
  productName,
  quantity,
  pricePerItem,
  totalPrice,
  paymentMethod,
}) => {
  try {
    if (!buyer?.email) {
      return false;
    }

    const buyerChatLink = `${getAppBaseUrl()}/marketplace/buyer/messages`;

    return await sendEmail({
      to: buyer.email,
      subject: `Deal confirmed for ${productName || "your item"} on NEST`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #222;">
          <h2 style="margin-bottom: 12px;">Your deal has been confirmed</h2>
          <p>Hi ${escapeHtml(buyer.name || "there")},</p>
          <p><strong>${escapeHtml(sellerName || "The seller")}</strong> has confirmed your deal${productName ? ` for <strong>${escapeHtml(productName)}</strong>` : ""}.</p>
          <div style="margin: 16px 0; padding: 14px; background: #FBF6ED; border: 1px solid #CFAE8E; border-radius: 10px;">
            <p style="margin: 0 0 8px;"><strong>Quantity:</strong> ${quantity}</p>
            <p style="margin: 0 0 8px;"><strong>Price per item:</strong> Rs. ${pricePerItem}</p>
            <p style="margin: 0 0 8px;"><strong>Total:</strong> Rs. ${totalPrice}</p>
            <p style="margin: 0;"><strong>Payment method:</strong> ${escapeHtml((paymentMethod || "").toUpperCase())}</p>
          </div>
          <p>Please meet the seller at the negotiated place and time discussed in your chat.</p>
          <p>Important: only share the delivery OTP after the product has been handed over to you and you have checked it properly.</p>
          <p>
            <a href="${buyerChatLink}" style="display: inline-block; padding: 10px 16px; background: #C96A2B; color: #fff; text-decoration: none; border-radius: 8px;">
              View Conversation
            </a>
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send deal confirmed email:", error.message);
    return false;
  }
};

export const sendDealCancelledEmail = async ({
  buyer,
  sellerName,
  productName,
}) => {
  try {
    if (!buyer?.email) {
      return false;
    }

    const buyerChatLink = `${getAppBaseUrl()}/marketplace/buyer/messages`;

    return await sendEmail({
      to: buyer.email,
      subject: `Deal cancelled for ${productName || "your item"} on NEST`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #222;">
          <h2 style="margin-bottom: 12px;">Your deal has been cancelled</h2>
          <p>Hi ${escapeHtml(buyer.name || "there")},</p>
          <p><strong>${escapeHtml(sellerName || "The seller")}</strong> has cancelled the deal${productName ? ` for <strong>${escapeHtml(productName)}</strong>` : ""}.</p>
          <p>If you still want the item, you can continue the conversation or negotiate a new deal later.</p>
          <p>
            <a href="${buyerChatLink}" style="display: inline-block; padding: 10px 16px; background: #C96A2B; color: #fff; text-decoration: none; border-radius: 8px;">
              Open Conversation
            </a>
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send deal cancelled email:", error.message);
    return false;
  }
};

export const sendOrderOtpEmail = async ({
  buyer,
  otp,
  productName,
}) => {
  try {
    if (!buyer?.email) {
      return false;
    }

    return await sendEmail({
      to: buyer.email,
      subject: `Delivery OTP for ${productName || "your order"} - NEST`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #222;">
          <h2 style="margin-bottom: 12px;">Order delivery confirmation OTP</h2>
          <p>Hi ${escapeHtml(buyer.name || "there")},</p>
          <p>Your OTP for receiving ${productName ? `<strong>${escapeHtml(productName)}</strong>` : "your product"} is:</p>
          <h1 style="letter-spacing: 5px;">${escapeHtml(otp)}</h1>
          <p>This OTP will expire in 2 minutes.</p>
          <p>Only share this OTP after the seller has handed over the product to you in person.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send OTP email:", error.message);
    return false;
  }
};

export const sendOrderCompletedReviewEmail = async ({
  buyer,
  sellerName,
  productName,
  productId,
}) => {
  try {
    if (!buyer?.email || !productId) {
      return false;
    }

    const reviewLink = `${getAppBaseUrl()}/marketplace/ProfilePage?reviewProduct=${productId}`;

    return await sendEmail({
      to: buyer.email,
      subject: `Order completed for ${productName || "your purchase"} - leave a review`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #222;">
          <h2 style="margin-bottom: 12px;">Your order is complete</h2>
          <p>Hi ${escapeHtml(buyer.name || "there")},</p>
          <p>Your order${productName ? ` for <strong>${escapeHtml(productName)}</strong>` : ""} with <strong>${escapeHtml(sellerName || "the seller")}</strong> has been marked as completed successfully.</p>
          <p>If everything went well, please leave a quick review to help other buyers.</p>
          <p>
            <a href="${reviewLink}" style="display: inline-block; padding: 10px 16px; background: #6E7B5C; color: #fff; text-decoration: none; border-radius: 8px;">
              Review Product
            </a>
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send completed order email:", error.message);
    return false;
  }
};

export const sendVentureApplicationEmail = async ({
  creator,
  applicantName,
  ventureTitle,
  roleAppliedFor,
  ventureId,
}) => {
  try {
    if (!creator?.email) {
      return false;
    }

    const ventureLink = `${getAppBaseUrl()}/marketplace/buyer/ventures/${ventureId}`;

    return await sendEmail({
      to: creator.email,
      subject: `New application for "${ventureTitle}" on NEST`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #222;">
          <h2 style="margin-bottom: 12px;">New team application</h2>
          <p><strong>${escapeHtml(applicantName || "Someone")}</strong> has applied to join your venture <strong>"${escapeHtml(ventureTitle)}"</strong> for the role of <strong>${escapeHtml(roleAppliedFor)}</strong>.</p>
          <p>Review their application and decide whether to accept or reject them.</p>
          <p>
            <a href="${ventureLink}" style="display: inline-block; padding: 10px 16px; background: #C96A2B; color: #fff; text-decoration: none; border-radius: 8px;">
              Review Application
            </a>
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send venture application email:", error.message);
    return false;
  }
};

export const sendVentureAcceptanceEmail = async ({
  applicant,
  ventureTitle,
  roleAccepted,
  ventureId,
}) => {
  try {
    if (!applicant?.email) {
      return false;
    }

    const ventureLink = `${getAppBaseUrl()}/marketplace/buyer/ventures/${ventureId}`;

    return await sendEmail({
      to: applicant.email,
      subject: `Welcome to "${ventureTitle}" team on NEST`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #222;">
          <h2 style="margin-bottom: 12px;">You've been accepted!</h2>
          <p>Hi ${escapeHtml(applicant.name || "there")},</p>
          <p>Congratulations! Your application for <strong>${escapeHtml(roleAccepted)}</strong> on <strong>"${escapeHtml(ventureTitle)}"</strong> has been accepted.</p>
          <p>You are now part of the team. Start collaborating with your new teammates!</p>
          <p>
            <a href="${ventureLink}" style="display: inline-block; padding: 10px 16px; background: #6E7B5C; color: #fff; text-decoration: none; border-radius: 8px;">
              Join Team Chat
            </a>
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send venture acceptance email:", error.message);
    return false;
  }
};

export const sendVentureOfflineMessageEmail = async ({
  recipient,
  senderName,
  ventureTitle,
  messageText,
  ventureId,
}) => {
  try {
    if (!recipient?.email) {
      return false;
    }

    if (recipient?.notifications?.messages === false) {
      return false;
    }

    const safePreview =
      messageText?.length > 140
        ? `${messageText.slice(0, 137)}...`
        : messageText;

    const ventureLink = `${getAppBaseUrl()}/marketplace/buyer/ventures/${ventureId}`;

    return await sendEmail({
      to: recipient.email,
      subject: `New message in "${ventureTitle}" team chat on NEST`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #222;">
          <h2 style="margin-bottom: 12px;">New team message</h2>
          <p><strong>${escapeHtml(senderName)}</strong> sent a message in the <strong>"${escapeHtml(ventureTitle)}"</strong> team chat.</p>
          <div style="margin: 16px 0; padding: 14px; background: #FBF6ED; border: 1px solid #CFAE8E; border-radius: 10px;">
            ${escapeHtml(safePreview || "")}
          </div>
          <p>
            <a href="${ventureLink}" style="display: inline-block; padding: 10px 16px; background: #C96A2B; color: #fff; text-decoration: none; border-radius: 8px;">
              Open Team Chat
            </a>
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send venture offline message email:", error.message);
    return false;
  }
};
