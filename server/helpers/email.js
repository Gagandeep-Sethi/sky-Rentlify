const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = (email, subject, text, html) => {
  try {
    let info = transporter.sendMail({
      from: {
        name: "Rentlify",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: subject,
      text: text,
      html: html,
    });
  } catch (error) {
    console.log(error, "sending mail error");
  }
};

module.exports = {
  sendEmail,
};
