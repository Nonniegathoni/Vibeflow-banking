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

interface AuditLog {
  id: number;
  user_id: number;
  transaction_id: number;
  description: string;
  status: string;
  risk_score: number;
  resolution: string | null;
  created_at: string;
  user_name: string;
  details: string;
  action: string;
  ip_address: string;
  transaction_reference: string;
  transaction_amount: number;
}

const ITEMS_PER_PAGE = 10;

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
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
        if (!session) {
          router.push("/login");
          return;
        }

        if (session.user.role !== "admin") {
          router.push("/dashboard");
          return;
        }

        fetchAuditLogs();
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/security");
      if (!response.ok) {
        throw new Error(`Failed to fetch audit logs: ${response.status}`);
      }
      const data = await response.json();
      setAuditLogs(data);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch audit logs"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = searchQuery
      ? log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.transaction_reference
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter !== "all" ? log.status === statusFilter : true;

    const matchesRisk =
      riskFilter !== "all"
        ? riskFilter === "high"
          ? log.risk_score >= 80
          : riskFilter === "medium"
          ? log.risk_score >= 50 && log.risk_score < 80
          : log.risk_score < 50
        : true;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p>Loading audit logs...</p>
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
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
       

          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No audit logs found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
            
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.created_at)}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.details}</TableCell>
                    
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            log.risk_score >= 80
                              ? "bg-red-100 text-red-800"
                              : log.risk_score >= 50
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {log.ip_address}
                        </span>
                      </TableCell>
                     
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredLogs.length)} of{" "}
                  {filteredLogs.length} logs
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
