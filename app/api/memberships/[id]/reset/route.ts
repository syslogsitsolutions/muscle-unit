import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Membership from "@/lib/models/Membership";
import Member from "@/lib/models/Member";
import { Types } from "mongoose";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    await connectToDatabase();

    // Find the current membership
    const membership = await Membership.findById(new Types.ObjectId(params.id));
    
    if (!membership) {
      return NextResponse.json(
        { error: "Membership not found" },
        { status: 404 }
      );
    }

    // Find the member
    const member = await Member.findById(membership.member);
    
    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    const resetAction = body.action || "cancel"; // cancel, suspend, or restart

    switch (resetAction) {
      case "cancel":
        // Cancel the current membership
        await Membership.findByIdAndUpdate(
          params.id,
          {
            status: "cancelled",
            amountPaid: 0,
            notes: body.notes || "Membership cancelled",
          },
          { new: true }
        );

        // Update member status to inactive
        await Member.findByIdAndUpdate(membership.member, {
          status: "inactive",
        });
        break;

      case "suspend":
        // Suspend/freeze the membership
        await Membership.findByIdAndUpdate(
          params.id,
          {
            status: "cancelled",
            notes: body.notes || "Membership suspended/frozen",
          },
          { new: true }
        );

        // Update member status to inactive
        await Member.findByIdAndUpdate(membership.member, {
          status: "inactive",
        });
        break;

      case "restart":
        // Reset payment status and dates for a fresh start
        const now = new Date();
        const durationInDays = Math.ceil(
          (new Date(membership.endDate).getTime() - new Date(membership.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
        );
        
        const newEndDate = new Date(now);
        newEndDate.setDate(newEndDate.getDate() + durationInDays);

        await Membership.findByIdAndUpdate(
          params.id,
          {
            startDate: now,
            endDate: newEndDate,
            amountPaid: 0,
            status: "pending",
            notes: body.notes || "Membership restarted - pending payment",
          },
          { new: true }
        );

        // Keep member active if restarting
        await Member.findByIdAndUpdate(membership.member, {
          status: "active",
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid reset action" },
          { status: 400 }
        );
    }

    // Fetch the updated membership
    const updatedMembership = await Membership.findById(params.id).populate(
      "membershipType"
    );

    return NextResponse.json(
      {
        success: true,
        message: `Membership ${resetAction}led successfully`,
        membership: updatedMembership,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Membership reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset membership" },
      { status: 500 }
    );
  }
}

