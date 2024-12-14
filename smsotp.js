if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken);



function sendOTPSMS(phone) {    
    client.verify.v2.services("VA974698a2d2bce46d842fdc753d3bdece")
      .verifications
      .create({to: '+1' + phone, channel: 'sms'})
      .then(verification => code = (verification.sid));
}

module.exports = sendOTPSMS