import { NextResponse } from 'next/server';
import { getAllLoans } from '@/lib/services/db-service';
import { ExcelService } from '@/lib/services/excel-service';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request) {
  try {
    const loans = await getAllLoans();
    
    if (loans.length === 0) {
      return NextResponse.json(
        { error: 'No loans to export' },
        { status: 400 }
      );
    }

    const excelService = new ExcelService();
    
    // Generate/update the Excel file with all loans
    const filePath = await excelService.generateExcel(loans);

    const fileBuffer = await fs.readFile(filePath);
    const fileName = 'loan_export.xlsx';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export Excel', details: error.message },
      { status: 500 }
    );
  }
}
