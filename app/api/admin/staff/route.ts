import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"


export async function GET() {
  try {
    await requireAdmin()

    const result = await query(`
      SELECT 
        id,
        name,
        email,
        role
      FROM users
      WHERE role IN ('admin', 'staff', 'agent')
      ORDER BY name ASC
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching staff:", error)
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    )
  }
} 