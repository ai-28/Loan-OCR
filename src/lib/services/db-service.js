import postgres from 'postgres';

// Configure postgres connection for Neon
// Neon requires SSL connections and has connection limits
const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  console.warn('POSTGRES_URL environment variable is not set');
}

// Check if connection string already includes SSL mode
const hasSSLMode = connectionString?.includes('sslmode=');

export const sql = postgres(connectionString, {
  // Only set SSL if not already in connection string
  ...(hasSSLMode ? {} : { ssl: 'require' }),
  max: 10, // Maximum number of connections in the pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 30, // Connection timeout in seconds (increased for Neon)
  onnotice: () => { }, // Suppress notices
});

// Helper function to convert database row to camelCase
function rowToLoan(loan) {
  return {
    id: loan.id,
    loanNumber: loan.loan_number,
    lender: loan.lender,
    borrower: loan.borrower,
    coBorrower: loan.co_borrower,
    status: loan.status,
    program: loan.program,
    closingDate: loan.closing_date,
    loanType: loan.loan_type,
    occupancy: loan.occupancy,
    appraisalOrdered: loan.appraisal_ordered,
    appraisalDueDate: loan.appraisal_due_date,
    titleOrdered: loan.title_ordered,
    titleCompany: loan.title_company,
    state: loan.state,
    address: loan.address,
    loanOfficer: loan.loan_officer,
    lockExpiration: loan.lock_expiration,
    icdDate: loan.icd_date,
    introCall: loan.intro_call,
    notesComments: loan.notes_comments,
    pdfFileName: loan.pdf_file_name,
    extractedAt: loan.extracted_at,
    createdAt: loan.created_at,
    updatedAt: loan.updated_at,
  };
}

// Read all loans from Postgres
export async function getAllLoans() {
  try {
    const loans = await sql`
      SELECT * FROM loans 
      ORDER BY created_at DESC
    `;
    return loans.map(rowToLoan);
  } catch (error) {
    console.error('Error reading loans from Postgres:', error);
    return [];
  }
}

// Add a new loan
export async function addLoan(loanData) {
  const id = `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  try {
    const [loan] = await sql`
      INSERT INTO loans (
        id, loan_number, lender, borrower, co_borrower, status, program,
        closing_date, loan_type, occupancy, appraisal_ordered, appraisal_due_date,
        title_ordered, title_company, state, address, loan_officer,
        lock_expiration, icd_date, intro_call, notes_comments, pdf_file_name,
        extracted_at, created_at, updated_at
      ) VALUES (
        ${id},
        ${loanData.loanNumber || null},
        ${loanData.lender || null},
        ${loanData.borrower || null},
        ${loanData.coBorrower || null},
        ${loanData.status || null},
        ${loanData.program || null},
        ${loanData.closingDate || null},
        ${loanData.loanType || null},
        ${loanData.occupancy || null},
        ${loanData.appraisalOrdered || null},
        ${loanData.appraisalDueDate || null},
        ${loanData.titleOrdered || null},
        ${loanData.titleCompany || null},
        ${loanData.state || null},
        ${loanData.address || null},
        ${loanData.loanOfficer || null},
        ${loanData.lockExpiration || null},
        ${loanData.icdDate || null},
        ${loanData.introCall || null},
        ${loanData.notesComments || null},
        ${loanData.pdfFileName || null},
        ${now},
        ${now},
        ${now}
      )
      RETURNING *
    `;

    return rowToLoan(loan);
  } catch (error) {
    console.error('Error adding loan to Postgres:', error);
    console.error('Connection string present:', !!process.env.POSTGRES_URL);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      errno: error.errno,
    });

    // Provide more helpful error messages
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new Error('Database connection timeout. Please check: 1) POSTGRES_URL is correct, 2) Database is accessible, 3) Network/firewall settings');
    }
    if (error.code === 'ENOTFOUND') {
      throw new Error('Database host not found. Please check your POSTGRES_URL connection string');
    }
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Database connection refused. Please check: 1) Database is running, 2) Connection string is correct');
    }

    throw new Error(`Failed to add loan: ${error.message}`);
  }
}

// Get loan by ID
export async function getLoanById(id) {
  try {
    const [loan] = await sql`
      SELECT * FROM loans WHERE id = ${id}
    `;

    if (!loan) {
      return null;
    }

    return rowToLoan(loan);
  } catch (error) {
    console.error('Error getting loan from Postgres:', error);
    throw new Error('Failed to get loan');
  }
}

// Update loan
export async function updateLoan(id, updates) {
  const now = new Date().toISOString();

  const fieldMap = {
    loanNumber: 'loan_number',
    lender: 'lender',
    borrower: 'borrower',
    coBorrower: 'co_borrower',
    status: 'status',
    program: 'program',
    closingDate: 'closing_date',
    loanType: 'loan_type',
    occupancy: 'occupancy',
    appraisalOrdered: 'appraisal_ordered',
    appraisalDueDate: 'appraisal_due_date',
    titleOrdered: 'title_ordered',
    titleCompany: 'title_company',
    state: 'state',
    address: 'address',
    loanOfficer: 'loan_officer',
    lockExpiration: 'lock_expiration',
    icdDate: 'icd_date',
    introCall: 'intro_call',
    notesComments: 'notes_comments',
    pdfFileName: 'pdf_file_name',
  };

  // Build SET clause parts
  const setParts = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (fieldMap[key]) {
      setParts.push(`${fieldMap[key]} = $${setParts.length + 1}`);
      values.push(value);
    }
  }

  if (setParts.length === 0) {
    throw new Error('No valid fields to update');
  }

  // Add updated_at
  setParts.push(`updated_at = $${setParts.length + 1}`);
  values.push(now);

  // Add id for WHERE clause
  values.push(id);

  try {
    // Use sql.unsafe for dynamic queries
    const query = `
      UPDATE loans 
      SET ${setParts.join(', ')}
      WHERE id = $${values.length}
      RETURNING *
    `;

    const [loan] = await sql.unsafe(query, values);

    if (!loan) {
      throw new Error('Loan not found');
    }

    return rowToLoan(loan);
  } catch (error) {
    console.error('Error updating loan in Postgres:', error);
    throw new Error('Failed to update loan');
  }
}

// Delete loan
export async function deleteLoan(id) {
  try {
    const [result] = await sql`
      DELETE FROM loans WHERE id = ${id} RETURNING id
    `;

    if (!result) {
      throw new Error('Loan not found');
    }

    return true;
  } catch (error) {
    console.error('Error deleting loan from Postgres:', error);
    throw new Error('Failed to delete loan');
  }
}

// Get loans with pagination
export async function getLoansPaginated(page = 1, limit = 50) {
  try {
    const offset = (page - 1) * limit;

    // Get total count
    const [{ count }] = await sql`
      SELECT COUNT(*) as count FROM loans
    `;
    const total = parseInt(count);

    // Get paginated loans
    const loans = await sql`
      SELECT * FROM loans 
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return {
      loans: loans.map(rowToLoan),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error getting paginated loans from Postgres:', error);
    throw new Error('Failed to get loans');
  }
}
