if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const twilio = require("twilio"); 

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function createVerificationCheck(code, phone) {
  const verificationCheck = await client.verify.v2
    .services("VA974698a2d2bce46d842fdc753d3bdece")
    .verificationChecks.create({
      code: code,
      to: "+1" + phone,
    });

  console.log(verificationCheck.status);
}

module.exports = createVerificationCheck