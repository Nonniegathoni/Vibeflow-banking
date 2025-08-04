"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getSession } from "@/lib/auth"
import { formatDate } from "@/lib/utils"
import { redirect } from "next/navigation"

interface Staff {
  id: number
  name: string
  email: string
  role: string
}

interface Ticket {
  id: number
  user_id: number
  subject: string
  message: string
  status: string
  assigned_to: string | null
  resolution_notes: string | null
  created_at: string
  user_name: string
  user_email: string
  staff_name: string | null
}

export default function TicketPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [staff, setStaff] = useState<Staff[]>([])
  const [selectedStaff, setSelectedStaff] = useState("")

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
    const fetchData = async () => {
      try {
        // Fetch ticket
        const ticketResponse = await fetch(`/api/admin/tickets/${params.id}`)
        if (!ticketResponse.ok) {
          throw new Error("Failed to fetch ticket")
        }
        const ticketData = await ticketResponse.json()
        setTicket(ticketData)
        setSelectedStaff(ticketData.assigned_to || "")
        setResolutionNotes(ticketData.resolution_notes || "")

        // Fetch staff
        const staffResponse = await fetch("/api/admin/staff")
        if (!staffResponse.ok) {
          throw new Error("Failed to fetch staff")
        }
        const staffData = await staffResponse.json()
        setStaff(staffData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/tickets/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: newStatus,
          assigned_to: selectedStaff,
          resolution_notes: resolutionNotes
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update ticket status")
      }

      const updatedTicket = await response.json()
      setTicket(updatedTicket)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!ticket) {
    return <div>Ticket not found</div>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ticket #{ticket.id}</h1>
        <Button variant="outline" onClick={() => router.push("/admin/tickets")}>
          Back to Tickets
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Subject</h3>
                <p>{ticket.subject}</p>
              </div>
              <div>
                <h3 className="font-semibold">From</h3>
                <p>{ticket.user_name} ({ticket.user_email})</p>
              </div>
              <div>
                <h3 className="font-semibold">Message</h3>
                <p className="whitespace-pre-wrap">{ticket.message}</p>
              </div>
              <div>
                <h3 className="font-semibold">Created</h3>
                <p>{formatDate(ticket.created_at)}</p>
              </div>
              {ticket.resolution_notes && (
                <div>
                  <h3 className="font-semibold">Resolution Notes</h3>
                  <p className="whitespace-pre-wrap">{ticket.resolution_notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Status</h3>
                <Select
                  value={ticket.status}
                  onValueChange={handleStatusUpdate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Assign To</h3>
                <Select
                  value={selectedStaff}
                  onValueChange={(value) => {
                    setSelectedStaff(value)
                    handleStatusUpdate(ticket.status)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {staff.map((staffMember) => (
                      <SelectItem key={staffMember.id} value={staffMember.id.toString()}>
                        {staffMember.name} ({staffMember.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {ticket.staff_name && (
                  <p className="text-sm text-gray-500 mt-1">
                    Currently assigned to: {ticket.staff_name}
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Resolution Notes</h3>
                <Textarea
                  placeholder="Add resolution notes..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  onBlur={() => handleStatusUpdate(ticket.status)}
                  className="min-h-[100px]"
                />
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  handleStatusUpdate("resolved")
                }}
                disabled={ticket.status === "resolved"}
              >
                Mark as Resolved
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 