
const nodemailer   = require('nodemailer');
const otptem       = require('../middlewares/otptemp.middleware'); 

module.exports =
{

SendMail:async function (mail_to,otp) {
  
    const template = await otptem.OtpFormat(otp);
  
    const transport = nodemailer.createTransport({
       
        service: "gmail",
        auth: {
            user: process.env.Email,
            pass: process.env.Epass
        },
        tls: {
            rejectUnauthorized: false
          }
        });
  
    
    transport.sendMail({
        from: 'amitwebdev2019@gmail.com',
        to: mail_to,
        subject:'Otp Verification',
        html: template
    });
  
    
    return  'ok';


}




}