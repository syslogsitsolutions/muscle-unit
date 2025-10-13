"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, UserPlus, TrendingUp, Users, Activity } from "lucide-react";
import { formatDate } from "@/utils/format-date";
import { useGetMembersByJoinDate } from "@/hooks/use-member";
import { cn } from "@/lib/utils";

interface NewMembersSectionProps {
  filters: {
    timeRange: string;
    membershipType: string;
    status: string;
    startDate: string;
    endDate: string;
  };
}

export function NewMembersSection({ filters }: NewMembersSectionProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useGetMembersByJoinDate({
    timeRange: filters.timeRange,
    membershipType: filters.membershipType,
    status: filters.status,
    startDate: filters.startDate,
    endDate: filters.endDate,
    page,
    limit,
  });

  const members = data?.members || [];
  const stats = data?.stats || {
    totalNewMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
  };
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
      case "inactive":
        return "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getTimeRangeLabel = (timeRange: string) => {
    const labels: Record<string, string> = {
      day: "Today",
      week: "This Week",
      month: "This Month",
      lastMonth: "Last Month",
      quarter: "This Quarter",
      year: "This Year",
      custom: "Custom Range",
    };
    return labels[timeRange] || "This Week";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      {/* <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Members ({getTimeRangeLabel(filters.timeRange)})
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNewMembers}</div>
            <p className="text-xs text-muted-foreground">
              Total joined in period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {stats.activeMembers}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalNewMembers > 0
                ? ((stats.activeMembers / stats.totalNewMembers) * 100).toFixed(1)
                : 0}
              % activation rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inactive Members
            </CardTitle>
            <Users className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {stats.inactiveMembers}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalNewMembers > 0
                ? ((stats.inactiveMembers / stats.totalNewMembers) * 100).toFixed(1)
                : 0}
              % of new members
            </p>
          </CardContent>
        </Card>
      </div> */}

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Members Who Joined</CardTitle>
          <CardDescription>
            List of members who joined during {getTimeRangeLabel(filters.timeRange).toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Member ID</TableHead>
                  <TableHead>Membership Type</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <UserPlus className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No new members found for this period
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member: any) => (
                    <TableRow
                      key={member._id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/dashboard/members/${member._id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={member.profileImage}
                              alt={member.name}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {member.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          #{member.memberId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {member.membershipId?.membershipType?.name || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                          {formatDate(member.joiningDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(getStatusColor(member.status))}
                        >
                          {member.status.charAt(0).toUpperCase() +
                            member.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{member.phone}</div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {members.length > 0 && (
          <CardFooter className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing <strong>{members.length}</strong> of <strong>{total}</strong>{" "}
              new members
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
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

