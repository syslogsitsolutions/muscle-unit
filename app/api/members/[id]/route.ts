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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    await connectToDatabase();

    // Fetch existing member with populated membership
    const existingMember = await Member.findById(params.id).populate({
      path: "membershipId",
      populate: {
        path: "membershipType",
        model: "MembershipType",
      },
    });

    if (!existingMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Validate membership type
    const membershipType = await MembershipType.findById(body.membershipType);
    if (!membershipType) {
      return NextResponse.json(
        { error: "Membership type not found" },
        { status: 400 }
      );
    }

    // Convert to plain object for easier access
    const existingMemberObj = JSON.parse(JSON.stringify(existingMember));
    const existingMembershipTypeId = existingMemberObj.membershipId?.membershipType?._id?.toString();

    // Check if membership type has changed
    const membershipTypeChanged = 
      body.membershipType && 
      existingMembershipTypeId &&
      body.membershipType !== existingMembershipTypeId;

    if (membershipTypeChanged) {
      // Calculate price for new membership
      const price =
        parseInt(membershipType.offerPrice) > 0
          ? parseInt(membershipType.offerPrice) +
            parseInt(membershipType.admissionFee)
          : parseInt(membershipType.actualPrice) +
            parseInt(membershipType.admissionFee);

      // Create new Membership document
      const newMembership = await Membership.create({
        member: params.id,
        membershipType: membershipType._id,
        startDate: convertToISO(body.membershipValidFrom),
        endDate: convertToISO(body.membershipValidTo),
        amountPaid: body.paymentStatus === "completed" ? price : 0,
        amount: price,
        isAdmissionFeeIncluded: true,
        status: body.paymentStatus === "completed" ? "active" : "pending",
        notes: body?.notes || "",
      });

      // Create payment if payment is completed
      if (body.paymentStatus === "completed" && body.paymentMethod) {
        const newPayment = await Payment.create({
          member: params.id,
          amount: price,
          paymentMethod: body.paymentMethod,
          paymentType: "membership",
          transactionType: "credit",
          notes: body?.notes || "",
          status: "paid",
          paymentEntry: [
            {
              amount: membershipType.offerPrice > 0 ? membershipType.offerPrice : membershipType.actualPrice,
              label: "Membership Fee",
            },
            {
              amount: membershipType.admissionFee,
              label: "Admission Fee",
            },
          ],
          membershipId: newMembership._id,
        });

        // Link payment to membership
        await Membership.findByIdAndUpdate(
          newMembership._id,
          { paymentId: newPayment._id },
          { new: true }
        );
      }

      // Update member with new membershipId
      const updatedMember = await Member.findByIdAndUpdate(
        params.id,
        {
          ...body,
          membershipId: newMembership._id,
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate({
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

      return NextResponse.json(updatedMember);
    } else {
      // Membership type hasn't changed, but we might need to update membership dates
      if (body.membershipValidFrom || body.membershipValidTo) {
        const updateData: any = {};
        if (body.membershipValidFrom) {
          updateData.startDate = convertToISO(body.membershipValidFrom);
        }
        if (body.membershipValidTo) {
          updateData.endDate = convertToISO(body.membershipValidTo);
        }
        
        if (Object.keys(updateData).length > 0 && existingMemberObj.membershipId?._id) {
          await Membership.findByIdAndUpdate(
            existingMemberObj.membershipId._id,
            updateData,
            { new: true }
          );
        }
      }

      // Update member information (excluding membershipType from body to avoid issues)
      const { membershipType, membershipValidFrom, membershipValidTo, paymentStatus, paymentMethod, notes, ...memberUpdateData } = body;
      
      const updatedMember = await Member.findByIdAndUpdate(
        params.id,
        memberUpdateData,
        {
          new: true,
          runValidators: true,
        }
      ).populate({
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

      return NextResponse.json(updatedMember);
    }
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
