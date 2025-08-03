"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
  PlusCircle,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { cn } from "@/lib/utils";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { toast } from "sonner";
import { useMembers } from "@/hooks/use-member";
import { formatDate } from "@/utils/format-date";
import { TableSkeleton } from "@/components/ui/loading";

export default function MembersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: membersData, isLoading: membersLoading } = useMembers({
    page,
    limit,
    search: searchQuery,
  });
  console.log("membersData", membersLoading);

  const total = membersData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const members = membersData?.members || [];

  const handleDelete = async () => {
    if (!selectedMember) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Member deleted successfully");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete member");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
      case "inactive":
        return "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20";
      case "frozen":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Members</h2>
          <p className="text-muted-foreground">
            Manage your gym members and their memberships
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/members/new">
            <PlusCircle className="h-4 w-4 mr-2" /> Add New Member
          </Link>
        </Button>
      </div>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            View and manage all your gym members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search members..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Member ID
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Membership
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Joining Date
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Expires
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members?.map((member: any) => (
                  <TableRow key={member._id}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {member.phone}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {member.memberId}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {member.membershipId.membershipType.name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant="outline"
                        className={cn(getStatusColor(member.status))}
                      >
                        {member.status.charAt(0).toUpperCase() +
                          member.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(member.joiningDate)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(member.membershipId.endDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
                        >
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/dashboard/members/${member._id}`)
                            }
                          >
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/dashboard/members/${member._id}/edit`
                              )
                            }
                          >
                            Edit member
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Add payment</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setSelectedMember(member);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            Delete member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{members?.length}</strong> of{" "}
            <strong>{members.length}</strong> members
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

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Member"
        description={`Are you sure you want to delete ${selectedMember?.name}? This action cannot be undone.`}
        actionLabel="Delete Member"
        variant="destructive"
        isLoading={isLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
