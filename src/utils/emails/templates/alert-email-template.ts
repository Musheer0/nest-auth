interface NotificationEmailProps {
  email: string;
  title: string; // e.g., "New user logged in", "MFA enabled", etc.
  extraInfo?: string; // optional additional info
}

export function generateNotificationEmail({ email, title, extraInfo }: NotificationEmailProps): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notification</title>
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
        background-color: #007BFF;
        color: white;
        padding: 20px;
        text-align: center;
      }
      .body {
        padding: 30px;
        text-align: center;
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
        <h1>Notification</h1>
      </div>
      <div class="body">
        <p>Hello <strong>${email}</strong>,</p>
        <p>${title}</p>
        ${extraInfo ? `<p>${extraInfo}</p>` : ""}
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
}

    