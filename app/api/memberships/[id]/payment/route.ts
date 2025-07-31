import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Payment from "@/lib/models/Payment";
import Membership from "@/lib/models/Membership";
import MembershipType from "@/lib/models/MembershipType";
import mongoose, { Types } from "mongoose";

function convertToISO(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toISOString();
}
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    await connectToDatabase();

    let membership = await Membership.findById(new Types.ObjectId(params.id));
    if (!membership) {
      return NextResponse.json(
        { error: "Membership not found" },
        { status: 404 }
      );
    }
    membership = JSON.parse(JSON.stringify(membership));

    let membershipType = await MembershipType.findById(
      membership.membershipType
    );
    membershipType = JSON.parse(JSON.stringify(membershipType));

    if (!membershipType) {
      return NextResponse.json(
        { error: "Membership type not found" },
        { status: 404 }
      );
    }

    // Generate invoice number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const count = await Payment.countDocuments();
    const invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(
      4,
      "0"
    )}`;

    const payment = await Payment.create({
      amount: body.amount,
      invoiceNumber,
      paymentType: "membership",
      status: "paid",
      paymentMethod: body.method,
      paymentEntry: [
        {
          amount: body.amount,
          label: "Membership Fee",
        },
      ],
      transactionType: "credit",
      notes: body.notes,
    });

    if (membership.status === "expired") {
      const currentMembershipStartDate = new Date(membership.startDate);
      const currentMembershipEndDate = new Date(membership.endDate);

      const membershipTypeDuration = membershipType.duration;

      const membershipData = {
        member: membership.member,
        membershipType: membership.membershipType,
        startDate: currentMembershipEndDate,
        endDate: new Date(
          currentMembershipStartDate.getTime() +
            membershipTypeDuration * 24 * 60 * 60 * 1000
        ),
        amount: membershipType.amount,
        amountPaid: body.amount + membership.amountPaid,
        isAdmissionFeeIncluded: membershipType?.isAdmissionFeeIncluded,
        status: membership.amount > body.amount ? "pending" : "active",
        notes: membership.notes,
        createdBy: membership.createdBy,
        paymentId: payment._id,
      };

      membership = await Membership.findOneAndUpdate(
        { _id: membership._id },
        membershipData,
        { new: true }
      );
    } else if (membership.status === "pending") {
      const membershipData = {
        member: membership.member,
        membershipType: membership.membershipType,
        amount: membershipType.amount,
        amountPaid: body.amount + membership.amountPaid,
        isAdmissionFeeIncluded: membershipType?.isAdmissionFeeIncluded,
        status:
          membership.amount - membership.amountPaid > body.amount
            ? "pending"
            : "active",
        notes: membership.notes,
        createdBy: membership.createdBy,
        paymentId: payment._id,
      };

      membership = await Membership.findOneAndUpdate(
        { _id: membership._id },
        { ...membership, ...membershipData },
        { new: true }
      );
    } else {
      return NextResponse.json(
        { error: "Membership updating if failed" },
        { status: 400 }
      );
    }

    return NextResponse.json(true, { status: 201 });
  } catch (error) {
    console.log("error", error);

    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
