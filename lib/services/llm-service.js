export class LLMService {
  constructor() {
    this.apiKey = process.env.LLM_API_KEY || '';
    this.apiUrl = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
  }

  /**
   * Extract loan data from PDF text using LLM
   */
  async extractLoanData(pdfText) {
    const prompt = this.buildExtractionPrompt(pdfText);
    
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.LLM_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert at extracting loan information from documents. Extract the following fields and return ONLY valid JSON. Use null for missing values.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`LLM API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const extracted = JSON.parse(data.choices[0].message.content);
      
      return this.validateAndFormat(extracted);
    } catch (error) {
      throw new Error(`LLM extraction failed: ${error.message}`);
    }
  }

  buildExtractionPrompt(pdfText) {
    return `Extract the following loan information from this document text. Return a JSON object with these exact field names (use null for missing values):

{
  "loanNumber": "string or null",
  "lender": "string or null",
  "borrower": "string or null",
  "coBorrower": "string or null",
  "status": "string or null",
  "program": "string or null",
  "closingDate": "YYYY-MM-DD or null",
  "loanType": "string or null",
  "occupancy": "string or null",
  "appraisalOrdered": "YYYY-MM-DD or null",
  "appraisalDueDate": "YYYY-MM-DD or null",
  "titleOrdered": "YYYY-MM-DD or null",
  "titleCompany": "string or null",
  "state": "string or null",
  "address": "string or null",
  "loanOfficer": "string or null",
  "lockExpiration": "YYYY-MM-DD or null",
  "icdDate": "YYYY-MM-DD or null",
  "introCall": "YYYY-MM-DD or null",
  "notesComments": "string or null"
}

Document text:
${pdfText.substring(0, 8000)}`;
  }

  validateAndFormat(data) {
    // Parse dates and validate
    const formatDate = (dateStr) => {
      if (!dateStr || dateStr === 'null') return null;
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        return date.toISOString().split('T')[0];
      } catch {
        return null;
      }
    };

    return {
      loanNumber: data.loanNumber || null,
      lender: data.lender || null,
      borrower: data.borrower || null,
      coBorrower: data.coBorrower || null,
      status: data.status || null,
      program: data.program || null,
      closingDate: formatDate(data.closingDate),
      loanType: data.loanType || null,
      occupancy: data.occupancy || null,
      appraisalOrdered: formatDate(data.appraisalOrdered),
      appraisalDueDate: formatDate(data.appraisalDueDate),
      titleOrdered: formatDate(data.titleOrdered),
      titleCompany: data.titleCompany || null,
      state: data.state || null,
      address: data.address || null,
      loanOfficer: data.loanOfficer || null,
      lockExpiration: formatDate(data.lockExpiration),
      icdDate: formatDate(data.icdDate),
      introCall: formatDate(data.introCall),
      notesComments: data.notesComments || null,
    };
  }
}
