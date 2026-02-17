import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface SendMeetingInviteProps {
  to: string[];
  meetingName: string;
  organizerName: string;
  joinUrl: string;
  scheduledAt?: Date | string | null;
}

export const sendMeetingInvite = async ({
  to,
  meetingName,
  organizerName,
  joinUrl,
  scheduledAt,
}: SendMeetingInviteProps) => {
  if (!to.length) return;

  const formattedDate = scheduledAt 
    ? new Date(scheduledAt).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    : "TBD";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .header {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          padding: 40px 20px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.025em;
        }
        .content {
          padding: 40px 30px;
        }
        .meeting-info {
          background: #f1f5f9;
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
        }
        .meeting-info-item {
          margin-bottom: 12px;
          font-size: 15px;
        }
        .meeting-info-label {
          color: #64748b;
          font-weight: 500;
          width: 100px;
          display: inline-block;
        }
        .meeting-info-value {
          color: #1e293b;
          font-weight: 600;
        }
        .button-container {
          text-align: center;
          margin-top: 32px;
        }
        .button {
          background-color: #6366f1;
          color: #ffffff !important;
          padding: 16px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          display: inline-block;
          transition: background-color 0.2s;
        }
        .footer {
          padding: 24px;
          text-align: center;
          font-size: 13px;
          color: #94a3b8;
          border-top: 1px solid #f1f5f9;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>You're Invited!</h1>
        </div>
        <div class="content">
          <p style="font-size: 16px; margin-top: 0;">Hi there,</p>
          <p><strong>${organizerName}</strong> has invited you to join a meeting on <strong>Aria AI</strong>.</p>
          
          <div class="meeting-info">
            <div class="meeting-info-item">
              <span class="meeting-info-label">Meeting:</span>
              <span class="meeting-info-value">${meetingName}</span>
            </div>
            <div class="meeting-info-item">
              <span class="meeting-info-label">Time:</span>
              <span class="meeting-info-value">${formattedDate}</span>
            </div>
            <div class="meeting-info-item">
              <span class="meeting-info-label">Platform:</span>
              <span class="meeting-info-value">Aria AI Video</span>
            </div>
          </div>

          <p>Click the button below to join the meeting when it's time.</p>

          <div class="button-container">
            <a href="${joinUrl}" class="button">Join Meeting</a>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated invitation from Aria AI.<br>If you wasn't expecting this, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Aria Meetings" <rahulvenkat207@gmail.com>',
      to: to.join(", "),
      subject: `Invitation: ${meetingName}`,
      html,
    });
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending meeting invite:", error);
    throw error;
  }
};
