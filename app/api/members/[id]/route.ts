import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Member from "@/lib/models/Member";
import MembershipType from "@/lib/models/MembershipType";
import Membership from "@/lib/models/Membership";

function convertToISO(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toISOString();
}
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const member = await Member.findById(params.id).populate({
      path: "membershipId",
      model: "Membership",
      populate: [
        {
          path: "membershipType",
          model: "MembershipType",
        },
        {
          path: "paymentId",
          model: "Payment",
        },
      ],
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch member" },
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

    // const member = await Member.findByIdAndUpdate(params.id, body, {
    //   new: true,
    //   runValidators: true,
    // });
    let existingMember = await Member.findById(params.id).populate(
      "membershipId"
    );
    existingMember = JSON.parse(JSON.stringify(existingMember));

    if (!existingMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const membershipType = await MembershipType.findById(body.membershipType);
    if (!membershipType) {
      return NextResponse.json(
        { error: "Membership type not found" },
        { status: 400 }
      );
    }
    if (body.membershipType !== membershipType._id.toString()) {
      const price =
        parseInt(membershipType.offerPrice) > 0
          ? parseInt(membershipType.offerPrice) +
            parseInt(membershipType.admissionFee)
          : parseInt(membershipType.actualPrice) +
            parseInt(membershipType.admissionFee);

      // Create Membership document
      const newMembership = await Membership.create({
        membershipType: membershipType._id,
        startDate: convertToISO(body.membershipValidFrom),
        endDate: convertToISO(body.membershipValidTo),
        amountPaid: body.paymentStatus === "completed" ? price : 0,
        amount: price,
        isAdmissionFeeIncluded: true,
        status: body.paymentStatus === "completed" ? "active" : "pending",
        notes: body?.notes,
      });

      // Update member
      await Member.findByIdAndUpdate(
        params.id,
        {
          ...body,
          membershipId: newMembership._id,
        },
        {
          new: true,
        }
      );
    } else {
      await Member.findByIdAndUpdate(
        params.id,
        {
          ...body,
        },
        {
          new: true,
        }
      );
    }

    return NextResponse.json(existingMember);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update member" },
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
    const member = await Member.findByIdAndDelete(params.id);

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Member deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete member" },
      { status: 500 }
    );
  }
}
