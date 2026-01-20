import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs/promises';

export class ExcelService {
  constructor() {
    this.exportDir = path.join(process.cwd(), 'exports');
    this.ensureExportDir();
  }

  async ensureExportDir() {
    try {
      await fs.mkdir(this.exportDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  /**
   * Generate Excel file from loan records
   */
  async generateExcel(loans) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Loans');

    // Define columns
    worksheet.columns = [
      { header: 'Loan #', key: 'loanNumber', width: 15 },
      { header: 'Lender', key: 'lender', width: 20 },
      { header: 'Borrower', key: 'borrower', width: 20 },
      { header: 'Co-Borrower', key: 'coBorrower', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Program', key: 'program', width: 15 },
      { header: 'Closing Date', key: 'closingDate', width: 15 },
      { header: 'Loan Type', key: 'loanType', width: 15 },
      { header: 'Occupancy', key: 'occupancy', width: 15 },
      { header: 'Appraisal Ordered', key: 'appraisalOrdered', width: 18 },
      { header: 'Appraisal Due Date', key: 'appraisalDueDate', width: 18 },
      { header: 'Title Ordered', key: 'titleOrdered', width: 15 },
      { header: 'Title Company', key: 'titleCompany', width: 20 },
      { header: 'State', key: 'state', width: 10 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'Loan Officer', key: 'loanOfficer', width: 20 },
      { header: 'Lock Expiration', key: 'lockExpiration', width: 18 },
      { header: 'ICD Date', key: 'icdDate', width: 15 },
      { header: 'Intro Call', key: 'introCall', width: 15 },
      { header: 'Notes/Comments', key: 'notesComments', width: 40 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data rows
    loans.forEach((loan) => {
      worksheet.addRow({
        loanNumber: loan.loanNumber || '',
        lender: loan.lender || '',
        borrower: loan.borrower || '',
        coBorrower: loan.coBorrower || '',
        status: loan.status || '',
        program: loan.program || '',
        closingDate: loan.closingDate || '',
        loanType: loan.loanType || '',
        occupancy: loan.occupancy || '',
        appraisalOrdered: loan.appraisalOrdered || '',
        appraisalDueDate: loan.appraisalDueDate || '',
        titleOrdered: loan.titleOrdered || '',
        titleCompany: loan.titleCompany || '',
        state: loan.state || '',
        address: loan.address || '',
        loanOfficer: loan.loanOfficer || '',
        lockExpiration: loan.lockExpiration || '',
        icdDate: loan.icdDate || '',
        introCall: loan.introCall || '',
        notesComments: loan.notesComments || '',
      });
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      if (column.width) {
        column.width = Math.min(column.width || 10, 50);
      }
    });

    // Save file
    const fileName = `loans_export_${Date.now()}.xlsx`;
    const filePath = path.join(this.exportDir, fileName);
    await workbook.xlsx.writeFile(filePath);

    return filePath;
  }

  /**
   * Update existing Excel file with new loan
   */
  async appendToExcel(filePath, loan) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet('Loans') || workbook.addWorksheet('Loans');
    
    worksheet.addRow({
      loanNumber: loan.loanNumber || '',
      lender: loan.lender || '',
      borrower: loan.borrower || '',
      coBorrower: loan.coBorrower || '',
      status: loan.status || '',
      program: loan.program || '',
      closingDate: loan.closingDate || '',
      loanType: loan.loanType || '',
      occupancy: loan.occupancy || '',
      appraisalOrdered: loan.appraisalOrdered || '',
      appraisalDueDate: loan.appraisalDueDate || '',
      titleOrdered: loan.titleOrdered || '',
      titleCompany: loan.titleCompany || '',
      state: loan.state || '',
      address: loan.address || '',
      loanOfficer: loan.loanOfficer || '',
      lockExpiration: loan.lockExpiration || '',
      icdDate: loan.icdDate || '',
      introCall: loan.introCall || '',
      notesComments: loan.notesComments || '',
    });

    await workbook.xlsx.writeFile(filePath);
  }
}
