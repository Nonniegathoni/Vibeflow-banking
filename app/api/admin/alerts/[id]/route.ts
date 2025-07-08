import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { insertAuditLog } from "@/lib/audit";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("host") ||
      null;

    const { status, resolution } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE fraud_alerts
       SET status = $1::text,
           resolution = $2::text,
           resolved_at = CASE
             WHEN $1::text = 'resolved' THEN CURRENT_TIMESTAMP
             ELSE resolved_at
           END
       WHERE id = $3::integer
       RETURNING *`,
      [status, resolution || null, params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Fraud alert not found" },
        { status: 404 }
      );
    }

    if (status === "resolved") {
      await query(
        `UPDATE transactions
         SET status = 'completed'::text
         WHERE id = $1::integer`,
        [result.rows[0].transaction_id]
      );
    }

    // 🔍 Add audit log
    // await insertAuditLog({
    //   //@ts-ignore
    //   userId: admin.user.id,
    //   action: "update",
    //   entityId: parseInt(params.id),
    //   details: `Updated fraud alert to status "${status}" with resolution: "${
    //     resolution || "N/A"
    //   }"`,
    //   ipAddress: ipAddress || undefined,
    // });
      await insertAuditLog({
        request, // <-- pass the full Request object here
        // @ts-ignore
        userId: admin.user.id,
        action: "update",
        //@ts-ignore
        entityId: admin.user.id,
        details: `Updated fraud alert to status "${status}" with resolution: "${
          resolution || "N/A"
        }"`,
      });


    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating fraud alert:", error);
    return NextResponse.json(
      { error: "Failed to update fraud alert" },
      { status: 500 }
    );
  }
}
