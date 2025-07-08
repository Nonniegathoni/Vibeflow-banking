import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    await requireAdmin()

    const result = await query(`
      SELECT 
        cs.id,
        cs.user_id,
        cs.subject,
        cs.message,
        cs.status,
        cs.assigned_to,
        cs.created_at,
        u.name as user_name,
        u.email as user_email,
        s.name as staff_name
      FROM customer_support cs
      JOIN users u ON cs.user_id = u.id
      LEFT JOIN users s ON cs.assigned_to::integer = s.id
      ORDER BY cs.created_at DESC
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin()

    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const result = await query(
      `
      UPDATE customer_support
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error updating ticket:", error)
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    )
  }
} 