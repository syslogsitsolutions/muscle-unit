import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Payment from "@/lib/models/Payment";
import "@/lib/models/Member";
import "@/lib/models/Membership";
import "@/lib/models/MembershipType";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search")?.toLowerCase() || "";

    const query: any = {};
    if (search) {
      query.$or = [{ invoiceNumber: { $regex: search, $options: "i" } }];
    }

    if (query.status === "true" || query.status === "false") {
      query.status = query.status === "true" ? true : false;
    }

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate("member")
      .populate({
        path: "membershipId",
        populate: { path: "membershipType" },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ payments, total });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();

    // Generate invoice number
    const count = await Payment.countDocuments();
    const timestamp = Date.now();
    const invoiceNumber = `INV-${timestamp}-${count + 1}`;

    const payment = await Payment.create({
      ...body,
      invoiceNumber,
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
