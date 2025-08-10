"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  PlusCircle,
  Search,
  XCircle,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { useGetPayments } from "@/hooks/use-payment";
import { useRouter } from "next/navigation";
import { PAYMENT_TYPES } from "@/constants/payment";
import {
  printMembershipReceipt,
  type MembershipData,
  type PaymentData,
} from "@/utils/print/print-payment-receipt";

interface PopulatedMember {
  _id: string;
  name: string;
  email: string;
}

interface PopulatedMembershipType {
  _id: string;
  name: string;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return format(date, "dd-MM-yyyy");
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "paid":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
        >
          <CheckCircle2 className="mr-1 h-3 w-3" /> Paid
        </Badge>
      );
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
        >
          Pending
        </Badge>
      );
    case "partially-paid":
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
        >
          Partially Paid
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const formatPaymentType = (paymentType: string) => {
  switch (paymentType) {
    case PAYMENT_TYPES.MEMBERSHIP:
      return "Membership";
    case PAYMENT_TYPES.PRODUCT:
      return "Product";
    case PAYMENT_TYPES.SERVICE:
      return "Service";
    case PAYMENT_TYPES.OTHER:
      return "Other";
    default:
      return paymentType;
  }
};

const formatTransactionType = (transactionType: string) => {
  switch (transactionType) {
    case "debit":
      return (
        <Badge
          variant="outline"
          className="bg-red-500/10 text-red-500 hover:bg-red-500/20"
        >
          Debit
        </Badge>
      );
    case "credit":
      return (
        <Badge
          variant="outline"
          className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
        >
          Credit
        </Badge>
      );
    default:
      return transactionType;
  }
};

export default function PaymentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [printingId, setPrintingId] = useState<string | null>(null);
  const limit = 10;

  const { data: paymentsData, isLoading: paymentsLoading } = useGetPayments({
    page,
    limit,
    search: searchQuery,
  });

  const total = paymentsData?.total || 0;
  const totalPages = Math.ceil(total / limit);
  const payments = paymentsData?.payments || [];

  const handlePrint = async (payment: any) => {
    if (payment.paymentType !== PAYMENT_TYPES.MEMBERSHIP) {
      toast.info("Printing is only available for membership payments.");
      return;
    }

    setPrintingId(payment._id);
    try {
      const paymentData: PaymentData = {
        amount: payment.amount,
        method: payment.paymentMethod,
        notes: payment.notes || "",
      };

      const membershipData: MembershipData = {
        _id: payment.membership?._id || "",
        memberDetails: {
          memberId: payment.member?.memberId || "",
          name: payment.member?.name || "",
          phone: payment.member?.phone || "",
        },
        membershipTypeDetails: {
          name: payment.membershipId?.membershipType?.name || "",
        },
        amount: payment.amount || 0,
        amountPaid: payment.amount || 0,
        startDate: payment.membershipId?.startDate || "",
        endDate: payment.membershipId?.endDate || "",
      };

      const printResult = await printMembershipReceipt(
        paymentData,
        membershipData
      );

      if (printResult.success) {
        const method =
          printResult.method === "thermal"
            ? "thermal printer"
            : "browser print";
        toast.success(`Receipt printed successfully via ${method}!`);
      } else {
        toast.error(`Printing failed: ${printResult.error}`);
      }
    } catch (error: any) {
      toast.error(`Printing failed: ${error.message}`);
    } finally {
      setPrintingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
          <p className="text-muted-foreground">
            Manage payments and transactions for your gym
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/payments/new">
            <PlusCircle className="h-4 w-4 mr-2" /> Record Payment
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            View and manage all payment transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search payments..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partially-paid">Partially Paid</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Payment Type</TableHead>
                  <TableHead>Transaction Type</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment: any) => (
                  <TableRow key={payment._id}>
                    <TableCell className="font-medium">
                      {payment.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      <div>{formatPaymentType(payment.paymentType)}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {formatTransactionType(payment.transactionType)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(payment.createdAt)}
                    </TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell className="hidden md:table-cell capitalize">
                      {payment.paymentMethod}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      {payment.paymentType === PAYMENT_TYPES.MEMBERSHIP && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePrint(payment)}
                          disabled={
                            paymentsLoading || printingId === payment._id
                          }
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{payments.length}</strong> of{" "}
            <strong>{total}</strong> payments
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1 || paymentsLoading}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="px-4">
              {page}
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page === totalPages || paymentsLoading}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
