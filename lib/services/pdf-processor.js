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
    // This is a placeholder - customize based on your OCR API requirements
    try {
      const fileBuffer = await fs.readFile(filePath);
      const ocrApiUrl = process.env.LLMWHISPER_API_URL || process.env.OCR_API_URL;
      const ocrApiKey = process.env.LLMWHISPER_API_KEY || process.env.OCR_API_KEY;
      
      if (!ocrApiUrl) {
        console.warn('OCR API URL not configured, skipping OCR');
        return '';
      }

      // Create form data for file upload
      // Note: You may need to install 'form-data' package: npm install form-data
      // For now, using a simple fetch approach
      const formData = new FormData();
      const blob = new Blob([fileBuffer]);
      formData.append('file', blob, path.basename(filePath));
      
      const headers = {
        ...(ocrApiKey && { 'Authorization': `Bearer ${ocrApiKey}` }),
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
      return result.text || result.content || result.data?.text || JSON.stringify(result);
    } catch (error) {
      console.error('OCR processing failed:', error);
      // If OCR fails, return empty string to continue with basic extraction
      return '';
    }
  }
}
