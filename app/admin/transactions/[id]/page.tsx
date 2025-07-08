"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/auth"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"

interface Transaction {
  id: number
  user_id: number
  recipient_id: number
  type: string
  amount: number
  description: string
  reference: string
  status: string
  reported: boolean
  risk_score: number
  created_at: string
  user_name: string
  recipient_name: string
}

export default function TransactionProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getSession()
        if (!session) {
          router.push("/login")
          return
        }
        
        if (session.user.role !== "admin") {
          router.push("/dashboard")
          return
        }
        
        fetchTransaction()
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      }
    }
    
    checkAuth()
  }, [router, params.id])

  const fetchTransaction = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/transactions/${params.id}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch transaction: ${response.status}`)
      }
      const data = await response.json()
      setTransaction(data)
    } catch (error) {
      console.error("Error fetching transaction:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch transaction")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p>Loading transaction details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">The requested transaction could not be found.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => router.push("/admin/transactions")}
            >
              Back to Transactions
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push("/admin/transactions")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Transactions
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Reference</h3>
                <p className="mt-1">{transaction.reference}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Type</h3>
                <p className="mt-1 capitalize">{transaction.type}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                <p className="mt-1">{formatCurrency(transaction.amount)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1">
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
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Risk Score</h3>
                <p className="mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      transaction.risk_score >= 80
                        ? "bg-red-100 text-red-800"
                        : transaction.risk_score >= 50
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {transaction.risk_score}%
                  </span>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="mt-1">{formatDate(transaction.created_at)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">From</h3>
                <p className="mt-1">{transaction.user_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">To</h3>
                <p className="mt-1">{transaction.recipient_name || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1">{transaction.description || "No description provided"}</p>
          </div>

          <div className="mt-6 flex gap-4">
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Implement mark as suspicious
              }}
            >
              Mark as Suspicious
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Implement block transaction
              }}
            >
              Block Transaction
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 