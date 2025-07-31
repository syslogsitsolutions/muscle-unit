import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import MembershipType from "@/lib/models/MembershipType";

export async function GET() {
  try {
    await connectToDatabase();
    const membershipType = await MembershipType.find().sort({ createdAt: -1 });
    return NextResponse.json(membershipType);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch membershipType" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    console.log("body", body);

    const membershipType = await MembershipType.create(body);
    return NextResponse.json(membershipType, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create membershipType" },
      { status: 500 }
    );
  }
}
