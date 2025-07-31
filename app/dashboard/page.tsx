"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  CreditCard,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface PopulatedMemberName {
  _id: string;
  name: string;
}

interface PaymentRecord {
  _id: string;
  amount: number;
  paymentDate: string; // Date as string
  status: "paid" | "unpaid" | "partially-paid";
  member: PopulatedMemberName; // For recent activity
  createdAt: string;
}

interface MemberRecord {
  _id: string;
  name: string; // For recent activity
  membershipStatus: "active" | "inactive" | "pending" | "frozen";
  joiningDate: string; // Date as string
  createdAt: string;
}

interface AttendanceRecord {
  _id: string;
  member: PopulatedMemberName; // For recent activity
  checkIn: string; // Date as string
  createdAt: string;
}

// Chart data will be processed from fetched data
const initialRevenueData = [
  { name: "Jan", revenue: 0 },
  { name: "Feb", revenue: 0 },
  { name: "Mar", revenue: 0 },
  { name: "Apr", revenue: 0 },
  { name: "May", revenue: 0 },
  { name: "Jun", revenue: 0 },
  { name: "Jul", revenue: 0 },
];

const initialMembershipData = [
  { name: "Jan", active: 0, inactive: 0 },
  { name: "Feb", active: 0, inactive: 0 },
  { name: "Mar", active: 0, inactive: 0 },
  { name: "Apr", active: 0, inactive: 0 },
  { name: "May", active: 0, inactive: 0 },
  { name: "Jun", active: 0, inactive: 0 },
  { name: "Jul", active: 0, inactive: 0 },
];

const initialAttendanceData = [
  { name: "Mon", attendance: 0 },
  { name: "Tue", attendance: 0 },
  { name: "Wed", attendance: 0 },
  { name: "Thu", attendance: 0 },
  { name: "Fri", attendance: 0 },
  { name: "Sat", attendance: 0 },
  { name: "Sun", attendance: 0 },
];

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("week");

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  console.log("payments", payments);

  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);

  // States for card values
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeMembersCount, setActiveMembersCount] = useState(0);
  const [newSignUpsCount, setNewSignUpsCount] = useState(0);
  const [avgDailyAttendance, setAvgDailyAttendance] = useState(0);

  // States for chart data
  const [revenueChartData, setRevenueChartData] = useState(initialRevenueData);
  const [membershipChartData, setMembershipChartData] = useState(
    initialMembershipData
  );
  const [attendanceChartData, setAttendanceChartData] = useState(
    initialAttendanceData
  );

  // States for percentage changes (optional, can be calculated on the fly or stored)
  const [revenueChange, setRevenueChange] = useState({ value: 0, trend: "up" });
  const [activeMembersChange, setActiveMembersChange] = useState({
    value: 0,
    trend: "up",
  });
  const [newSignUpsChange, setNewSignUpsChange] = useState({
    value: 0,
    trend: "up",
  });
  const [avgAttendanceChange, setAvgAttendanceChange] = useState({
    value: 0,
    trend: "up",
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [paymentsRes, membersRes, attendanceRes] = await Promise.all([
          fetch("/api/payments"),
          fetch("/api/members"),
          fetch("/api/attendance"),
        ]);

        if (!paymentsRes.ok || !membersRes.ok || !attendanceRes.ok) {
          console.error("Failed to fetch some dashboard data");
          // Handle partial failures if necessary
          if (!paymentsRes.ok)
            console.error("Payments fetch failed:", paymentsRes.statusText);
          if (!membersRes.ok)
            console.error("Members fetch failed:", membersRes.statusText);
          if (!attendanceRes.ok)
            console.error("Attendance fetch failed:", attendanceRes.statusText);
          // Potentially set an error state to show in UI
          return;
        }

        const paymentsData: PaymentRecord[] = await paymentsRes.json();
        const membersData: MemberRecord[] = await membersRes.json();
        const attendanceData: AttendanceRecord[] = await attendanceRes.json();

        setPayments(paymentsData);
        setMembers(membersData);
        setAttendanceRecords(attendanceData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Set an error state to show in UI
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    // Process Total Revenue
    const currentRevenue = payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);
    setTotalRevenue(currentRevenue);

    // Process Active Members
    const currentActiveMembers = members.filter(
      (m) => m.membershipStatus === "active"
    ).length;
    setActiveMembersCount(currentActiveMembers);

    // Process New Sign Ups (e.g., joined in the last 7 days for 'week' timeRange)
    // This is a simplified example; real implementation would use timeRange
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(
      sevenDaysAgo.getDate() -
        (timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365)
    );
    const currentNewSignUps = members.filter(
      (m) => new Date(m.joiningDate) >= sevenDaysAgo
    ).length;
    setNewSignUpsCount(currentNewSignUps);

    // Process Average Daily Attendance (simplified for last 7 days)
    if (attendanceRecords.length > 0) {
      const sevenDaysAgoAttendance = new Date();
      sevenDaysAgoAttendance.setDate(sevenDaysAgoAttendance.getDate() - 7); // Fixed to 7 days for simplicity

      const relevantAttendance = attendanceRecords.filter(
        (a) => new Date(a.checkIn) >= sevenDaysAgoAttendance
      );

      const attendanceByDay: { [key: string]: number } = {};
      relevantAttendance.forEach((a) => {
        const day = new Date(a.checkIn).toDateString();
        attendanceByDay[day] = (attendanceByDay[day] || 0) + 1;
      });
      const numberOfDaysWithAttendance = Object.keys(attendanceByDay).length;
      const totalAttendanceInPeriod = relevantAttendance.length;
      setAvgDailyAttendance(
        numberOfDaysWithAttendance > 0
          ? Math.round(totalAttendanceInPeriod / numberOfDaysWithAttendance)
          : 0
      );

      // Update Attendance Chart (example for last 7 days)
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const newAttendanceChartData = daysOfWeek.map((dayName) => ({
        name: dayName,
        attendance: 0,
      }));

      relevantAttendance.forEach((record) => {
        const dayIndex = new Date(record.checkIn).getDay(); // 0 for Sun, 1 for Mon, etc.
        newAttendanceChartData[dayIndex].attendance += 1;
      });
      setAttendanceChartData(newAttendanceChartData);
    } else {
      setAvgDailyAttendance(0);
      setAttendanceChartData(initialAttendanceData); // Reset if no records
    }

    // Placeholder for revenue chart data processing
    // This would typically involve grouping payments by month/day based on timeRange
    const newRevenueChartData = [...initialRevenueData]; // Start with a copy
    payments
      .filter((p) => p.status === "paid")
      .forEach((p) => {
        const monthIndex = new Date(p.paymentDate).getMonth(); // 0 for Jan, 1 for Feb
        if (monthIndex >= 0 && monthIndex < newRevenueChartData.length) {
          newRevenueChartData[monthIndex].revenue += p.amount;
        }
      });
    setRevenueChartData(newRevenueChartData);

    // Placeholder for membership chart data processing
    const newMembershipChartData = [...initialMembershipData];
    members.forEach((m) => {
      const monthIndex = new Date(m.joiningDate).getMonth();
      if (monthIndex >= 0 && monthIndex < newMembershipChartData.length) {
        if (m.membershipStatus === "active") {
          newMembershipChartData[monthIndex].active += 1;
        } else if (m.membershipStatus === "inactive") {
          newMembershipChartData[monthIndex].inactive += 1;
        }
      }
    });
    setMembershipChartData(newMembershipChartData);

    // Placeholder for percentage changes - update with simple logic for now
    // Real logic would compare to previous period based on timeRange
    setRevenueChange({
      value: 12.5,
      trend: currentRevenue > 20000 ? "up" : "down",
    }); // Example
    setActiveMembersChange({
      value: 8.2,
      trend: currentActiveMembers > 200 ? "up" : "down",
    });
    setNewSignUpsChange({
      value: 14.3,
      trend: currentNewSignUps > 20 ? "up" : "down",
    });
    setAvgAttendanceChange({
      value: 3.1,
      trend: avgDailyAttendance > 50 ? "up" : "down",
    });
  }, [payments, members, attendanceRecords, timeRange]);

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD", // Consider making this configurable
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your gym performance and statistics
          </p>
        </div>
        <Tabs
          defaultValue="week"
          value={timeRange}
          onValueChange={setTimeRange}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span
                className={`${
                  revenueChange.trend === "up"
                    ? "text-emerald-500"
                    : "text-rose-500"
                } font-medium inline-flex items-center`}
              >
                {revenueChange.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}{" "}
                {revenueChange.value}%
              </span>{" "}
              from last {timeRange}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMembersCount}</div>
            <p className="text-xs text-muted-foreground">
              <span
                className={`${
                  activeMembersChange.trend === "up"
                    ? "text-emerald-500"
                    : "text-rose-500"
                } font-medium inline-flex items-center`}
              >
                {activeMembersChange.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}{" "}
                {activeMembersChange.value}%
              </span>{" "}
              from last {timeRange}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Sign Ups</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newSignUpsCount}</div>
            <p className="text-xs text-muted-foreground">
              <span
                className={`${
                  newSignUpsChange.trend === "up"
                    ? "text-emerald-500"
                    : "text-rose-500"
                } font-medium inline-flex items-center`}
              >
                {newSignUpsChange.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}{" "}
                {newSignUpsChange.value}%
              </span>{" "}
              from last {timeRange}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Daily Attendance
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDailyAttendance}</div>
            <p className="text-xs text-muted-foreground">
              <span
                className={`${
                  avgAttendanceChange.trend === "up"
                    ? "text-emerald-500"
                    : "text-rose-500"
                } font-medium inline-flex items-center`}
              >
                {avgAttendanceChange.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}{" "}
                {avgAttendanceChange.value}%
              </span>{" "}
              from last {timeRange}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--chart-1))"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--chart-1))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--chart-1))"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Member Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={membershipChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="active"
                  name="Active"
                  fill="hsl(var(--chart-2))"
                />
                <Bar
                  dataKey="inactive"
                  name="Inactive"
                  fill="hsl(var(--chart-3))"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  name="Attendance"
                  stroke="hsl(var(--chart-4))"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] overflow-auto">
            <div className="space-y-4">
              {/* Combine and sort recent activities. Show top 6-10. */}
        {/* {[...payments, ...members, ...attendanceRecords]
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .slice(0, 8) // Show more items if available
                .map((activity) => {
                  let title = "Unknown Activity";
                  let detail = "";
                  let itemDate = new Date(activity.createdAt);

                  if ("paymentDate" in activity) {
                    // It's a PaymentRecord
                    title = `Payment ${activity.status}`;
                    detail = `${activity.member.name} - ${formatCurrency(
                      activity.amount
                    )}`;
                  } else if ("membershipStatus" in activity) {
                    // It's a MemberRecord
                    title = `Member ${activity.membershipStatus}`;
                    detail = activity.name;
                  } else if ("checkIn" in activity) {
                    // It's an AttendanceRecord
                    title = "Member Checked In";
                    detail = activity.member.name;
                    itemDate = new Date(activity.checkIn); // Use checkIn date for attendance
                  }

                  // Basic time ago formatter
                  const seconds = Math.floor(
                    (new Date().getTime() - itemDate.getTime()) / 1000
                  );
                  let interval = seconds / 31536000;
                  let timeAgo = "";
                  if (interval > 1) {
                    timeAgo = Math.floor(interval) + " years ago";
                  } else {
                    interval = seconds / 2592000;
                    if (interval > 1) {
                      timeAgo = Math.floor(interval) + " months ago";
                    } else {
                      interval = seconds / 86400;
                      if (interval > 1) {
                        timeAgo = Math.floor(interval) + " days ago";
                      } else {
                        interval = seconds / 3600;
                        if (interval > 1) {
                          timeAgo = Math.floor(interval) + " hours ago";
                        } else {
                          interval = seconds / 60;
                          if (interval > 1) {
                            timeAgo = Math.floor(interval) + " minutes ago";
                          } else {
                            timeAgo = Math.floor(seconds) + " seconds ago";
                          }
                        }
                      }
                    }
                  }

                  return (
                    <div key={activity._id} className="flex gap-4 items-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {detail}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {timeAgo}
                      </div>
                    </div>
                  );
                })} */}
        {/* </div> */}
        {/* </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
