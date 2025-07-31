import mongoose, { Schema } from 'mongoose';

export interface IAttendance {
  member: Schema.Types.ObjectId;
  checkIn: Date;
  checkOut?: Date;
  duration?: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    member: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date },
    duration: { type: Number }, // in minutes
  },
  { timestamps: true }
);

export default mongoose.models.Attendance ||
  mongoose.model<IAttendance>('Attendance', AttendanceSchema);