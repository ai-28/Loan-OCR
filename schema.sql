-- Create loans table for Neon PostgreSQL
CREATE TABLE IF NOT EXISTS loans (
  id VARCHAR(255) PRIMARY KEY,
  loan_number VARCHAR(255),
  lender VARCHAR(255),
  borrower VARCHAR(255),
  co_borrower VARCHAR(255),
  status VARCHAR(255),
  program VARCHAR(255),
  closing_date DATE,
  loan_type VARCHAR(255),
  occupancy VARCHAR(255),
  appraisal_ordered DATE,
  appraisal_due_date DATE,
  title_ordered DATE,
  title_company VARCHAR(255),
  state VARCHAR(255),
  address TEXT,
  loan_officer VARCHAR(255),
  lock_expiration DATE,
  icd_date DATE,
  intro_call DATE,
  notes_comments TEXT,
  pdf_file_name VARCHAR(255),
  extracted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_loan_number ON loans(loan_number);
CREATE INDEX IF NOT EXISTS idx_created_at ON loans(created_at);
CREATE INDEX IF NOT EXISTS idx_borrower ON loans(borrower);
