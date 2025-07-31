import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import MembershipType from "@/lib/models/MembershipType";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const membershipType = await MembershipType.findById(params.id);
    return NextResponse.json(membershipType);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch membershipType" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const membershipType = await MembershipType.findByIdAndDelete(params.id);
    return NextResponse.json(membershipType);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete membershipType" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    await connectToDatabase();

    const updatedMembership = await MembershipType.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!updatedMembership) {
      return NextResponse.json(
        { error: "Membership not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedMembership);
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json(
      { error: "Failed to update membership" },
      { status: 500 }
    );
  }
}
