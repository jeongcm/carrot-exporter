const nodemailer = require("nodemailer")
const mg = require("nodemailer-mailgun-transport")
const handlebars = require("handlebars")
const fs = require("fs")
const path = require("path")
class SendMailController {

public processMail = async(req, res, next)=>{
    const emailTemplateSource = fs.readFileSync(path.join(__dirname, "/sendMail.hbs"), "utf8")

const mailgunAuth = {
  auth: {
    api_key: "afc38a0b3a279b1c3da684fcaf5b6ede-7fba8a4e-6df6e2b9",
    domain: "sandboxf34105cd97c4421d8286857b8c3be8bb.mailgun.org"
  }
}

const smtpTransport = nodemailer.createTransport(mg(mailgunAuth))

const template = handlebars.compile(emailTemplateSource)

const htmlToSend = template({message: "Hello!"})

const mailOptions = {
  from: "jaswant.singh@exubers.com",
  to: "shrishti.raj@exubers.com",
  subject: "TESTING BY SHRISHTI",
  html: htmlToSend
}

smtpTransport.sendMail(mailOptions, function(error, response) {
  if (error) {
    console.log(error)
  } else {
      return res.status(200).json({mesaage:"Successfully sent email."})
    console.log("Successfully sent email.")
  }
})
}
}

export default SendMailController
