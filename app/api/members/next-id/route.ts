import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Member from "@/lib/models/Member";

export async function POST() {
  try {
    await connectToDatabase();

    // Use the static method from the Member model
    const nextMemberId = await Member.getNextMemberId();

    return NextResponse.json({ memberId: nextMemberId });
  } catch (error) {
    console.error("Failed to generate next member ID:", error);
    return NextResponse.json(
      { error: "Failed to generate ID" },
      { status: 500 }
    );
  }
}
