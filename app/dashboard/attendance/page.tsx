"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";

interface AttendanceRecord {
  _id: string;
  member: {
    _id: string;
    name: string;
    email: string;
  };
  checkIn: string;
  checkOut?: string;
}

export default function AttendancePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [todaysAttendance, setTodaysAttendance] = useState(0);
  const [weeklyAverage, setWeeklyAverage] = useState(0);
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch("/api/attendance");
        if (!response.ok) {
          throw new Error("Failed to fetch attendance");
        }
        const data: AttendanceRecord[] = await response.json();
        setAttendanceRecords(data);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchAttendance();
  }, []);

  useEffect(() => {
    if (attendanceRecords.length > 0) {
      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      // Today's Attendance
      const todayRecords = attendanceRecords.filter((record) => {
        const checkInDate = new Date(record.checkIn);
        return (
          checkInDate >= todayStart &&
          checkInDate < new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
        );
      });
      setTodaysAttendance(todayRecords.length);

      // Weekly Average
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);
      const lastWeekRecords = attendanceRecords.filter(
        (record) => new Date(record.checkIn) >= oneWeekAgo
      );
      const uniqueDaysLastWeek = new Set(
        lastWeekRecords.map((r) => new Date(r.checkIn).toDateString())
      ).size;
      setWeeklyAverage(
        uniqueDaysLastWeek > 0
          ? Math.round(lastWeekRecords.length / uniqueDaysLastWeek)
          : 0
      );

      // Monthly Total
      const currentMonthStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      const monthlyRecords = attendanceRecords.filter(
        (record) => new Date(record.checkIn) >= currentMonthStart
      );
      setMonthlyTotal(monthlyRecords.length);
    }
  }, [attendanceRecords]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
        <p className="text-muted-foreground mt-2">
          Manage and view member attendance records.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysAttendance} Members</div>
            <p className="text-xs text-muted-foreground">checked in today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyAverage}</div>
            <p className="text-xs text-muted-foreground">members per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyTotal}</div>
            <p className="text-xs text-muted-foreground">
              total check-ins this month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="pt-6">
        <CardHeader>
          <CardTitle>Attendance Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
    </div>
  );
}
