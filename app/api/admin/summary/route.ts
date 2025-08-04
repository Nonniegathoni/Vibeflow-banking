import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    // Check if user is admin
    await requireAdmin()

    // Get total users count
    const usersResult = await query("SELECT COUNT(*) as count FROM users")
    const totalUsers = usersResult.rows[0].count

    // Get total transactions count
    const transactionsResult = await query("SELECT COUNT(*) as count FROM transactions")
    const totalTransactions = transactionsResult.rows[0].count

    // Get fraud alerts count
    const fraudAlertsResult = await query("SELECT COUNT(*) as count FROM fraud_alerts WHERE status = 'new'")
    const fraudAlerts = fraudAlertsResult.rows[0].count

    // Get support tickets count
    const supportTicketsResult = await query("SELECT COUNT(*) as count FROM customer_support WHERE status = 'open'")
    const supportTickets = supportTicketsResult.rows[0].count

    // Get recent users
    const recentUsersResult = await query(
      "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5"
    )
    interface RecentUser {
      id: string;
      name: string;
      email: string;
      date: string;
    }

    const recentUsers: RecentUser[] = recentUsersResult.rows.map((user: { id: string; name: string; email: string; created_at: string }) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      date: new Date(user.created_at).toISOString().split('T')[0]
    }));

    return NextResponse.json({
      totalUsers,
      totalTransactions,
      fraudAlerts,
      supportTickets,
      recentUsers
    })
  } catch (error) {
    console.error("Admin summary error:", error)
    return NextResponse.json({ message: "Error fetching admin summary" }, { status: 500 })
  }
} 