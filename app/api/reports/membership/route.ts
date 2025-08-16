// pages/api/reports/membership.js or app/api/reports/membership/route.js
import mongoose from "mongoose";
import Payment from "@/lib/models/Payment";
import "@/lib/models/Membership";
import "@/lib/models/Member";
import "@/lib/models/MembershipType";
// You'll also need Membership and Member models

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Get filter parameters
    const timeRange = searchParams.get("timeRange") || "year";
    const membershipType = searchParams.get("membershipType") || "all";
    const status = searchParams.get("status") || "all";
    const paymentStatus = searchParams.get("paymentStatus") || "all";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Calculate date range
    let dateFilter = {};
    const now = new Date();

    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    } else {
      switch (timeRange) {
        case "day":
          dateFilter = {
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
              $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            },
          };
          break;
        case "week":
          dateFilter = {
            createdAt: {
              $gte: new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() - now.getDay()
              ),
              $lte: new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + (6 - now.getDay())
              ),
            },
          };
          break;
        case "month":
          dateFilter = {
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth(), 1),
              $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0),
            },
          };
          break;
        case "lastMonth":
          dateFilter = {
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
              $lte: new Date(now.getFullYear(), now.getMonth(), 0),
            },
          };
          break;

        case "quarter":
          const quarter = Math.floor(now.getMonth() / 3);
          dateFilter = {
            createdAt: {
              $gte: new Date(now.getFullYear(), quarter * 3, 1),
              $lte: new Date(now.getFullYear(), (quarter + 1) * 3, 0),
            },
          };
          break;
        case "year":
        default:
          dateFilter = {
            createdAt: {
              $gte: new Date(now.getFullYear(), 0, 1),
              $lte: new Date(now.getFullYear(), 11, 31),
            },
          };
      }
    }

    // Build aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: "memberships",
          localField: "membershipId",
          foreignField: "_id",
          as: "membership",
        },
      },
      {
        $unwind: "$membership",
      },
      {
        $lookup: {
          from: "members",
          localField: "member",
          foreignField: "_id",
          as: "memberDetails",
        },
      },
      {
        $unwind: "$memberDetails",
      },
      {
        $lookup: {
          from: "membershiptypes",
          localField: "membership.membershipType",
          foreignField: "_id",
          as: "membershipType",
        },
      },
      {
        $unwind: "$membershipType",
      },
      {
        $match: {
          paymentType: "membership",
          ...dateFilter,
          ...(membershipType !== "all" && {
            "membershipType._id": membershipType,
          }),
          ...(status !== "all" && { "membership.status": status }),
          ...(paymentStatus !== "all" && { status: paymentStatus }),
        },
      },
    ];

    // Execute aggregation
    const payments = await Payment.aggregate(pipeline);

    // Generate summary statistics
    const summary = {
      totalRevenue: payments.reduce((sum, payment) => sum + payment.amount, 0),
      totalPayments: payments.length,
      averagePayment:
        payments.length > 0
          ? payments.reduce((sum, payment) => sum + payment.amount, 0) /
            payments.length
          : 0,
      paidPayments: payments.filter((p) => p.status === "paid").length,
      unpaidPayments: payments.filter((p) => p.status === "unpaid").length,
      partiallyPaidPayments: payments.filter(
        (p) => p.status === "partially-paid"
      ).length,
    };

    // Revenue by membership type
    const revenueByType = payments.reduce((acc, payment) => {
      const typeName = payment.membershipType.name;
      if (!acc[typeName]) {
        acc[typeName] = { total: 0, count: 0 };
      }
      acc[typeName].total += payment.amount;
      acc[typeName].count += 1;
      return acc;
    }, {});

    // Revenue over time (monthly breakdown)
    const revenueOverTime = payments.reduce((acc, payment) => {
      const month = new Date(payment.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += payment.amount;
      return acc;
    }, {});

    // Payment method breakdown
    const paymentMethodBreakdown = payments.reduce((acc, payment) => {
      if (!acc[payment.paymentMethod]) {
        acc[payment.paymentMethod] = { total: 0, count: 0 };
      }
      acc[payment.paymentMethod].total += payment.amount;
      acc[payment.paymentMethod].count += 1;
      return acc;
    }, {});

    // Member acquisition by month
    const memberAcquisition = payments.reduce((acc, payment) => {
      const month = new Date(payment.membership.startDate).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
        }
      );
      if (!acc[month]) {
        acc[month] = { newMembers: 0, revenue: 0 };
      }
      acc[month].newMembers += 1;
      acc[month].revenue += payment.amount;
      return acc;
    }, {});

    // Top members by spending
    const topMembers = Object.values(
      payments.reduce((acc, payment) => {
        const memberId = payment.memberDetails._id.toString();
        if (!acc[memberId]) {
          acc[memberId] = {
            name: payment.memberDetails.name,
            email: payment.memberDetails.email,
            phone: payment.memberDetails.phone,
            totalSpent: 0,
            paymentsCount: 0,
          };
        }
        acc[memberId].totalSpent += payment.amount;
        acc[memberId].paymentsCount += 1;
        return acc;
      }, {})
    )
      .sort(
        (a, b) =>
          (b as { totalSpent: number }).totalSpent -
          (a as { totalSpent: number }).totalSpent
      )
      .slice(0, 10);

    // Membership retention analysis
    const retentionData = await Payment.aggregate([
      {
        $match: {
          paymentType: "membership",
          ...dateFilter,
        },
      },
      {
        $lookup: {
          from: "memberships",
          localField: "membershipId",
          foreignField: "_id",
          as: "membership",
        },
      },
      {
        $unwind: "$membership",
      },
      {
        $group: {
          _id: "$member",
          paymentCount: { $sum: 1 },
          firstPayment: { $min: "$createdAt" },
          lastPayment: { $max: "$createdAt" },
        },
      },
      {
        $project: {
          isRenewing: { $gt: ["$paymentCount", 1] },
          daysSinceFirst: {
            $divide: [
              { $subtract: [new Date(), "$firstPayment"] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalMembers: { $sum: 1 },
          renewingMembers: {
            $sum: { $cond: ["$isRenewing", 1, 0] },
          },
          averageDaysSinceFirst: { $avg: "$daysSinceFirst" },
        },
      },
    ]);

    const retention = retentionData[0] || {
      totalMembers: 0,
      renewingMembers: 0,
      averageDaysSinceFirst: 0,
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          summary,
          revenueByType: Object.entries(revenueByType).map(([name, data]) => ({
            name,
            ...(data as object),
          })),
          revenueOverTime: Object.entries(revenueOverTime)
            .map(([month, total]) => ({
              month,
              total,
            }))
            .sort(
              (a, b) =>
                new Date(a.month).getTime() - new Date(b.month).getTime()
            ),
          paymentMethodBreakdown: Object.entries(paymentMethodBreakdown).map(
            ([method, data]) => ({
              method,
              ...(data as object),
            })
          ),
          memberAcquisition: Object.entries(memberAcquisition)
            .map(([month, data]) => ({
              month,
              ...(data as object),
            }))
            .sort(
              (a, b) =>
                new Date(a.month).getTime() - new Date(b.month).getTime()
            ),
          topMembers,
          retention: {
            ...retention,
            retentionRate:
              retention.totalMembers > 0
                ? (
                    (retention.renewingMembers / retention.totalMembers) *
                    100
                  ).toFixed(1)
                : 0,
          },
          filters: {
            timeRange,
            membershipType,
            status,
            paymentStatus,
            startDate,
            endDate,
          },
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching membership reports:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to fetch membership reports",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
