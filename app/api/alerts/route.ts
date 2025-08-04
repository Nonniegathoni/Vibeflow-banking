import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin, getSession } from "@/lib/auth";


export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await query(
      `
      SELECT 
        fa.*, 
        u.name AS user_name,
        t.reference AS transaction_reference,
        t.amount AS transaction_amount
      FROM fraud_alerts fa
      LEFT JOIN transactions t ON fa.transaction_id = t.id
      LEFT JOIN users u ON fa.user_id = u.id
      WHERE fa.user_id = $1 AND fa.status = 'new'
      ORDER BY fa.created_at DESC
      `,
      [session.user.id]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching fraud alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch fraud alerts" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE fraud_alerts 
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Fraud alert not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating fraud alert:", error);
    return NextResponse.json(
      { error: "Failed to update fraud alert" },
      { status: 500 }
    );
  }
}
