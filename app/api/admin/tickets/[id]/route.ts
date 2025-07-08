import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const result = await query(
      `
      SELECT 
        t.*,
        u.name as user_name,
        u.email as user_email,
        s.name as staff_name
      FROM customer_support t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN users s ON t.assigned_to::integer = s.id
      WHERE t.id = $1
      `,
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching ticket:", error)
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const { status, assigned_to, resolution_notes } = await request.json()

    if (!status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const result = await query(
      `
      UPDATE customer_support
      SET 
        status = $1,
        assigned_to = $2,
        resolution_notes = $3,
        updated_at = NOW()
      WHERE id = $4
      RETURNING *
      `,
      [status, assigned_to, resolution_notes, params.id]
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