import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Attendance from '@/lib/models/Attendance';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const attendance = await Attendance.findById(params.id)
      .populate('member', 'name email');
    
    if (!attendance) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(attendance);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch attendance record' },
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
    
    // If checking out, calculate duration
    if (body.checkOut) {
      const attendance = await Attendance.findById(params.id);
      if (attendance) {
        const checkIn = new Date(attendance.checkIn);
        const checkOut = new Date(body.checkOut);
        body.duration = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60)); // Duration in minutes
      }
    }
    
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!updatedAttendance) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedAttendance);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update attendance record' },
      { status: 500 }
    );
  }
}