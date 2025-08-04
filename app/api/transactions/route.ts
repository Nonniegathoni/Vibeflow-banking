import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { calculateRiskScore } from "@/lib/fraud-detection"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await query(
      `SELECT 
        t.*,
        u.name as user_name,
        u.email as user_email,
        r.name as recipient_name,
        r.email as recipient_email
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN users r ON t.recipient_id = r.id
      WHERE t.user_id = $1 OR t.recipient_id = $1
      ORDER BY t.created_at DESC`,
      [session.user.id]
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      type,
      amount,
      description,
      recipient_id,
      custom_recipient,
      device_info,
      ip_address,
      location
    } = body

    // Calculate risk score
    const riskScore = await calculateRiskScore({
      type,
      amount,
      recipient_id,
      custom_recipient,
      device_info,
      ip_address,
      location
    }, session.user)

    console.log("Calculated risk score:", riskScore) // Debug log

    // Create transaction
    const result = await query(
      `INSERT INTO transactions (
        user_id, recipient_id, type, amount, description, 
        device_info, ip_address, location, risk_score, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        session.user.id,
        recipient_id,
        type,
        amount,
        description,
        device_info,
        ip_address,
        location,
        riskScore,
        riskScore >= 65 ? "pending" : "completed"
      ]
    )

    console.log("Transaction created:", result.rows[0]) // Debug log

    // If risk score is high, create fraud alert
    if (riskScore >= 65) {
      try {
        const alertResult = await query(
          `INSERT INTO fraud_alerts (
            user_id, transaction_id, description, status, risk_score
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING *`,
          [
            session.user.id,
            result.rows[0].id,
            `High risk transaction detected (Type: ${type}, Score: ${riskScore})`,
            "new",
            riskScore,
          ]
        );
        console.log("Fraud alert created:", alertResult.rows[0]) // Debug log
      } catch (alertError) {
        console.error("Error creating fraud alert:", alertError)
        // Don't fail the transaction if alert creation fails
      }
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    )
  }
} 