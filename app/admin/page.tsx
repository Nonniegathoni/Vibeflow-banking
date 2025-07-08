import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, AlertTriangle, MessageSquare, UserPlus } from "lucide-react"
import { query } from "@/lib/db"

interface AdminSummary {
  totalUsers: number
  totalTransactions: number
  fraudAlerts: number
  supportTickets: number
  recentUsers: Array<{
    id: number
    name: string
    email: string
    date: string
  }>
}

interface RecentUser {
  id: number
  name: string
  email: string
  date: string
}

interface CountResult {
  count: number
}

interface UserResult {
  id: number
  name: string
  email: string
  date: string
}

async function getAdminSummary() {
  try {
    // Get total users count
    const usersResult = await query('SELECT COUNT(*) as count FROM users')
    const totalUsers = (usersResult.rows[0] as CountResult).count

    // Get total transactions count
    const transactionsResult = await query('SELECT COUNT(*) as count FROM transactions')
    const totalTransactions = (transactionsResult.rows[0] as CountResult).count

    // Get fraud alerts count
    const fraudAlertsResult = await query('SELECT COUNT(*) as count FROM fraud_alerts')
    const fraudAlerts = (fraudAlertsResult.rows[0] as CountResult).count

    // Get support tickets count
    const supportTicketsResult = await query('SELECT COUNT(*) as count FROM customer_support')
    const supportTickets = (supportTicketsResult.rows[0] as CountResult).count

    // Get recent users
    const recentUsersResult = await query(`
      SELECT id, name, email, created_at as date 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `)
    const recentUsers = recentUsersResult.rows.map((user: unknown) => {
      const typedUser = user as UserResult
      return {
        ...typedUser,
        date: new Date(typedUser.date).toLocaleDateString()
      }
    })

    return {
      totalUsers,
      totalTransactions,
      fraudAlerts,
      supportTickets,
      recentUsers
    }
  } catch (error) {
    console.error('Error fetching admin summary:', error)
    throw new Error('Failed to fetch admin summary')
  }
}

export default async function AdminDashboard() {
  const session = await getSession()
  
  if (!session?.user?.role || session.user.role !== 'admin') {
    redirect('/dashboard')
  }

  const summary = await getAdminSummary()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalTransactions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.fraudAlerts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.supportTickets}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.recentUsers.map((user: RecentUser) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <UserPlus className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">{user.date}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}