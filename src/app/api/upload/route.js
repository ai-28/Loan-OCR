import { NextResponse } from 'next/server';
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

    // Get buffer directly - no need to save to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process PDF directly from buffer
    const pdfProcessor = new PDFProcessor();
    let pdfText;
    try {
      // Try OCR first, falls back to basic extraction automatically
      pdfText = await pdfProcessor.processWithOCR(buffer, file.name);

      // If OCR returned empty and we have minimal text, try basic extraction
      if (!pdfText || pdfText.trim().length < 10) {
        console.log('OCR returned minimal text, trying basic PDF extraction...');
        pdfText = await pdfProcessor.extractTextFromBuffer(buffer);
      }
    } catch (error) {
      console.error('PDF processing error:', error.message);
      // Fallback to basic extraction
      try {
        pdfText = await pdfProcessor.extractTextFromBuffer(buffer);
      } catch (extractError) {
        throw new Error(`Failed to extract text from PDF: ${extractError.message}`);
      }
    }

    // Extract data using LLM
    const llmService = new LLMService();
    const loanData = await llmService.extractLoanData(pdfText);

    // Save to database (without file path since we don't save files)
    const loan = await addLoan({
      ...loanData,
      pdfFileName: file.name,
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
