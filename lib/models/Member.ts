import mongoose, { Schema } from "mongoose";

export interface IMember {
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: Date;
  gender: "male" | "female" | "other";
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
      name: { type: String, required: true },
      relationship: { type: String, required: true },
      phone: { type: String, required: true },
    },
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

// Static method definition - more robust approach for serverless
MemberSchema.statics.getNextMemberId = async function (): Promise<string> {
  try {
    const lastMember = await this.findOne()
      .sort({ createdAt: -1 })
      .select('memberId')
      .lean()
      .exec();
    
    const lastId = lastMember?.memberId ? parseInt(lastMember.memberId, 10) : 999;
    
    // Ensure we have a valid number
    if (isNaN(lastId)) {
      console.warn('Invalid memberId found, starting from 1000');
      return "1000";
    }
    
    return (lastId + 1).toString();
  } catch (error) {
    console.error('Error in getNextMemberId:', error);
    throw new Error('Failed to generate next member ID');
  }
};

// Add full-text search index
MemberSchema.index({ name: "text", phone: "text" });

// Pre-save hook to generate memberId if not provided
MemberSchema.pre('save', async function(next) {
  if (!this.memberId) {
    try {
      // Use the constructor to access static methods
      const MemberModel = this.constructor as MemberModel;
      this.memberId = await MemberModel.getNextMemberId();
    } catch (error) {
      console.error('Error generating memberId in pre-save hook:', error);
      return next(error instanceof Error ? error : new Error('Unknown error generating memberId'));
    }
  }
  next();
});

// Interface for the model with statics
interface MemberModel extends mongoose.Model<IMember> {
  getNextMemberId(): Promise<string>;
}

// Simplified model creation for serverless environments
const Member: MemberModel = (mongoose.models.Member as MemberModel) || mongoose.model<IMember, MemberModel>("Member", MemberSchema);

// Ensure the static method is always available - this is the key fix for serverless
if (typeof Member.getNextMemberId !== 'function') {
  Member.getNextMemberId = async function(): Promise<string> {
    try {
      const lastMember = await this.findOne()
        .sort({ createdAt: -1 })
        .select('memberId')
        .lean()
        .exec();
      
      const lastId = lastMember?.memberId ? parseInt(lastMember.memberId, 10) : 999;
      
      if (isNaN(lastId)) {
        console.warn('Invalid memberId found, starting from 1000');
        return "1000";
      }
      
      return (lastId + 1).toString();
    } catch (error) {
      console.error('Error in getNextMemberId fallback:', error);
      throw new Error('Failed to generate next member ID');
    }
  };
}

export default Member;
