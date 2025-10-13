import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Member from "@/lib/models/Member";
import Membership from "@/lib/models/Membership";

// Helper function to get date range based on timeRange filter
function getDateRange(timeRange: string, startDate?: string, endDate?: string) {
  const now = new Date();
  let start: Date;
  let end: Date = now;

  switch (timeRange) {
    case "day":
      start = new Date(now.setHours(0, 0, 0, 0));
      break;
    case "week":
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      break;
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "lastMonth":
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case "quarter":
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case "custom":
      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
      } else {
        start = new Date(now.getFullYear(), 0, 1);
      }
      break;
    default:
      start = new Date(now);
      start.setDate(now.getDate() - 7);
  }

  return { start, end };
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "week";
    const membershipType = searchParams.get("membershipType");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const { start, end } = getDateRange(timeRange, startDate || "", endDate || "");

    // Build query
    const query: any = {
      joiningDate: {
        $gte: start,
        $lte: end,
      },
    };

    if (status && status !== "all") {
      query.status = status;
    }

    // Fetch members
    const total = await Member.countDocuments(query);
    const members = await Member.find(query)
      .populate({
        path: "membershipId",
        populate: { path: "membershipType", select: "name" },
      })
      .sort({ joiningDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Filter by membership type if specified
    let filteredMembers = members;
    if (membershipType && membershipType !== "all") {
      filteredMembers = members.filter((member: any) => {
        return member.membershipId?.membershipType?._id?.toString() === membershipType;
      });
    }

    // Calculate statistics
    const stats = {
      totalNewMembers: membershipType && membershipType !== "all" 
        ? filteredMembers.length 
        : total,
      activeMembers: filteredMembers.filter((m: any) => m.status === "active").length,
      inactiveMembers: filteredMembers.filter((m: any) => m.status === "inactive").length,
      timeRange: timeRange,
      startDate: start,
      endDate: end,
    };

    return NextResponse.json({
      success: true,
      members: filteredMembers,
      stats,
      total: membershipType && membershipType !== "all" ? filteredMembers.length : total,
      page,
      totalPages: Math.ceil((membershipType && membershipType !== "all" ? filteredMembers.length : total) / limit),
    });
  } catch (error) {
    console.error("Error fetching joined members:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch joined members" },
      { status: 500 }
    );
  }
}

