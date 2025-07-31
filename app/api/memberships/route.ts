import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Membership from "@/lib/models/Membership";
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

    const matchStage: any = {};

    if (search) {
      matchStage.$or = [
        { "memberDetails.name": { $regex: search, $options: "i" } },
        { "memberDetails.phone": { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      matchStage.status = status;
    }

    const skip = (page - 1) * limit;

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
      { $sort: { endDate: 1 } },
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
