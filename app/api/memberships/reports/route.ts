import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db"; // Your DB connection utility
import Membership from "@/lib/models/Membership"; // Adjust path as needed

export async function GET() {
  try {
    await connectToDatabase();

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Total Collected (all amountPaid from active, expired, cancelled)
    const totalCollectedAgg = await Membership.aggregate([
      {
        $group: {
          _id: null,
          totalCollected: { $sum: "$amountPaid" },
        },
      },
    ]);
    const totalCollected = totalCollectedAgg[0]?.totalCollected || 0;

    // 2. Pending Payments (status = "pending")
    const pendingMemberships = await Membership.find({ status: "pending" });
    const pendingTotal = pendingMemberships.reduce(
      (sum, m) => sum + (m.amount - m.amountPaid),
      0
    );

    // 3. Overdue Payments (status = "expired")
    const overdueMemberships = await Membership.find({ status: "expired" });
    const overdueTotal = overdueMemberships.reduce(
      (sum, m) => sum + (m.amount - m.amountPaid),
      0
    );

    // 4. New Admissions This Month (MTD)
    const newAdmissions = await Membership.find({
      startDate: { $gte: firstDayOfMonth },
    });
    const admissionsAmount = newAdmissions.reduce(
      (sum, m) => sum + m.amountPaid,
      0
    );

    return NextResponse.json({
      totalCollected,
      pending: {
        total: pendingTotal,
        count: pendingMemberships.length,
      },
      overdue: {
        total: overdueTotal,
        count: overdueMemberships.length,
      },
      newAdmissions: {
        total: admissionsAmount,
        count: newAdmissions.length,
      },
    });
  } catch (error) {
    console.error("Report API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
