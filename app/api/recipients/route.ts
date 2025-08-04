import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get all users except the current user
    const result = await query(`
      SELECT 
        id,
        name,
        email,
        balance
      FROM users
      WHERE id != $1
      ORDER BY name ASC
    `, [session.user.id])

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching recipients:", error)
    return NextResponse.json(
      { error: "Failed to fetch recipients" },
      { status: 500 }
    )
  }
} 