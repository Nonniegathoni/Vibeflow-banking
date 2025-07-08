import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

interface Subject {
  subject: string
  count: number
}

interface StatusCount {
  status: string
  count: number
}

interface DailyTicket {
  date: string
  count: number
}

interface Report {
  id: number
  user_id: number
  subject: string
  message: string
  status: string
  assigned_to: number | null
  created_at: string
  updated_at: string
  user_name: string | null
  user_email: string | null
}

export async function GET() {
  try {
    await requireAdmin()

    // Get total tickets count
    const totalTickets = await query(
      "SELECT COUNT(*) as count FROM customer_support"
    )
    console.log("Total tickets query result:", totalTickets)
    const totalCount = totalTickets?.rows?.[0]?.count || 0
    console.log("Total count:", totalCount)

    // Get tickets by status
    const statusCountsResult = await query(
      "SELECT status, COUNT(*) as count FROM customer_support GROUP BY status"
    )
    console.log("Status counts query result:", statusCountsResult)
    const statusCounts = Array.isArray(statusCountsResult?.rows) ? statusCountsResult.rows : []
    console.log("Status counts array:", statusCounts)

    // Get average resolution time using updated_at
    const avgResolutionTime = await query(
      "SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_time FROM customer_support WHERE status = 'resolved'"
    )
    console.log("Average resolution time query result:", avgResolutionTime)
    const avgTime = avgResolutionTime?.rows?.[0]?.avg_time || 0
    console.log("Average time:", avgTime)

    // Get subjects with their counts
    const subjectsResult = await query(
      "SELECT subject, COUNT(*) as count FROM customer_support GROUP BY subject"
    )
    console.log("Subjects query result:", subjectsResult)
    const subjects = Array.isArray(subjectsResult?.rows) ? subjectsResult.rows : []
    console.log("Subjects array:", subjects)

    // Get daily ticket counts for last 30 days by assigned agents
    const dailyTicketsResult = await query(
      `SELECT 
        DATE(cs.created_at) as date,
        u.name as agent_name,
        COUNT(*) as count
      FROM customer_support cs
      LEFT JOIN users u ON cs.assigned_to = u.id
      WHERE cs.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(cs.created_at), u.name
      ORDER BY date, agent_name`
    )
    console.log("Daily tickets query result:", dailyTicketsResult)
    const dailyTickets = Array.isArray(dailyTicketsResult?.rows) ? dailyTicketsResult.rows : []
    console.log("Daily tickets array:", dailyTickets)

    // Get all reports with user info
    const reportsResult = await query(
      `SELECT 
        cs.*,
        u.name as user_name,
        u.email as user_email
      FROM customer_support cs
      LEFT JOIN users u ON cs.user_id = u.id
      ORDER BY cs.created_at DESC`
    )
    console.log("Reports query result:", reportsResult)
    const reports = Array.isArray(reportsResult?.rows) ? reportsResult.rows : []
    console.log("Reports array:", reports)

    // Format status distribution for chart
    const status_distribution = statusCounts.map((item: StatusCount) => ({
      name: item.status,
      value: parseInt(item.count.toString())
    }))
    console.log("Status distribution:", status_distribution)

    // Format subject distribution for chart
    const subject_distribution = subjects.map((item: Subject) => ({
      name: item.subject,
      value: parseInt(item.count.toString())
    }))
    console.log("Subject distribution:", subject_distribution)

    // Format daily tickets for chart
    const daily_tickets = dailyTickets.map((item: any) => ({
      name: item.agent_name || 'Unassigned',
      date: item.date,
      count: parseInt(item.count.toString()),
      value: parseInt(item.count.toString())
    }))
    console.log("Daily tickets formatted:", daily_tickets)

    const response = {
      reports,
      total: totalCount,
      open: statusCounts.find((s: StatusCount) => s.status === 'open')?.count || 0,
      in_progress: statusCounts.find((s: StatusCount) => s.status === 'in_progress')?.count || 0,
      resolved: statusCounts.find((s: StatusCount) => s.status === 'resolved')?.count || 0,
      avgResolutionTime: avgTime,
      daily_tickets,
      status_distribution,
      subject_distribution
    }
    console.log("Final response:", response)

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch reports" }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
} 