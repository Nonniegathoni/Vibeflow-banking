"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSession } from "@/lib/auth"
import { formatCurrency } from "@/lib/utils"
import { useSearchParams } from 'next/navigation';
interface Recipient {
  id: number
  name: string
  email: string
  balance: number
}

export default function NewTransactionPage() {
  const router = useRouter()
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "";

  const [formData, setFormData] = useState({
    recipient_id: "",
    custom_recipient: "",
    amount: "",
    description: "",
    type: "transfer",
    location: ""
  })

    const fetchUserData = async () => {
      try {
        // const response = await fetch("/api/auth/me")
        const response = await fetch("/api/auth/me", {
          credentials: "include", // <-- this is the key!
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
         if (!data) {
           router.push("/login");
         }
        // setUser(data.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
  };
  
    useEffect(() => {
      fetchUserData();
    }, [router]);

    useEffect(() => {
    setFormData((prev) => ({ ...prev, type: initialType }));
  }, [initialType]);

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const response = await fetch("/api/recipients")
        if (!response.ok) {
          throw new Error("Failed to fetch recipients")
        }
        const data = await response.json()
        setRecipients(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    fetchRecipients()
  }, [])

  // Auto-capture device info and IP
  useEffect(() => {
    const captureDeviceInfo = () => {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height
      }
      return JSON.stringify(deviceInfo)
    }

    const getIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        return data.ip
      } catch (error) {
        console.error('Error fetching IP:', error)
        return null
      }
    }

    const initializeFraudFields = async () => {
      const deviceInfo = captureDeviceInfo()
      const ipAddress = await getIP()
      
      setFormData(prev => ({
        ...prev,
        device_info: deviceInfo,
        ip_address: ipAddress
      }))
    }

    initializeFraudFields()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          // If using custom recipient, set recipient_id to null
          recipient_id: formData.type === "transfer" ? (formData.recipient_id || null) : null,
          custom_recipient: formData.type === "transfer" ? formData.custom_recipient : null
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create transaction")
      }

      router.push("/dashboard/transactions")
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

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">New Transaction</h1>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/transactions")}
        >
          Back to Transactions
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Transaction Type
              </label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdraw</SelectItem>
                  <SelectItem value="mpesa_withdrawal">Mpesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === "transfer" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Recipient
                  </label>
                  <Select
                    value={formData.recipient_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, recipient_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipients.map((recipient) => (
                        <SelectItem
                          key={recipient.id}
                          value={recipient.id.toString()}
                        >
                          {recipient.name} ({recipient.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Or Enter Custom Recipient
                  </label>
                  <Input
                    placeholder="Enter recipient name or email"
                    value={formData.custom_recipient}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        custom_recipient: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                placeholder="Enter description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <Input
                placeholder="Enter location (e.g., New York, USA)"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>

            <div className="text-sm text-gray-500">
              <p>
                Device Info: {/* @ts-ignore */}
                {formData.device_info ? "Captured" : "Not available"}
              </p>
              {/* @ts-ignore */}
              <p>IP Address: {formData.ip_address || "Not available"}</p>
            </div>

            <Button type="submit" className="w-full">
              Create Transaction
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
