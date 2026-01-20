# Loan Document Processor

A Next.js application that processes loan PDF documents, extracts key information using AI-powered OCR and LLM, and exports data to Excel.

## Features

- 📄 **PDF Upload**: Upload loan documents in PDF format
- 🔍 **OCR Processing**: Automatic text extraction with LLMWhisper OCR fallback
- 🤖 **AI Extraction**: Uses LLM to extract 20+ loan fields from documents
- 💾 **Data Storage**: JSON-based file storage (no database required)
- 📊 **Excel Export**: Export all loan data to Excel format
- 🔌 **RESTful API**: Full API for integration with other systems

## Extracted Fields

The system extracts the following fields from loan documents:

- Loan #
- Lender
- Borrower
- Co-Borrower
- Status
- Program
- Closing Date
- Loan Type
- Occupancy
- Appraisal Ordered
- Appraisal Due Date
- Title Ordered
- Title Company
- State
- Address
- Loan Officer
- Lock Expiration
- ICD Date
- Intro Call
- Notes/Comments

## Getting Started

### Prerequisites

- Node.js 18+ installed
- LLM API key (OpenAI, Anthropic, or compatible API)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:
```
LLM_API_KEY=your-api-key-here
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_MODEL=gpt-4o-mini
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
my-app/
├── src/
│   └── app/
│       ├── api/
│       │   ├── upload/          # PDF upload endpoint
│       │   ├── loans/           # Loan CRUD endpoints
│       │   └── export/          # Excel export endpoint
│       ├── upload/              # Upload page
│       ├── loans/               # Loans list page
│       └── page.js              # Home page
├── lib/
│   └── services/
│       ├── pdf-processor.js     # PDF text extraction
│       ├── llm-service.js       # LLM data extraction
│       ├── excel-service.js     # Excel generation
│       └── db-service.js        # JSON file storage
├── uploads/                     # Uploaded PDFs (gitignored)
├── exports/                     # Generated Excel files (gitignored)
└── data/                        # JSON data storage (gitignored)
```

## API Endpoints

### Upload PDF
```
POST /api/upload
Content-Type: multipart/form-data
Body: { file: File }
```

### Get All Loans
```
GET /api/loans?page=1&limit=50
```

### Get Single Loan
```
GET /api/loans/[id]
```

### Update Loan
```
PUT /api/loans/[id]
Body: { ...loanFields }
```

### Delete Loan
```
DELETE /api/loans/[id]
```

### Export to Excel
```
GET /api/export
```

## Configuration

### LLM Integration

The system uses LLM APIs to extract structured data from PDF text. Supported providers:

- OpenAI (default)
- Anthropic Claude
- Any compatible OpenAI API endpoint

Configure in `.env.local`:
```
LLM_API_KEY=your-key
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_MODEL=gpt-4o-mini
```

### OCR Integration

For PDFs with scanned images, configure LLMWhisper OCR:

```
LLMWHISPER_API_KEY=your-ocr-key
LLMWHISPER_API_URL=https://your-ocr-endpoint.com/api/ocr
```

## Usage

1. **Upload a PDF**: Navigate to `/upload` and select a loan document PDF
2. **View Results**: The system will extract data and redirect to `/loans`
3. **Export Data**: Click "Export to Excel" to download all loan data
4. **Manage Loans**: View, edit, or delete loan records from the loans page

## Data Storage

The application uses JSON file storage located in `data/loans.json`. This file is automatically created and managed by the application.

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Technologies Used

- **Next.js 16** - React framework
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **pdf-parse** - PDF text extraction
- **exceljs** - Excel file generation
- **LLM APIs** - AI-powered data extraction

## License

MIT
