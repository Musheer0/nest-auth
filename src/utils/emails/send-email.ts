import * as nodemailer from "nodemailer";

export const SendEmail = async({to, html,title}:{to:string,html:string,title:string})=>{
    const transpoter = nodemailer?.createTransport({
        service:'gmail',
        auth:{
            user:process.env.EMAIL,
            pass:process.env.EMAIL_PASS
        }
    });
   const mailOptions = {
  from: '"Nest-Auth" ', // sender
  to, // receiver
  subject: title,
  html
};
    await transpoter.sendMail(mailOptions)
}