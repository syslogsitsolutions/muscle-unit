import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Attendance from '@/lib/models/Attendance';

export async function GET() {
  try {
    await connectToDatabase();
    const attendance = await Attendance.find()
      .populate('member', 'name email')
      .sort({ checkIn: -1 });
    
    return NextResponse.json(attendance);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    
    const attendance = await Attendance.create(body);
    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create attendance record' },
      { status: 500 }
    );
  }
}