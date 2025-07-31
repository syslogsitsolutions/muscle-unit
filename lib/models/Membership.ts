import mongoose, { Schema } from "mongoose";

export interface IMembership {
  member: Schema.Types.ObjectId;
  membershipType: Schema.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  amountPaid: number;
  amount: number;
  isAdmissionFeeIncluded?: boolean;
  paymentId: Schema.Types.ObjectId;
  status: "active" | "expired" | "cancelled";
  notes: string;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema<IMembership>(
  {
    member: { type: Schema.Types.ObjectId, ref: "Member" },
    membershipType: {
      type: Schema.Types.ObjectId,
      ref: "MembershipType",
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    amountPaid: { type: Number, required: true },
    isAdmissionFeeIncluded: { type: Boolean, default: false },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending"],
      default: "active",
    },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Membership ||
  mongoose.model<IMembership>("Membership", MembershipSchema);
