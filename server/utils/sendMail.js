const config = require("config");
const nodemailer = require("nodemailer");

// create a trannsporter

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  requireSSL: true,
  name: "teamab",
  auth: {
    user: config.get("nodeMail"),
    pass: config.get("nodePassword"),
  },
});
// send mail with defined transport object

let sendmail = async (subject, html, receiver) => {
  try {
    await transporter.sendMail({
      from: config.get("nodeMail"), // sender address
      to: receiver, // list of receivers
      subject, // Subject line
      html, // html body
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = sendmail;
