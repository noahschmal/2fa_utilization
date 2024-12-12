if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "jetaviz@gmail.com",
        pass: "mepp svwm bpmi jomf",
    },
});

function sendOTPEmail(email) {
    // Create email
    const code = (Math.floor(100000 + Math.random() * 900000));
    console.log(process.env.EMAIL)

    const mailOptions = {
        from: "jetaviz@gmail.com",
        to: email,
        subject: "One-time login code",
        text: "Please enter the following code: " + code,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email: ", error);
        } else {
          console.log("Email sent: ", info.response);
        }
      });

    // Return code
    return code
}

module.exports = sendOTPEmail