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

      // For Node.js, you may need to use form-data package
      // Install: npm install form-data
      // Example implementation:
      let FormData;
      try {
        FormData = (await import('form-data')).default;
      } catch {
        // If form-data is not available, use base64 encoding
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
          throw new Error(`OCR API error: ${response.statusText}`);
        }

        const result = await response.json();
        return result.text || result.content || result.data?.text || '';
      }

      // If form-data is available, use it
      const formData = new FormData();
      formData.append('file', fileBuffer, path.basename(filePath));
      
      const headers = {
        ...(ocrApiKey && { 'Authorization': `Bearer ${ocrApiKey}` }),
        ...formData.getHeaders(),
      };

      const response = await fetch(ocrApiUrl, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`OCR API error: ${response.statusText}`);
      }

      const result = await response.json();
      return result.text || result.content || result.data?.text || '';
    } catch (error) {
      console.error('OCR processing failed:', error);
      // If OCR fails, return empty string to continue with basic extraction
      return '';
    }
  }
}
