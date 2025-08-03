import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Member from "@/lib/models/Member";
import Payment from "@/lib/models/Payment";
import MembershipType from "@/lib/models/MembershipType";
import Membership from "@/lib/models/Membership";

function convertToISO(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toISOString();
}
export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search")?.toLowerCase() || "";

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { memberId: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Member.countDocuments(query);
    const members = await Member.find(query)
      .populate({
        path: "membershipId",
        populate: { path: "membershipType", select: "name" },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ members, total });
  } catch (error) {
    console.log("error", error);

    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();

    const {
      membershipType: membershipTypeId,
      membershipValidFrom,
      membershipValidTo,
      paymentStatus,
      paymentMethod,
      notes,
      ...memberData
    } = body;

    const membershipType = await MembershipType.findById(membershipTypeId);
    if (!membershipType) {
      return NextResponse.json(
        { error: "Membership type not found" },
        { status: 400 }
      );
    }

    const price =
      parseInt(membershipType.offerPrice) > 0
        ? parseInt(membershipType.offerPrice) +
          parseInt(membershipType.admissionFee)
        : parseInt(membershipType.actualPrice) +
          parseInt(membershipType.admissionFee);

    // Create Membership document
    const newMembership = await Membership.create({
      membershipType: membershipTypeId,
      startDate: convertToISO(membershipValidFrom),
      endDate: convertToISO(membershipValidTo),
      amountPaid: paymentStatus === "completed" ? price : 0,
      amount: price,
      isAdmissionFeeIncluded: true,
      status: paymentStatus === "completed" ? "active" : "pending",
      notes,
    });

    // Get Member ID
    const memberId = await Member.getNextMemberId();

    // Create Member document
    const newMember = await Member.create({
      ...memberData,
      memberId,
      membershipId: newMembership._id,
    });

    // Create Payment document
    let newPayment;
    if (paymentStatus === "completed") {
      newPayment = await Payment.create({
        amount: price,
        paidAt: new Date(),
        isPaid: true,
        paymentMethod,
        paymentType: "membership",
        transactionType: "credit",
        notes,
        status: "paid",
        paymentEntry: [
          {
            amount: price,
            label: "Membership Fee",
          },
          {
            amount: membershipType.admissionFee,
            label: "Admission Fee",
          },
        ],
      });
      // Update Membership document with references
      await Membership.findByIdAndUpdate(
        newMembership._id,
        {
          paymentId: newPayment._id,
          member: newMember._id,
        },
        { new: true }
      );
      return NextResponse.json(newMember, { status: 201 });
    }

    await Membership.findByIdAndUpdate(
      newMembership._id,
      {
        member: newMember._id,
      },
      { new: true }
    );

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("Failed to create member:", error);
    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    );
  }
}
