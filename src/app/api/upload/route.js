import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { PDFProcessor } from '@/lib/services/pdf-processor';
import { LLMService } from '@/lib/services/llm-service';
import { addLoan } from '@/lib/services/db-service';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), 'uploads');

    // Ensure upload directory exists
    try {
      await writeFile(path.join(uploadDir, '.gitkeep'), '');
    } catch {
      // Directory might already exist
    }

    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    // Process PDF
    const pdfProcessor = new PDFProcessor();
    let pdfText;
    try {
      // Try OCR first, falls back to basic extraction automatically
      pdfText = await pdfProcessor.processWithOCR(filePath);

      // If OCR returned empty and we have minimal text, try basic extraction
      if (!pdfText || pdfText.trim().length < 10) {
        console.log('OCR returned minimal text, trying basic PDF extraction...');
        pdfText = await pdfProcessor.extractText(filePath);
      }
    } catch (error) {
      console.error('PDF processing error:', error.message);
      // Fallback to basic extraction
      try {
        pdfText = await pdfProcessor.extractText(filePath);
      } catch (extractError) {
        throw new Error(`Failed to extract text from PDF: ${extractError.message}`);
      }
    }

    // Extract data using LLM
    const llmService = new LLMService();
    const loanData = await llmService.extractLoanData(pdfText);

    // Save to database
    const loan = await addLoan({
      ...loanData,
      pdfFileName: file.name,
      pdfFilePath: filePath,
    });

    return NextResponse.json({
      success: true,
      loan,
      message: 'PDF processed and data extracted successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process PDF',
        details: error.message
      },
      { status: 500 }
    );
  }
}
