const nodemailer = require("nodemailer")

exports.sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "b709c930585d02",
            pass: "598df0e3d6914a"
        }
    })

    const mailOptions = {
        from:process.env.SMPT_MAIL,
        to: options.email,
        subject: options.subject,
        text:options.message
    }

    await transporter.sendMail(mailOptions)
}