import { NextResponse } from 'next/server';
import { getAllLoans, getLoansPaginated, addLoan } from '@/lib/services/db-service';

// GET - Fetch all loans with pagination
export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const result = await getLoansPaginated(page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Get loans error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loans', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new loan manually
export async function POST(request) {
  try {
    const body = await request.json();
    const loan = await addLoan(body);
    return NextResponse.json({ success: true, loan }, { status: 201 });
  } catch (error) {
    console.error('Create loan error:', error);
    return NextResponse.json(
      { error: 'Failed to create loan', details: error.message },
      { status: 500 }
    );
  }
}
