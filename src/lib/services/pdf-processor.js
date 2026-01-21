import pdf from 'pdf-parse';

export class PDFProcessor {
  /**
   * Extract text from PDF buffer
   */
  async extractTextFromBuffer(buffer) {
    try {
      const data = await pdf(buffer);
      return data.text;
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  /**
   * Process PDF with OCR if needed (using LLMWhisper)
   * Works directly with buffer - no file system needed
   */
  async processWithOCR(buffer, filename) {
    // First try text extraction from buffer
    let text = await this.extractTextFromBuffer(buffer);

    // If text is minimal or empty, use OCR
    if (text.trim().length < 100) {
      // Integrate with LLMWhisper OCR here
      text = await this.runOCRFromBuffer(buffer, filename);
    }

    return text;
  }

  async runOCRFromBuffer(buffer, filename) {
    // Integrate with LLMWhisper OCR API
    // Works directly with buffer - no file system needed
    try {
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

      // Use base64 encoding for file upload directly from buffer
      const base64 = buffer.toString('base64');
      const response = await fetch(ocrApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(ocrApiKey && { 'Authorization': `Bearer ${ocrApiKey}` }),
        },
        body: JSON.stringify({
          file: base64,
          filename: filename,
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
