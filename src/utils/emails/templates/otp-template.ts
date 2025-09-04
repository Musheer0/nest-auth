export function generateOtpEmail(email:string, otp:string, title = "Account") {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 50px auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      .header {
        background-color: #4CAF50;
        color: white;
        padding: 20px;
        text-align: center;
      }
      .body {
        padding: 30px;
        text-align: center;
      }
      .otp {
        display: inline-block;
        font-size: 24px;
        font-weight: bold;
        color: #333333;
        padding: 10px 20px;
        margin: 20px 0;
        border: 2px dashed #4CAF50;
        border-radius: 8px;
      }
      .footer {
        padding: 20px;
        font-size: 12px;
        color: #777777;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>OTP Verification</h1>
      </div>
      <div class="body">
        <p>Hello <strong>${email}</strong>,</p>
        <p>This is your OTP for <strong>${title}</strong> verification:</p>
        <div class="otp">${otp}</div>
        <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
}
