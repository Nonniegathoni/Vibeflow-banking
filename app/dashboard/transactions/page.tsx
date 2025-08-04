"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSession } from "@/lib/auth"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface Transaction {
  id: number
  user_id: number
  recipient_id: number
  type: string
  amount: number
  description: string
  status: string
  created_at: string
  user_name: string
  user_email: string
  recipient_name: string
  recipient_email: string
}

interface TransactionStats {
  totalTransactions: number
  totalAmount: number
  typeDistribution: { type: string; count: number }[]
  statusDistribution: { status: string; count: number }[]
}

const ITEMS_PER_PAGE = 10

export default function TransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    status: "all",
    dateRange: "all"
  })

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const session = await getSession()
  //     if (!session?.user?.id) {
  //       router.push("/login")
  //     }
  //   }
  //   checkAuth()
  // }, [router])

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/transactions")
        if (!response.ok) {
          throw new Error("Failed to fetch transactions")
        }
        const data = await response.json()
        setTransactions(data)
        
        // Calculate stats
        const stats: TransactionStats = {
          totalTransactions: data.length,
          // totalAmount: data.reduce((sum: number, t: Transaction) => sum + t.amount, 0),
          totalAmount: data.reduce(
            (sum: number, t: Transaction) => sum + Number(t.amount || 0),
            0
          ),

          typeDistribution: Object.entries(
            data.reduce((acc: { [key: string]: number }, t: Transaction) => {
              acc[t.type] = (acc[t.type] || 0) + 1;
              return acc;
            }, {})
          ).map(([type, count]) => ({ type, count: Number(count) })),
          statusDistribution: Object.entries(
            data.reduce((acc: { [key: string]: number }, t: Transaction) => {
              acc[t.status] = (acc[t.status] || 0) + 1;
              return acc;
            }, {})
          ).map(([status, count]) => ({ status, count: Number(count) })),
        };
        setStats(stats)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [])

  useEffect(() => {
    let filtered = [...transactions]

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(t =>
        t.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.user_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.recipient_name?.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Apply type filter
    if (filters.type !== "all") {
      filtered = filtered.filter(t => t.type === filters.type)
    }

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(t => t.status === filters.status)
    }

    // Apply date range filter
    if (filters.dateRange !== "all") {
      const now = new Date()
      const cutoff = new Date()
      switch (filters.dateRange) {
        case "today":
          cutoff.setHours(0, 0, 0, 0)
          break
        case "week":
          cutoff.setDate(now.getDate() - 7)
          break
        case "month":
          cutoff.setMonth(now.getMonth() - 1)
          break
      }
      filtered = filtered.filter(t => new Date(t.created_at) >= cutoff)
    }

    setFilteredTransactions(filtered)
    setCurrentPage(1)
  }, [transactions, filters])

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Button onClick={() => router.push("/dashboard/transactions/new")}>
          New Transaction
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTransactions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalAmount || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Transaction Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.typeDistribution || []}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={40}
                    label
                  >
                    {stats?.typeDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.statusDistribution || []}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={40}
                    label
                  >
                    {stats?.statusDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="withdrawal">Withdraw</SelectItem>
                <SelectItem value="mpesa_withdrawal">Mpesa</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.dateRange}
              onValueChange={(value) =>
                setFilters({ ...filters, dateRange: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>From/To</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.created_at)}</TableCell>
                  <TableCell className="capitalize">
                    {transaction.type}
                  </TableCell>
                  <TableCell
                    className={
                      transaction.user_id === transaction.recipient_id
                        ? ""
                        : transaction.type === "deposit"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {transaction.type === "deposit"
                      ? "+"
                      : (transaction.type === "withdrawal" || transaction.type === "mpesa_withdrawal")
                      ? "-"
                      : ""}
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    {transaction.type === "transfer" ? (
                      <>
                        <div>From: {transaction.user_name}</div>
                        <div>To: {transaction.recipient_name}</div>
                      </>
                    ) : transaction.type === "deposit" ? (
                      "Deposit"
                    ) : (
                      "Withdrawal"
                    )}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        transaction.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : transaction.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-4 gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="mx-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}