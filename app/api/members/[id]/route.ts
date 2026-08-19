import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Member from "@/lib/models/Member";
import MembershipType from "@/lib/models/MembershipType";
import Membership from "@/lib/models/Membership";
import Payment from "@/lib/models/Payment";

function convertToISO(dateStr: string): string {
  // Handle both ISO string format and YYYY-MM-DD format
  if (dateStr.includes("T")) {
    // Already an ISO string
    return dateStr;
  }
  // YYYY-MM-DD format
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

const memberPopulate = {
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
};

async function createMembershipWithOptionalPayment({
  memberId,
  membershipType,
  body,
}: {
  memberId: string;
  membershipType: any;
  body: any;
}) {
  if (!body.membershipValidFrom || !body.membershipValidTo) {
    throw new Error("Membership start and end dates are required");
  }

  const price =
    parseInt(membershipType.offerPrice) > 0
      ? parseInt(membershipType.offerPrice) +
        parseInt(membershipType.admissionFee)
      : parseInt(membershipType.actualPrice) +
        parseInt(membershipType.admissionFee);

  const newMembership = await Membership.create({
    member: memberId,
    membershipType: membershipType._id,
    startDate: convertToISO(body.membershipValidFrom),
    endDate: convertToISO(body.membershipValidTo),
    amountPaid: body.paymentStatus === "completed" ? price : 0,
    amount: price,
    isAdmissionFeeIncluded: true,
    status: body.paymentStatus === "completed" ? "active" : "pending",
    notes: body?.notes || "",
  });

  if (body.paymentStatus === "completed" && body.paymentMethod) {
    const newPayment = await Payment.create({
      member: memberId,
      amount: price,
      paymentMethod: body.paymentMethod,
      paymentType: "membership",
      transactionType: "credit",
      notes: body?.notes || "",
      status: "paid",
      paymentEntry: [
        {
          amount:
            membershipType.offerPrice > 0
              ? membershipType.offerPrice
              : membershipType.actualPrice,
          label: "Membership Fee",
        },
        {
          amount: membershipType.admissionFee,
          label: "Admission Fee",
        },
      ],
      membershipId: newMembership._id,
    });

    await Membership.findByIdAndUpdate(
      newMembership._id,
      { paymentId: newPayment._id },
      { new: true }
    );
  }

  return newMembership;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    await connectToDatabase();

    const existingMember = await Member.findById(params.id);

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

    const {
      membershipType: _membershipTypeId,
      membershipValidFrom,
      membershipValidTo,
      paymentStatus,
      paymentMethod,
      notes,
      ...memberUpdateData
    } = body;

    const existingMembership = existingMember.membershipId
      ? await Membership.findById(existingMember.membershipId).populate(
          "membershipType"
        )
      : null;

    const existingMembershipTypeId =
      existingMembership?.membershipType?._id?.toString() ||
      existingMembership?.membershipType?.toString();

    const membershipTypeChanged =
      Boolean(body.membershipType) &&
      Boolean(existingMembershipTypeId) &&
      body.membershipType !== existingMembershipTypeId;

    // Deleted or missing memberships must get a new document, not a date patch
    const shouldCreateMembership =
      !existingMembership || membershipTypeChanged;

    if (shouldCreateMembership) {
      const newMembership = await createMembershipWithOptionalPayment({
        memberId: params.id,
        membershipType,
        body,
      });

      const updatedMember = await Member.findByIdAndUpdate(
        params.id,
        {
          ...memberUpdateData,
          membershipId: newMembership._id,
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate(memberPopulate);

      return NextResponse.json(updatedMember);
    }

    const updateData: any = {};
    if (membershipValidFrom) {
      updateData.startDate = convertToISO(membershipValidFrom);
    }
    if (membershipValidTo) {
      updateData.endDate = convertToISO(membershipValidTo);
    }

    if (Object.keys(updateData).length > 0) {
      await Membership.findByIdAndUpdate(existingMembership._id, updateData, {
        new: true,
      });
    }

    const updatedMember = await Member.findByIdAndUpdate(
      params.id,
      memberUpdateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate(memberPopulate);

    return NextResponse.json(updatedMember);
  } catch (error: any) {
    console.error("Failed to update member:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update member" },
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
