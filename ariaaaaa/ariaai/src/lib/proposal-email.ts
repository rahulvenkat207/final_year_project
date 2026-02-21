import nodemailer from "nodemailer";
import crypto from "crypto";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const ADMIN_EMAIL = "rahulvenkat207@gmail.com";
const TOKEN_SECRET = process.env.PROPOSAL_TOKEN_SECRET || "aria-proposal-secret-key-2024";

// ─── Token Helpers ─────────────────────────────────────────────────────────────

export function generateStatusToken(proposalId: string, stage: string): string {
    return crypto
        .createHmac("sha256", TOKEN_SECRET)
        .update(`${proposalId}:${stage}`)
        .digest("hex");
}

export function verifyStatusToken(proposalId: string, stage: string, token: string): boolean {
    const expected = generateStatusToken(proposalId, stage);
    // Constant-time comparison to prevent timing attacks
    try {
        return crypto.timingSafeEqual(
            Buffer.from(token, "hex"),
            Buffer.from(expected, "hex")
        );
    } catch {
        return false;
    }
}

// ─── Email Builder ─────────────────────────────────────────────────────────────

interface ProposalEmailProps {
    proposalId: string;
    agentName: string;
    useCase: string;
    behaviorDescription: string;
    voiceStyle: string;
    language: string;
    contactEmail: string;
    additionalNotes?: string;
    submittedByName: string;
    submittedByEmail: string;
}

function getActionUrl(proposalId: string, stage: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const token = generateStatusToken(proposalId, stage);
    return `${baseUrl}/api/proposals/${proposalId}/update-status?stage=${stage}&token=${token}`;
}

function buildAdminActionButtons(proposalId: string): string {
    const stages = [
        { stage: "accepted",   label: "✅ Accept Proposal",  color: "#10b981", bg: "#d1fae5" },
        { stage: "building",    label: "🔨 Start Building",   color: "#6366f1", bg: "#e0e7ff" },
        { stage: "testing",     label: "🧪 Mark as Testing",  color: "#f59e0b", bg: "#fef3c7" },
        { stage: "deployed",    label: "🚀 Mark as Deployed", color: "#3b82f6", bg: "#dbeafe" },
        { stage: "integrated",  label: "🔗 Mark Integrated",  color: "#8b5cf6", bg: "#ede9fe" },
        { stage: "rejected",    label: "❌ Reject",           color: "#ef4444", bg: "#fee2e2" },
    ];

    return stages
        .map(
            ({ stage, label, color, bg }) => `
        <a href="${getActionUrl(proposalId, stage)}"
           style="display:inline-block;margin:6px 4px;padding:13px 22px;
                  background-color:${bg};color:${color};
                  border:2px solid ${color};border-radius:10px;
                  font-weight:700;font-size:13px;text-decoration:none;
                  font-family:system-ui,sans-serif;">
            ${label}
        </a>`
        )
        .join("\n");
}

export async function sendProposalEmail(props: ProposalEmailProps): Promise<void> {
    const {
        proposalId,
        agentName,
        useCase,
        behaviorDescription,
        voiceStyle,
        language,
        contactEmail,
        additionalNotes,
        submittedByName,
        submittedByEmail,
    } = props;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; background: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
    .wrap { max-width: 620px; margin: 40px auto; background: #ffffff; border-radius: 20px;
            overflow: hidden; box-shadow: 0 4px 30px rgba(99,102,241,0.12); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 40px 36px; }
    .header h1 { color: #fff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.03em; }
    .header p  { color: rgba(255,255,255,0.75); margin: 6px 0 0; font-size: 14px; }
    .badge { display:inline-block; background:rgba(255,255,255,0.2); color:#fff;
             font-size:11px; font-weight:700; padding:4px 12px; border-radius:99px;
             text-transform:uppercase; letter-spacing:0.1em; margin-bottom:14px; }
    .body { padding: 36px; }
    .row { margin-bottom: 18px; }
    .label { font-size: 11px; font-weight: 700; text-transform: uppercase;
             letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 4px; }
    .value { font-size: 15px; color: #1e293b; font-weight: 500;
             background: #f1f5f9; border-radius: 10px; padding: 12px 16px;
             border: 1px solid #e2e8f0; }
    .divider { height: 1px; background: #f1f5f9; margin: 28px 0; }
    .actions-title { font-size: 16px; font-weight: 800; color: #1e293b; margin-bottom: 6px; }
    .actions-sub { font-size: 13px; color: #64748b; margin-bottom: 18px; }
    .actions { background: #f8fafc; border-radius: 14px; padding: 22px; border: 1px solid #e2e8f0; text-align:center; }
    .footer { padding: 24px 36px; background: #f8fafc; text-align: center;
              font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    .proposal-id { font-family: monospace; font-size: 12px; color: #6366f1;
                   background: #eef2ff; padding: 3px 8px; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div class="badge">New Request</div>
      <h1>Custom Agent Proposal</h1>
      <p>A client has submitted a new voice agent customization request.</p>
    </div>
    <div class="body">
      <div class="row">
        <div class="label">Proposal ID</div>
        <div class="value"><span class="proposal-id">#${proposalId}</span></div>
      </div>
      <div class="row">
        <div class="label">Submitted By</div>
        <div class="value">${submittedByName} &lt;${submittedByEmail}&gt;</div>
      </div>
      <div class="row">
        <div class="label">Contact Email</div>
        <div class="value">${contactEmail}</div>
      </div>

      <div class="divider"></div>

      <div class="row">
        <div class="label">Agent Name</div>
        <div class="value">${agentName}</div>
      </div>
      <div class="row">
        <div class="label">Use Case</div>
        <div class="value">${useCase}</div>
      </div>
      <div class="row">
        <div class="label">Voice Style</div>
        <div class="value">${voiceStyle}</div>
      </div>
      <div class="row">
        <div class="label">Language</div>
        <div class="value">${language}</div>
      </div>
      <div class="row">
        <div class="label">Behavior Description</div>
        <div class="value" style="white-space:pre-wrap;">${behaviorDescription}</div>
      </div>
      ${
          additionalNotes
              ? `<div class="row">
          <div class="label">Additional Notes</div>
          <div class="value" style="white-space:pre-wrap;">${additionalNotes}</div>
        </div>`
              : ""
      }

      <div class="divider"></div>

      <div class="actions-title">🎯 Update Proposal Status</div>
      <div class="actions-sub">Click a button below to update the proposal stage. The client will see the change instantly.</div>
      <div class="actions">
        ${buildAdminActionButtons(proposalId)}
      </div>
    </div>
    <div class="footer">
      <p>This is an internal admin notification from <strong>Aria.AI</strong>.</p>
      <p>Proposal ID: <span class="proposal-id">#${proposalId}</span></p>
    </div>
  </div>
</body>
</html>`;

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Aria Admin" <rahulvenkat207@gmail.com>',
        to: ADMIN_EMAIL,
        subject: `[Proposal #${proposalId}] New Custom Agent Request — ${agentName}`,
        html,
    });
}

// ─── Client Confirmation Email ─────────────────────────────────────────────────

export async function sendProposalConfirmationEmail(
    toEmail: string,
    toName: string,
    agentName: string
): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  body { font-family: system-ui, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
  .wrap { max-width: 580px; margin: 40px auto; background: #fff; border-radius: 20px;
          overflow: hidden; box-shadow: 0 4px 24px rgba(99,102,241,0.1); }
  .header { background: linear-gradient(135deg, #6366f1, #a855f7); padding: 40px; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 26px; font-weight: 800; }
  .header p { color: rgba(255,255,255,0.8); margin-top: 8px; font-size: 14px; }
  .body { padding: 36px; }
  .body p { color: #475569; font-size: 15px; line-height: 1.7; }
  .highlight { background: #eef2ff; border-radius: 12px; padding: 20px; border-left: 4px solid #6366f1;
               font-weight: 600; color: #4338ca; margin: 20px 0; }
  .footer { padding: 24px; text-align: center; font-size: 12px; color: #94a3b8;
            border-top: 1px solid #f1f5f9; background: #f8fafc; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>🚀 Request Received!</h1>
      <p>We've got your custom agent proposal</p>
    </div>
    <div class="body">
      <p>Hi <strong>${toName}</strong>,</p>
      <p>Thank you for submitting your request for a custom AI agent. Our team will review your proposal and get back to you shortly.</p>
      <div class="highlight">
        Agent Name: <strong>${agentName}</strong>
      </div>
      <p>You can track the real-time status of your proposal anytime in the <strong>Customization → My Requests</strong> section of your Aria dashboard.</p>
      <p>Our team typically responds within 1–2 business days.</p>
      <p>— The Aria.AI Team</p>
    </div>
    <div class="footer">
      <p>Aria.AI · Intelligent Voice Agent Platform</p>
    </div>
  </div>
</body>
</html>`;

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Aria.AI" <rahulvenkat207@gmail.com>',
        to: toEmail,
        subject: `Your Custom Agent Request Has Been Received — ${agentName}`,
        html,
    });
}
