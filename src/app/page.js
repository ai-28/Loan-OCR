import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Loan Document Processor
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Upload PDF loan documents and automatically extract key information using AI-powered OCR and LLM
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📄</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Upload Documents
              </h2>
              <p className="text-gray-600 mb-4">
                Upload PDF loan documents for processing
              </p>
              <Link
                href="/upload"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Upload Now
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                View Loans
              </h2>
              <p className="text-gray-600 mb-4">
                Browse and manage extracted loan data
              </p>
              <Link
                href="/loans"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                View Loans
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-left">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Features
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Automatic PDF text extraction with OCR fallback</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>AI-powered data extraction using LLM</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Extract 20+ loan fields including dates, names, and status</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Export all data to Excel format</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>RESTful API for integration</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
