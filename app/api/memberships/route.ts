import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Membership from "@/lib/models/Membership";
import "@/lib/models/MembershipType"; // ensure MembershipType is registered with Mongoose
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const now = new Date();
    await Membership.updateMany(
      {
        endDate: { $lt: now },
        status: { $ne: "expired" },
      },
      { $set: { status: "expired", amountPaid: 0 } }
    );

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search")?.toLowerCase() || "";
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "delayedDays";
    const sortOrder = searchParams.get("sortOrder") === "desc" ? -1 : 1;

    const matchStage: any = {};

    if (search) {
      matchStage.$or = [
        { "memberDetails.name": { $regex: search, $options: "i" } },
        { "memberDetails.phone": { $regex: search, $options: "i" } },
      ];
    }

    if (status === "due_this_month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
      matchStage.endDate = { $gte: startOfMonth, $lte: endOfMonth };
      matchStage.status = { $in: ["expired", "pending"] };
    } else if (status && status !== "all") {
      matchStage.status = status;
    }

    const skip = (page - 1) * limit;

    const delayedDaysSort: Record<string, 1 | -1> =
      sortBy === "delayedDays"
        ? { overdueRank: 1, delayedDays: sortOrder }
        : { endDate: 1 };

    const results = await Membership.aggregate([
      {
        $lookup: {
          from: "members",
          localField: "member",
          foreignField: "_id",
          as: "memberDetails",
        },
      },
      { $unwind: "$memberDetails" },
      { $match: { "memberDetails.status": "active" } },
      {
        $lookup: {
          from: "membershiptypes",
          localField: "membershipType",
          foreignField: "_id",
          as: "membershipTypeDetails",
        },
      },
      { $unwind: "$membershipTypeDetails" },

      { $match: matchStage },
      {
        $addFields: {
          delayedDays: {
            $floor: {
              $divide: [
                { $subtract: [now, "$endDate"] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          overdueRank: {
            $cond: [{ $gte: ["$delayedDays", 0] }, 0, 1],
          },
        },
      },
      { $sort: delayedDaysSort },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);

    const memberships = results[0].data;
    const total = results[0].metadata[0]?.total || 0;

    return NextResponse.json({ memberships, total });
  } catch (error) {
    console.error("Membership list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch memberships" },
      { status: 500 }
    );
  }
}
