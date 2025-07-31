import mongoose, { Schema } from "mongoose";

export interface IPayment {
  member: Schema.Types.ObjectId;
  amount: number;
  paymentMethod: "cash" | "online" | "other";
  paymentType:
    | "membership"
    | "product"
    | "service"
    | "salary"
    | "donation"
    | "other";
  membershipId?: Schema.Types.ObjectId;
  invoiceNumber: string;
  nextPaymentDate?: Date;
  transactionType?: "debit" | "credit";
  status?: "paid" | "partially-paid" | "unpaid";
  paymentEntry?: [
    {
      amount: number;
      label: string;
    }
  ];
  notes?: string;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "online", "other"],
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["membership", "product", "service", "salary", "donation", "other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["paid", "partially-paid", "unpaid"],
      default: "unpaid",
    },
    paymentEntry: [
      {
        amount: { type: Number },
        label: { type: String },
      },
    ],
    transactionType: { type: String, enum: ["debit", "credit"] },
    membershipId: { type: Schema.Types.ObjectId, ref: "Membership" },
    invoiceNumber: { type: String, required: true, unique: true },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

PaymentSchema.pre("validate", function (next) {
  if (!this.invoiceNumber) {
    const unixTime = Math.floor(Date.now() / 1000);
    this.invoiceNumber = `INV-${unixTime}`;
  }
  next();
});

export default mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);
