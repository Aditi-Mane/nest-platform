import nodemailer from "nodemailer";

const clean = (v) => v?.toString().trim();

export const getTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: clean(process.env.MAIL_USER),
      pass: clean(process.env.MAIL_PASS),
    },
  });
};
