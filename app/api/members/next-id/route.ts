import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Member from "@/lib/models/Member";

export async function GET() {
  try {
    await connectToDatabase();
    const nextId = await Member.getNextMemberId();
    return NextResponse.json({ memberId: nextId });
  } catch (error) {
    console.error("Failed to generate next member ID:", error);
    return NextResponse.json(
      { error: "Failed to generate ID" },
      { status: 500 }
    );
  }
}
