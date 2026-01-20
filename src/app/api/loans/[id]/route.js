import { NextResponse } from 'next/server';
import { getLoanById, updateLoan, deleteLoan } from '@/lib/services/db-service';

// GET - Get single loan by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const loan = await getLoanById(id);
    
    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }
    
    return NextResponse.json(loan);
  } catch (error) {
    console.error('Get loan error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loan', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update loan
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const loan = await updateLoan(id, body);
    return NextResponse.json({ success: true, loan });
  } catch (error) {
    console.error('Update loan error:', error);
    if (error.message === 'Loan not found') {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to update loan', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete loan
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await deleteLoan(id);
    return NextResponse.json({ success: true, message: 'Loan deleted successfully' });
  } catch (error) {
    console.error('Delete loan error:', error);
    if (error.message === 'Loan not found') {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to delete loan', details: error.message },
      { status: 500 }
    );
  }
}
