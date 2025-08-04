"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, PieChart, AreaChart, HorizontalBarChart } from "@/components/ui/chart"
import { getSession } from "@/lib/auth"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { redirect } from "next/navigation"
import { ChartData } from "@/components/ui/chart"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
// @ts-ignore
import autoTable from 'jspdf-autotable'

interface Report {
  id: number
  user_id: number
  subject: string
  message: string
  status: string
  created_at: string
  user_name: string
  user_email: string
}

interface ReportsData {
  reports: Report[]
  total: number
  open: number
  in_progress: number
  resolved: number
  daily_tickets: ChartData[]
  status_distribution: ChartData[]
  subject_distribution: ChartData[]
}

export default function ReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: "all",
    subject: "all",
    dateRange: "all",
    search: ""
  })

  useEffect(() => {
    const checkAuth = async () => {
        const session = await getSession()
        console.log("The session is", session)
      if (!session?.user?.role || session.user.role !== "admin") {
        redirect("/")
      }
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    const fetchReports = async () => {
      try {
          const response = await fetch("/api/admin/reports")
          console.log("The response is", response)
        if (!response.ok) {
          throw new Error("Failed to fetch reports")
        }
          const data = await response.json()
          console.log("The data from response is", data)
        setReports(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  const getFilteredData = () => {
    if (!reports?.reports) return []
    
    return reports.reports.filter(report => {
      // Filter by status
      if (filters.status !== "all" && report.status !== filters.status) {
        return false
      }
      
      // Filter by subject
      if (filters.subject !== "all" && report.subject !== filters.subject) {
        return false
      }
      
      // Filter by date range
      if (filters.dateRange !== "all") {
        const reportDate = new Date(report.created_at)
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
        
        if (reportDate < cutoffDate) {
          return false
        }
      }
      
      // Filter by search term
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        return (
          report.subject.toLowerCase().includes(searchTerm) ||
          report.message.toLowerCase().includes(searchTerm) ||
          report.user_name.toLowerCase().includes(searchTerm) ||
          report.user_email.toLowerCase().includes(searchTerm)
        )
      }
      
      return true
    })
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!reports) {
    return <div>No reports found</div>
  }

  const filteredReports = getFilteredData()

  const exportToExcel = () => {
    const data = filteredReports.map(report => ({
      'ID': report.id,
      'Subject': report.subject,
      'User Name': report.user_name,
      'User Email': report.user_email,
      'Status': report.status,
      'Created At': formatDate(report.created_at),
      'Message': report.message
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Reports')
    XLSX.writeFile(wb, `reports_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Reports Export', 14, 15)
    
    // Add date
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25)
    
    // Add filter information
    doc.setFontSize(12)
    let yPos = 35
    doc.text('Filter Information:', 14, yPos)
    yPos += 7
    doc.text(`Status: ${filters.status}`, 14, yPos)
    yPos += 7
    doc.text(`Subject: ${filters.subject}`, 14, yPos)
    yPos += 7
    doc.text(`Date Range: ${filters.dateRange}`, 14, yPos)
    yPos += 7
    doc.text(`Search Term: ${filters.search || 'None'}`, 14, yPos)
    
    // Add table
    const tableData = filteredReports.map(report => [
      report.id.toString(),
      report.subject,
      report.user_name,
      report.user_email,
      report.status,
      formatDate(report.created_at),
      report.message
    ])
    
    // @ts-ignore
    autoTable(doc, {
      head: [['ID', 'Subject', 'User Name', 'User Email', 'Status', 'Created At', 'Message']],
      body: tableData,
      startY: yPos + 10,
      theme: 'grid',
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 },
        6: { cellWidth: 40 }
      }
    })
    
    doc.save(`reports_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Reports Dashboard</h1>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
          value={filters.subject}
          onValueChange={(value) => setFilters({ ...filters, subject: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {reports.subject_distribution.map((subject) => (
              <SelectItem key={subject.name} value={subject.name}>
                {subject.name}
              </SelectItem>
            ))}
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
          placeholder="Search reports..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reports.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reports.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reports.in_progress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reports.resolved}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Daily Tickets by Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart
              data={reports.daily_tickets}
              dataKey="count"
              nameKey="name"
              onFilter={(value) => setFilters({ ...filters, search: value })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              data={reports.status_distribution}
              dataKey="value"
              nameKey="name"
              onFilter={(value) => setFilters({ ...filters, status: value })}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Reports List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Reports ({filteredReports.length})</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToExcel}>
              Export to Excel
            </Button>
            <Button variant="outline" onClick={exportToPDF}>
              Export to PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{report.subject}</h3>
                    <p className="text-sm text-gray-500">{report.user_name} ({report.user_email})</p>
                    <p className="mt-2">{report.message}</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-block px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                      {report.status}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(report.created_at)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 