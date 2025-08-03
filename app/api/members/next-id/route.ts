import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Member from "@/lib/models/Member";

export async function GET() {
  try {
    await connectToDatabase();
    const lastMember = await Member.findOne().sort({ createdAt: -1 }).lean();
    const lastId = lastMember?.memberId ? parseInt(lastMember.memberId) : 999;
    // return (lastId + 1).toString();
    return NextResponse.json({ memberId: String(lastId + 1) });
  } catch (error) {
    console.error("Failed to generate next member ID:", error);
    return NextResponse.json(
      { error: "Failed to generate ID" },
      { status: 500 }
    );
  }
}
