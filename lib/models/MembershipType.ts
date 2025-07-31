import mongoose, { Schema } from "mongoose";

export interface IMembershipType {
  name: string;
  duration: number; // in months
  offerPrice: number;
  description: string;
  features: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  actualPrice: number;
  admissionFee: number;
}

const MembershipTypeSchema = new Schema<IMembershipType>(
  {
    name: { type: String, required: true },
    duration: { type: Number, required: true }, // in months
    actualPrice: { type: Number, required: true },
    offerPrice: { type: Number, required: true, default: 0 },
    description: { type: String, required: true },
    features: { type: String },
    isActive: { type: Boolean, default: true },
    admissionFee: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.MembershipType ||
  mongoose.model<IMembershipType>("MembershipType", MembershipTypeSchema);
