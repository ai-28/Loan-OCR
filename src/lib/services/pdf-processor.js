import pdf from 'pdf-parse';
import fs from 'fs/promises';
import path from 'path';

export class PDFProcessor {
  /**
   * Extract text from PDF file
   */
  async extractText(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  /**
   * Process PDF with OCR if needed (using LLMWhisper)
   */
  async processWithOCR(filePath) {
    // First try text extraction
    let text = await this.extractText(filePath);

    // If text is minimal or empty, use OCR
    if (text.trim().length < 100) {
      // Integrate with LLMWhisper OCR here
      text = await this.runOCR(filePath);
    }

    return text;
  }

  async runOCR(filePath) {
    // Integrate with LLMWhisper OCR API
    // Customize this method based on your OCR API requirements
    try {
      const fileBuffer = await fs.readFile(filePath);
      const ocrApiUrl = process.env.LLMWHISPER_API_URL || process.env.OCR_API_URL;
      const ocrApiKey = process.env.LLMWHISPER_API_KEY || process.env.OCR_API_KEY;

      if (!ocrApiUrl) {
        console.warn('OCR API URL not configured, skipping OCR');
        return '';
      }

      // Validate URL is not pointing to localhost:3000 (Next.js server)
      if (ocrApiUrl.includes('localhost:3000') || ocrApiUrl.includes('127.0.0.1:3000')) {
        console.warn('OCR API URL appears to be pointing to Next.js server. Please configure your LLMWhisper service URL.');
        return '';
      }

      // Use base64 encoding for file upload
      const base64 = fileBuffer.toString('base64');
      const response = await fetch(ocrApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(ocrApiKey && { 'Authorization': `Bearer ${ocrApiKey}` }),
        },
        body: JSON.stringify({
          file: base64,
          filename: path.basename(filePath),
        }),
      });

      if (!response.ok) {
        throw new Error(`OCR API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.text || result.content || result.data?.text || '';
    } catch (error) {
      // Log error but don't throw - allow fallback to basic extraction
      if (error.code === 'EACCES' || error.code === 'ECONNREFUSED') {
        console.warn(`OCR service unavailable at ${process.env.LLMWHISPER_API_URL || process.env.OCR_API_URL}. Using basic PDF extraction.`);
      } else {
        console.warn('OCR processing failed:', error.message || error);
      }
      // Return empty string to continue with basic extraction
      return '';
    }
  }
}
