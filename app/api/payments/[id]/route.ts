import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Payment from '@/lib/models/Payment';
import Membership from '@/lib/models/Membership';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const payment = await Payment.findById(params.id)
      .populate('member', 'name email')
      .populate('membershipType', 'name');
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
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
    
    const payment = await Payment.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update payment' },
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
    
    // Find the payment first to check if it's linked to a membership
    const payment = await Payment.findById(params.id);
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    // If payment is linked to a membership, remove the paymentId reference
    if (payment.membershipId) {
      await Membership.findByIdAndUpdate(
        payment.membershipId,
        { $unset: { paymentId: 1 } },
        { new: true }
      );
    }
    
    // Delete the payment
    await Payment.findByIdAndDelete(params.id);
    
    return NextResponse.json({ 
      message: 'Payment deleted successfully' 
    });
  } catch (error: any) {
    console.error('Failed to delete payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete payment' },
      { status: 500 }
    );
  }
}