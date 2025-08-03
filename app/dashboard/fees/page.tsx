"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Search,
  CreditCard,
} from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  useGetMemberships,
  useGetMembershipStats,
} from "@/hooks/use-membership";
import { format, differenceInDays, isAfter } from "date-fns";
import QuickPaymentModal from "@/components/payment/quick-payment-modal"; // You'll need to create this file
import { formatDate } from "@/utils/format-date";
import formatCurrency from "@/utils/format-currency";
import { CardSkeleton } from "@/components/ui/loading";

const getStatusBadge = (status: string) => {
  const statusConfig = {
    active: { variant: "default", label: "Active" },
    expired: { variant: "destructive", label: "Expired" },
    pending: { variant: "secondary", label: "Pending" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    variant: "outline",
    label: status,
  };

  return (
    <Badge variant={config.variant as any}>
      <span className="mt-0.5">{config.label}</span>
    </Badge>
  );
};

const getHowManyDaysDelayed = (endDate: string) => {
  return differenceInDays(new Date(), new Date(endDate));
};

export default function FeesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedMembership, setSelectedMembership] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const limit = 10;

  const {
    data: membershipsData,
    isLoading,
    refetch,
  } = useGetMemberships({
    page,
    limit,
    search: searchQuery,
    status: statusFilter,
  });

  const { data: membershipStats, isLoading: statsLoading } =
    useGetMembershipStats();

  const total = membershipsData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const memberships = membershipsData?.memberships || [];

  const handlePayClick = (membership: any) => {
    console.log("membership", membership);

    setSelectedMembership(membership);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    refetch(); // Refresh the data after successful payment
  };

  const hasOutstandingBalance = (membership: any) => {
    return membership.amount > membership.amountPaid;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Fee Management</h2>
        <p className="text-muted-foreground">
          Track and manage member fees and payments
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <CardSkeleton />
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Collected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(membershipStats?.totalCollected)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(membershipStats?.pending?.total)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {membershipStats?.pending?.count} payments pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Overdue Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(membershipStats?.overdue?.total)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {membershipStats?.overdue?.count} payments overdue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  New Admissions (MTD)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(membershipStats?.newAdmissions?.total)}
                </div>
                <p className="text-xs text-muted-foreground">
                  From {membershipStats?.newAdmissions?.count} new members
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
          <CardDescription>
            View and manage all fee records and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by member or plan..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
                  <TableHead>Member</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : memberships.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No memberships found
                    </TableCell>
                  </TableRow>
                ) : (
                  memberships.map((membership: any) => (
                    <TableRow key={membership.id}>
                      <TableCell>
                        <div className="font-medium">
                          {membership.memberDetails.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {membership.memberDetails.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        {membership.membershipTypeDetails.name}
                      </TableCell>
                      <TableCell>{formatDate(membership.startDate)}</TableCell>
                      <TableCell>{formatDate(membership.endDate)}</TableCell>
                      <TableCell className="capitalize">
                        {formatCurrency(membership.amount)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(membership.amountPaid)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            hasOutstandingBalance(membership)
                              ? "text-red-600 font-medium"
                              : "text-green-600"
                          }
                        >
                          {formatCurrency(
                            membership.amount - membership.amountPaid
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(membership.status)}
                        {membership.status === "expired" && (
                          <div className="text-xs text-rose-500 mt-1">
                            {getHowManyDaysDelayed(membership.endDate)} days
                            delayed
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {hasOutstandingBalance(membership) ? (
                          <Button
                            size="sm"
                            onClick={() => handlePayClick(membership)}
                            className="gap-1"
                          >
                            <CreditCard className="h-3 w-3" />
                            Pay
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-green-600">
                            Paid
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{memberships.length}</strong> of{" "}
            <strong>{total}</strong> records
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
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
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Quick Payment Modal */}
      {selectedMembership && (
        <QuickPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedMembership(null);
          }}
          membership={selectedMembership}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
