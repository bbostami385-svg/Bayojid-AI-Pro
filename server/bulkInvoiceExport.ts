import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { createObjectCsvWriter } from 'csv-writer';
import * as fs from 'fs';
import * as path from 'path';

/**
 * বাল্ক ইনভয়েস এক্সপোর্ট সিস্টেম
 * একাধিক ইনভয়েস PDF বা CSV হিসেবে ডাউনলোড করুন
 */

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: Date;
  amount: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending' | 'failed';
  paymentMethod: string;
  description: string;
  userId: string;
  userEmail: string;
  userName: string;
}

/**
 * একক ইনভয়েস PDF তৈরি করুন
 */
export async function generateInvoicePDF(invoice: Invoice): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();

  const fontSize = 12;
  const smallFontSize = 10;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let yPosition = height - 50;

  // শিরোনাম
  page.drawText('INVOICE', {
    x: 50,
    y: yPosition,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0)
  });

  yPosition -= 40;

  // কোম্পানি তথ্য
  page.drawText('Bayojid AI Pro', {
    x: 50,
    y: yPosition,
    size: fontSize,
    font: boldFont
  });

  yPosition -= 20;
  page.drawText('Email: support@bayojidai.com', {
    x: 50,
    y: yPosition,
    size: smallFontSize,
    font
  });

  yPosition -= 15;
  page.drawText('Website: www.bayojidai.com', {
    x: 50,
    y: yPosition,
    size: smallFontSize,
    font
  });

  yPosition -= 40;

  // ইনভয়েস বিবরণ
  page.drawText(`Invoice #: ${invoice.invoiceNumber}`, {
    x: 50,
    y: yPosition,
    size: fontSize,
    font: boldFont
  });

  yPosition -= 20;
  page.drawText(`Date: ${invoice.date.toLocaleDateString('bn-BD')}`, {
    x: 50,
    y: yPosition,
    size: smallFontSize,
    font
  });

  yPosition -= 15;
  page.drawText(`Status: ${invoice.status.toUpperCase()}`, {
    x: 50,
    y: yPosition,
    size: smallFontSize,
    font,
    color: invoice.status === 'paid' ? rgb(0, 128, 0) : rgb(255, 0, 0)
  });

  yPosition -= 40;

  // বিল প্রাপক
  page.drawText('BILL TO:', {
    x: 50,
    y: yPosition,
    size: fontSize,
    font: boldFont
  });

  yPosition -= 20;
  page.drawText(invoice.userName, {
    x: 50,
    y: yPosition,
    size: smallFontSize,
    font
  });

  yPosition -= 15;
  page.drawText(invoice.userEmail, {
    x: 50,
    y: yPosition,
    size: smallFontSize,
    font
  });

  yPosition -= 40;

  // বিবরণ টেবিল
  const tableTop = yPosition;
  const colWidth = (width - 100) / 4;

  // টেবিল হেডার
  page.drawText('Description', { x: 50, y: tableTop, size: smallFontSize, font: boldFont });
  page.drawText('Amount', { x: 50 + colWidth, y: tableTop, size: smallFontSize, font: boldFont });
  page.drawText('Tax', { x: 50 + colWidth * 2, y: tableTop, size: smallFontSize, font: boldFont });
  page.drawText('Total', { x: 50 + colWidth * 3, y: tableTop, size: smallFontSize, font: boldFont });

  yPosition -= 25;

  // টেবিল সামগ্রী
  page.drawText(invoice.description, { x: 50, y: yPosition, size: smallFontSize, font });
  page.drawText(`৳${invoice.amount.toFixed(2)}`, { x: 50 + colWidth, y: yPosition, size: smallFontSize, font });
  page.drawText(`৳${invoice.tax.toFixed(2)}`, { x: 50 + colWidth * 2, y: yPosition, size: smallFontSize, font });
  page.drawText(`৳${invoice.total.toFixed(2)}`, { x: 50 + colWidth * 3, y: yPosition, size: smallFontSize, font });

  yPosition -= 40;

  // মোট
  page.drawText('TOTAL:', {
    x: 50 + colWidth * 2,
    y: yPosition,
    size: fontSize,
    font: boldFont
  });
  page.drawText(`৳${invoice.total.toFixed(2)}`, {
    x: 50 + colWidth * 3,
    y: yPosition,
    size: fontSize,
    font: boldFont
  });

  yPosition -= 40;

  // পেমেন্ট পদ্ধতি
  page.drawText(`Payment Method: ${invoice.paymentMethod}`, {
    x: 50,
    y: yPosition,
    size: smallFontSize,
    font
  });

  yPosition -= 20;
  page.drawText('Thank you for your business!', {
    x: 50,
    y: yPosition,
    size: smallFontSize,
    font
  });

  return Buffer.from(await pdfDoc.save());
}

/**
 * মাল্টি-পেজ PDF তৈরি করুন (একাধিক ইনভয়েস)
 */
export async function generateBulkInvoicesPDF(invoices: Invoice[]): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  for (const invoice of invoices) {
    const singlePDF = await generateInvoicePDF(invoice);
    const embeddedPDF = await PDFDocument.load(singlePDF);
    const pages = embeddedPDF.getPages();
    for (const page of pages) {
      pdfDoc.addPage(page);
    }
  }

  return Buffer.from(await pdfDoc.save());
}

/**
 * ইনভয়েস CSV এক্সপোর্ট করুন
 */
export async function generateInvoicesCSV(invoices: Invoice[]): Promise<string> {
  const csvWriter = createObjectCsvWriter({
    path: '/tmp/invoices.csv',
    header: [
      { id: 'invoiceNumber', title: 'Invoice #' },
      { id: 'date', title: 'Date' },
      { id: 'userName', title: 'Customer Name' },
      { id: 'userEmail', title: 'Email' },
      { id: 'description', title: 'Description' },
      { id: 'amount', title: 'Amount' },
      { id: 'tax', title: 'Tax' },
      { id: 'total', title: 'Total' },
      { id: 'status', title: 'Status' },
      { id: 'paymentMethod', title: 'Payment Method' }
    ]
  });

  const records = invoices.map(inv => ({
    invoiceNumber: inv.invoiceNumber,
    date: inv.date.toLocaleDateString('bn-BD'),
    userName: inv.userName,
    userEmail: inv.userEmail,
    description: inv.description,
    amount: inv.amount.toFixed(2),
    tax: inv.tax.toFixed(2),
    total: inv.total.toFixed(2),
    status: inv.status,
    paymentMethod: inv.paymentMethod
  }));

  await csvWriter.writeRecords(records);
  return fs.readFileSync('/tmp/invoices.csv', 'utf-8');
}

/**
 * ইনভয়েস এক্সপোর্ট অপশন
 */
export type ExportFormat = 'pdf' | 'csv' | 'both';

/**
 * বাল্ক এক্সপোর্ট করুন
 */
export async function exportInvoices(
  invoices: Invoice[],
  format: ExportFormat = 'pdf'
): Promise<{ pdf?: Buffer; csv?: string; filename: string }> {
  const timestamp = new Date().toISOString().split('T')[0];
  const result: { pdf?: Buffer; csv?: string; filename: string } = {
    filename: `invoices_${timestamp}`
  };

  if (format === 'pdf' || format === 'both') {
    result.pdf = await generateBulkInvoicesPDF(invoices);
  }

  if (format === 'csv' || format === 'both') {
    result.csv = await generateInvoicesCSV(invoices);
  }

  return result;
}

/**
 * ইনভয়েস ফিল্টারিং এবং সার্চিং
 */
export function filterInvoices(
  invoices: Invoice[],
  filters: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    searchTerm?: string;
  }
): Invoice[] {
  return invoices.filter(invoice => {
    if (filters.status && invoice.status !== filters.status) return false;
    if (filters.startDate && invoice.date < filters.startDate) return false;
    if (filters.endDate && invoice.date > filters.endDate) return false;
    if (filters.minAmount && invoice.total < filters.minAmount) return false;
    if (filters.maxAmount && invoice.total > filters.maxAmount) return false;
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      return (
        invoice.invoiceNumber.toLowerCase().includes(term) ||
        invoice.userName.toLowerCase().includes(term) ||
        invoice.userEmail.toLowerCase().includes(term)
      );
    }
    return true;
  });
}

/**
 * ইনভয়েস সারাংশ তৈরি করুন
 */
export function generateInvoiceSummary(invoices: Invoice[]): {
  totalInvoices: number;
  totalAmount: number;
  totalTax: number;
  totalCollected: number;
  paidCount: number;
  pendingCount: number;
  failedCount: number;
} {
  return {
    totalInvoices: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    totalTax: invoices.reduce((sum, inv) => sum + inv.tax, 0),
    totalCollected: invoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.total : 0), 0),
    paidCount: invoices.filter(inv => inv.status === 'paid').length,
    pendingCount: invoices.filter(inv => inv.status === 'pending').length,
    failedCount: invoices.filter(inv => inv.status === 'failed').length
  };
}
