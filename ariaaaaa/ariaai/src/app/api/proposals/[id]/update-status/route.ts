import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customAgentProposals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyStatusToken } from "@/lib/proposal-email";

const VALID_STAGES = [
    "accepted",
    "building",
    "testing",
    "deployed",
    "integrated",
    "rejected",
] as const;

type ProposalStage = (typeof VALID_STAGES)[number];

function isValidStage(stage: string): stage is ProposalStage {
    return VALID_STAGES.includes(stage as ProposalStage);
}

const STAGE_LABELS: Record<ProposalStage, string> = {
    accepted: "✅ Proposal Accepted",
    building: "🔨 Building in Progress",
    testing: "🧪 Under Testing",
    deployed: "🚀 Deployed",
    integrated: "🔗 Integrated",
    rejected: "❌ Proposal Rejected",
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: proposalId } = await params;
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get("stage");
    const token = searchParams.get("token");

    // Validate inputs
    if (!stage || !token) {
        return new NextResponse(buildHtml("❌ Invalid Link", "Missing stage or token parameters.", false), {
            status: 400,
            headers: { "Content-Type": "text/html" },
        });
    }

    if (!isValidStage(stage)) {
        return new NextResponse(buildHtml("❌ Invalid Stage", `Unknown stage: "${stage}"`, false), {
            status: 400,
            headers: { "Content-Type": "text/html" },
        });
    }

    // Verify HMAC token
    const isValid = verifyStatusToken(proposalId, stage, token);
    if (!isValid) {
        return new NextResponse(buildHtml("🔒 Unauthorized", "This link is invalid or has been tampered with.", false), {
            status: 401,
            headers: { "Content-Type": "text/html" },
        });
    }

    // Check proposal exists
    const [proposal] = await db
        .select()
        .from(customAgentProposals)
        .where(eq(customAgentProposals.id, proposalId));

    if (!proposal) {
        return new NextResponse(buildHtml("❌ Not Found", `Proposal #${proposalId} does not exist.`, false), {
            status: 404,
            headers: { "Content-Type": "text/html" },
        });
    }

    // Update status in DB
    await db
        .update(customAgentProposals)
        .set({
            status: stage,
            statusUpdatedAt: new Date(),
            updatedAt: new Date(),
        })
        .where(eq(customAgentProposals.id, proposalId));

    const label = STAGE_LABELS[stage];
    return new NextResponse(
        buildHtml(
            label,
            `Proposal <strong>#${proposalId}</strong> for agent "<strong>${proposal.agentName}</strong>" has been updated to <strong>${stage}</strong>. The client will see this change in their dashboard.`,
            true
        ),
        { status: 200, headers: { "Content-Type": "text/html" } }
    );
}

function buildHtml(title: string, message: string, success: boolean): string {
    const color = success ? "#6366f1" : "#ef4444";
    const bg = success ? "#eef2ff" : "#fee2e2";

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} — Aria Admin</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: white; border-radius: 20px; padding: 48px 40px; max-width: 480px; width: 90%;
            box-shadow: 0 4px 30px rgba(0,0,0,0.08); text-align: center; }
    .icon { width: 64px; height: 64px; background: ${bg}; border-radius: 50%;
            display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
            font-size: 28px; }
    h1 { font-size: 22px; font-weight: 800; color: #1e293b; margin-bottom: 12px; }
    p { color: #64748b; font-size: 15px; line-height: 1.7; }
    .badge { display: inline-block; background: ${bg}; color: ${color};
             font-size: 12px; font-weight: 700; padding: 6px 16px; border-radius: 99px;
             text-transform: uppercase; letter-spacing: 0.08em; margin-top: 20px;
             border: 2px solid ${color}20; }
    .footer { margin-top: 32px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? "✅" : "❌"}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="badge">Aria.AI Admin Panel</div>
    <div class="footer">You can close this tab now.</div>
  </div>
</body>
</html>`;
}
