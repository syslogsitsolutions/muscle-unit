"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  CreditCard,
  Clock,
  Activity,
  AlertTriangle,
  FileText,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Pause,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock member data
const memberData = {
  id: "1",
  name: "John Smith",
  email: "john.smith@example.com",
  phone: "+1 (555) 123-4567",
  address: "123 Main Street, New York, NY 10001",
  dateOfBirth: "1990-05-15",
  gender: "male",
  profileImage: "",
  membershipStatus: "active",
  membershipType: "Premium Monthly",
  joiningDate: "2023-01-15",
  membershipEnd: "2024-01-15",
  emergencyContact: {
    name: "Jane Smith",
    relationship: "Spouse",
    phone: "+1 (555) 234-5678",
  },
  medicalConditions: "None reported",
  notes: "Prefers morning workouts. Interested in personal training sessions.",
  lastCheckIn: "2024-01-10T08:30:00",
  totalVisits: 156,
  averageVisitsPerWeek: 4.2,
};

// Mock payment history
const paymentHistory = [
  {
    id: "PAY-001",
    date: "2024-01-01",
    amount: 99.99,
    method: "Credit Card",
    status: "completed",
    description: "Premium Monthly Membership",
  },
  {
    id: "PAY-002",
    date: "2023-12-01",
    amount: 99.99,
    method: "Credit Card",
    status: "completed",
    description: "Premium Monthly Membership",
  },
  {
    id: "PAY-003",
    date: "2023-11-01",
    amount: 99.99,
    method: "Bank Transfer",
    status: "completed",
    description: "Premium Monthly Membership",
  },
];

// Mock attendance history
const attendanceHistory = [
  {
    id: "ATT-001",
    date: "2024-01-10",
    checkIn: "08:30",
    checkOut: "10:15",
    duration: "1h 45m",
  },
  {
    id: "ATT-002",
    date: "2024-01-08",
    checkIn: "07:45",
    checkOut: "09:30",
    duration: "1h 45m",
  },
  {
    id: "ATT-003",
    date: "2024-01-06",
    checkIn: "18:00",
    checkOut: "19:30",
    duration: "1h 30m",
  },
  {
    id: "ATT-004",
    date: "2024-01-04",
    checkIn: "08:15",
    checkOut: "10:00",
    duration: "1h 45m",
  },
];

export default function MemberDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
          >
            <CheckCircle2 className="mr-1 h-3 w-3" /> Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge
            variant="outline"
            className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
          >
            <XCircle className="mr-1 h-3 w-3" /> Inactive
          </Badge>
        );
      case "frozen":
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
          >
            <Pause className="mr-1 h-3 w-3" /> Frozen
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-500"
          >
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-500">
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Member Details
            </h2>
            <p className="text-muted-foreground">
              View and manage member information
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            asChild
            className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-primary/20 hover:border-primary/40"
          >
            <Link href={`/dashboard/members/${params.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Member
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-primary/20 hover:border-primary/40"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
            >
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="h-4 w-4 mr-2" />
                Add Payment
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                Deactivate Member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Member Profile Card */}
      <Card className="dashboard-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage
                  src={memberData.profileImage}
                  alt={memberData.name}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {memberData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="mt-4 text-center md:text-left">
                <h3 className="text-2xl font-bold">{memberData.name}</h3>
                <p className="text-muted-foreground">
                  Member ID: #{memberData.id}
                </p>
                <div className="mt-2">
                  {getStatusBadge(memberData.membershipStatus)}
                </div>
              </div>
            </div>

            <div className="flex-1 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Personal Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{memberData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{memberData.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{memberData.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Age: {calculateAge(memberData.dateOfBirth)} years
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Membership Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="ml-2 font-medium">
                      {memberData.membershipType}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Joined:</span>
                    <span className="ml-2">
                      {formatDate(memberData.joiningDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expires:</span>
                    <span className="ml-2">
                      {formatDate(memberData.membershipEnd)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="ml-2">
                      {Math.ceil(
                        (new Date(memberData.membershipEnd).getTime() -
                          new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days left
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Activity Stats
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Visits:</span>
                    <span className="ml-2 font-medium">
                      {memberData.totalVisits}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Weekly Average:
                    </span>
                    <span className="ml-2">
                      {memberData.averageVisitsPerWeek} visits
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Last Check-in:
                    </span>
                    <span className="ml-2">
                      {formatDate(memberData.lastCheckIn)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-primary/20">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="notes">Notes & Medical</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <p className="font-medium">
                    {memberData.emergencyContact.name}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Relationship:
                  </span>
                  <p className="font-medium">
                    {memberData.emergencyContact.relationship}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Phone:</span>
                  <p className="font-medium">
                    {memberData.emergencyContact.phone}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Checked in</p>
                      <p className="text-xs text-muted-foreground">
                        Today at 8:30 AM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Payment received</p>
                      <p className="text-xs text-muted-foreground">
                        Jan 1, 2024
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Membership renewed</p>
                      <p className="text-xs text-muted-foreground">
                        Jan 1, 2024
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                Complete payment history for this member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-primary/20 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-primary/5 to-purple-600/5">
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-primary/5">
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(payment.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>
                Recent gym visits and check-in records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-primary/20 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-primary/5 to-purple-600/5">
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceHistory.map((record) => (
                      <TableRow key={record.id} className="hover:bg-primary/5">
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell>{record.checkIn}</TableCell>
                        <TableCell>{record.checkOut}</TableCell>
                        <TableCell className="font-medium">
                          {record.duration}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Medical Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {memberData.medicalConditions ||
                    "No medical conditions reported"}
                </p>
              </CardContent>
            </Card>

            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {memberData.notes || "No additional notes"}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
