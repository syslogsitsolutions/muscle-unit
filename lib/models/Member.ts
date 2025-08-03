import mongoose, { Schema } from "mongoose";

export interface IMember {
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: Date;
  gender: "male" | "female" | "other";
  occupation: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  membershipId: Schema.Types.ObjectId;
  joiningDate: Date;
  healthInfo: {
    medicalConditions: string;
    notes: string;
    weight: string;
    height: string;
    bloodType: string;
  };
  status: "active" | "inactive";
  profileImage?: string;
  memberId: string;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    memberId: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String },
    },
    occupation: { type: String },
    membershipId: {
      type: Schema.Types.ObjectId,
      ref: "Membership",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    joiningDate: { type: Date, default: Date.now },
    healthInfo: {
      medicalConditions: { type: String },
      notes: { type: String },
      weight: { type: String },
      height: { type: String },
      bloodType: { type: String },
    },

    profileImage: { type: String },
  },
  { timestamps: true }
);

MemberSchema.statics.getNextMemberId = async function (): Promise<string> {
  const lastMember = await this.findOne().sort({ createdAt: -1 }).lean();
  const lastId = lastMember?.memberId ? parseInt(lastMember.memberId) : 999;
  return (lastId + 1).toString();
};

// Add full-text search index
MemberSchema.index({ name: "text", phone: "text" });

interface MemberModel extends mongoose.Model<IMember> {
  getNextMemberId(): Promise<string>;
}

// ✅ Important fix for serverless environments
export default (mongoose.models.Member as MemberModel) ||
  mongoose.model<IMember, MemberModel>("Member", MemberSchema);
