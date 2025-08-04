"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSession } from "@/lib/auth"
import { formatDate } from "@/lib/utils"
import { redirect } from "next/navigation"

interface Ticket {
  id: number
  user_id: number
  subject: string
  message: string
  status: string
  assigned_to: string | null
  created_at: string
  user_name: string
  user_email: string
  staff_name: string | null
}

interface Filters {
  status: string
  search: string
  dateRange: string
}

export default function AdminTicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    search: "",
    dateRange: "all"
  })

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession()
      if (!session?.user?.role || session.user.role !== "admin") {
        redirect("/")
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch("/api/admin/tickets")
        if (!response.ok) {
          throw new Error("Failed to fetch tickets")
        }
        const data = await response.json()
        setTickets(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    fetchTickets()
  }, [])

  const getFilteredData = () => {
    return tickets.filter(ticket => {
      // Filter by status
      if (filters.status !== "all" && ticket.status !== filters.status) {
        return false
      }
      
      // Filter by date range
      if (filters.dateRange !== "all") {
        const ticketDate = new Date(ticket.created_at)
        const now = new Date()
        let cutoffDate = new Date()
        
        switch (filters.dateRange) {
          case "7d":
            cutoffDate.setDate(now.getDate() - 7)
            break
          case "14d":
            cutoffDate.setDate(now.getDate() - 14)
            break
          case "30d":
            cutoffDate.setDate(now.getDate() - 30)
            break
        }
        
        if (ticketDate < cutoffDate) {
          return false
        }
      }
      
      // Filter by search term
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        return (
          ticket.subject.toLowerCase().includes(searchTerm) ||
          ticket.message.toLowerCase().includes(searchTerm) ||
          ticket.user_name.toLowerCase().includes(searchTerm) ||
          ticket.user_email.toLowerCase().includes(searchTerm)
        )
      }
      
      return true
    })
  }

  const handleStatusUpdate = async (ticketId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update ticket status")
      }

      // Update the local state
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const filteredTickets = getFilteredData()

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Support Tickets</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filters.dateRange}
          onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="14d">Last 14 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
        
        <Input
          placeholder="Search tickets..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{ticket.subject}</h3>
                      <p className="text-sm text-gray-500">
                        From: {ticket.user_name} ({ticket.user_email})
                      </p>
                      <p className="mt-2">{ticket.message}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Created: {formatDate(ticket.created_at)}
                      </p>
                      {ticket.assigned_to && (
                        <p className="text-sm text-gray-500">
                          Assigned to: {ticket.staff_name || "Unassigned"}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Select
                        value={ticket.status}
                        onValueChange={(value) => handleStatusUpdate(ticket.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 