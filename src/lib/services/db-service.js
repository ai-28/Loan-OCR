import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'loans.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

// Read all loans from JSON file
export async function getAllLoans() {
  await ensureDataDir();
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Save loans to JSON file
async function saveLoans(loans) {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(loans, null, 2), 'utf-8');
}

// Add a new loan
export async function addLoan(loanData) {
  const loans = await getAllLoans();
  const newLoan = {
    id: `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...loanData,
    extractedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  loans.push(newLoan);
  await saveLoans(loans);
  return newLoan;
}

// Get loan by ID
export async function getLoanById(id) {
  const loans = await getAllLoans();
  return loans.find(loan => loan.id === id);
}

// Update loan
export async function updateLoan(id, updates) {
  const loans = await getAllLoans();
  const index = loans.findIndex(loan => loan.id === id);
  if (index === -1) {
    throw new Error('Loan not found');
  }
  loans[index] = {
    ...loans[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await saveLoans(loans);
  return loans[index];
}

// Delete loan
export async function deleteLoan(id) {
  const loans = await getAllLoans();
  const filteredLoans = loans.filter(loan => loan.id !== id);
  if (filteredLoans.length === loans.length) {
    throw new Error('Loan not found');
  }
  await saveLoans(filteredLoans);
  return true;
}

// Get loans with pagination
export async function getLoansPaginated(page = 1, limit = 50) {
  const loans = await getAllLoans();
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedLoans = loans.slice(startIndex, endIndex);
  
  return {
    loans: paginatedLoans,
    pagination: {
      page,
      limit,
      total: loans.length,
      totalPages: Math.ceil(loans.length / limit),
    },
  };
}
