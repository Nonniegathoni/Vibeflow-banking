"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSession } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FraudAlert {
  id: number;
  user_id: number;
  transaction_id: number;
  description: string;
  status: string;
  risk_score: number;
  resolution: string | null;
  created_at: string;
  user_name: string;
  transaction_reference: string;
  transaction_amount: number;
}

const ITEMS_PER_PAGE = 10;

export default function AdminAlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getSession();
        // if (!session) {
        //   router.push("/login");
        //   return;
        // }

        // if (session?.user.role !== "admin") {
        //   router.push("/dashboard");
        //   return;
        // }

        fetchAlerts();
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  const fetchAlerts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/alerts");
      if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.status}`);
      }
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch alerts"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = searchQuery
      ? alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.transaction_reference
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter !== "all" ? alert.status === statusFilter : true;
    const matchesRisk =
      riskFilter !== "all"
        ? riskFilter === "high"
          ? alert.risk_score >= 80
          : riskFilter === "medium"
          ? alert.risk_score >= 50 && alert.risk_score < 80
          : alert.risk_score < 50
        : true;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const totalPages = Math.ceil(filteredAlerts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentAlerts = filteredAlerts.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleStatusChange = async (alertId: number, newStatus: string) => {
    try {
      let resolution = null;
      if (newStatus === "resolved") {
        resolution = prompt("Please enter resolution notes:");
        if (!resolution) {
          return; // User cancelled
        }
      }

      const response = await fetch(`/api/admin/alerts/${alertId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus, resolution }),
      });

      if (!response.ok) {
        throw new Error("Failed to update alert status");
      }

      // Refresh alerts
      fetchAlerts();
    } catch (error) {
      console.error("Error updating alert status:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update alert status"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p>Loading alerts...</p>
        </div>
      </div>
    );
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
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Fraud Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-4 flex-wrap">
              <Input
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="high">High Risk (≥80%)</SelectItem>
                  <SelectItem value="medium">Medium Risk (50-79%)</SelectItem>
                  <SelectItem value="low">Low Risk (&lt;50%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No alerts found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Date</TableHead>
                    {/* <TableHead>Actions</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>{alert.description}</TableCell>
                      <TableCell>{alert.user_name}</TableCell>
                      <TableCell>{alert.transaction_reference}</TableCell>
                      <TableCell>
                        {formatCurrency(alert.transaction_amount)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            alert.status === "resolved"
                              ? "bg-green-100 text-green-800"
                              : alert.status === "reviewing"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {alert.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            alert.risk_score >= 80
                              ? "bg-red-100 text-red-800"
                              : alert.risk_score >= 50
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {alert.risk_score}%
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(alert.created_at)}</TableCell>
                      {/* <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/admin/transactions/${alert.transaction_id}`
                              )
                            }
                          >
                            View
                          </Button>
                          {alert.status !== "resolved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStatusChange(alert.id, "resolved")
                              }
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredAlerts.length)} of{" "}
                  {filteredAlerts.length} alerts
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
