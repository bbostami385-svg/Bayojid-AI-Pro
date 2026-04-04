import { jsPDF } from "jspdf";
import { formatCurrency, SupportedCurrency } from "./currencyService";

interface ReceiptData {
  receiptNumber: string;
  date: Date;
  userName: string;
  userEmail: string;
  transactionId: string;
  paymentMethod: "stripe" | "sslcommerz";
  amount: number;
  currency: SupportedCurrency;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  status: "completed" | "pending" | "failed";
  invoiceUrl?: string;
  companyName?: string;
  companyLogo?: string;
  notes?: string;
}

/**
 * Generate payment receipt as PDF
 */
export async function generateReceiptPDF(data: ReceiptData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Set default font
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  // Header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("RECEIPT", margin, yPosition);
  yPosition += 12;

  // Company info
  if (data.companyName) {
    doc.setFontSize(12);
    doc.text(data.companyName, margin, yPosition);
    yPosition += 6;
  }

  // Receipt info box
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin, yPosition, contentWidth, 25);

  const infoX = margin + 5;
  const infoY = yPosition + 5;
  doc.text(`Receipt #: ${data.receiptNumber}`, infoX, infoY);
  doc.text(`Date: ${data.date.toLocaleDateString()}`, infoX + contentWidth / 2, infoY);
  doc.text(`Transaction ID: ${data.transactionId}`, infoX, infoY + 6);
  doc.text(
    `Status: ${data.status.toUpperCase()}`,
    infoX + contentWidth / 2,
    infoY + 6
  );
  doc.text(`Payment Method: ${data.paymentMethod.toUpperCase()}`, infoX, infoY + 12);

  yPosition += 32;

  // Customer info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("BILL TO:", margin, yPosition);
  yPosition += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(data.userName, margin, yPosition);
  yPosition += 5;
  doc.text(data.userEmail, margin, yPosition);
  yPosition += 10;

  // Items table header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setDrawColor(100, 100, 100);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 2;

  const col1X = margin;
  const col2X = margin + 80;
  const col3X = margin + 110;
  const col4X = margin + 140;

  doc.text("Description", col1X, yPosition);
  doc.text("Qty", col2X, yPosition);
  doc.text("Unit Price", col3X, yPosition);
  doc.text("Total", col4X, yPosition);
  yPosition += 6;

  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 4;

  // Items
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  for (const item of data.items) {
    doc.text(item.description, col1X, yPosition);
    doc.text(item.quantity.toString(), col2X, yPosition);
    doc.text(formatCurrency(item.unitPrice, data.currency), col3X, yPosition);
    doc.text(formatCurrency(item.total, data.currency), col4X, yPosition);
    yPosition += 6;
  }

  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 4;

  // Totals section
  const totalsX = col3X;
  const totalsValueX = col4X;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  doc.text("Subtotal:", totalsX, yPosition);
  doc.text(formatCurrency(data.subtotal, data.currency), totalsValueX, yPosition);
  yPosition += 6;

  if (data.tax && data.tax > 0) {
    doc.text("Tax:", totalsX, yPosition);
    doc.text(formatCurrency(data.tax, data.currency), totalsValueX, yPosition);
    yPosition += 6;
  }

  if (data.discount && data.discount > 0) {
    doc.text("Discount:", totalsX, yPosition);
    doc.text(`-${formatCurrency(data.discount, data.currency)}`, totalsValueX, yPosition);
    yPosition += 6;
  }

  // Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setDrawColor(100, 100, 100);
  doc.line(totalsX - 5, yPosition - 2, pageWidth - margin, yPosition - 2);

  doc.text("TOTAL:", totalsX, yPosition);
  doc.text(formatCurrency(data.total, data.currency), totalsValueX, yPosition);
  yPosition += 8;

  doc.line(totalsX - 5, yPosition - 2, pageWidth - margin, yPosition - 2);
  yPosition += 8;

  // Notes
  if (data.notes) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Notes:", margin, yPosition);
    yPosition += 4;

    const noteLines = doc.splitTextToSize(data.notes, contentWidth - 10);
    doc.text(noteLines, margin + 5, yPosition);
    yPosition += noteLines.length * 4 + 4;
  }

  // Footer
  yPosition = pageHeight - 20;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Thank you for your business! This is an electronically generated receipt.",
    pageWidth / 2,
    yPosition,
    { align: "center" }
  );
  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    pageWidth / 2,
    yPosition + 5,
    { align: "center" }
  );

  return Buffer.from(doc.output("arraybuffer"));
}

/**
 * Generate receipt filename
 */
export function generateReceiptFilename(receiptNumber: string): string {
  const date = new Date().toISOString().split("T")[0];
  return `receipt-${receiptNumber}-${date}.pdf`;
}

/**
 * Generate receipt data from payment info
 */
export function createReceiptData(
  payment: any,
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }> = []
): ReceiptData {
  const itemsWithTotal = items.map((item) => ({
    ...item,
    total: item.quantity * item.unitPrice,
  }));

  const subtotal = itemsWithTotal.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return {
    receiptNumber: `RCP-${payment.id}-${Date.now()}`,
    date: new Date(payment.createdAt),
    userName: payment.userName,
    userEmail: payment.userEmail,
    transactionId: payment.transactionId,
    paymentMethod: payment.paymentMethod,
    amount: payment.amount,
    currency: payment.currency,
    items: itemsWithTotal,
    subtotal,
    tax,
    total,
    status: payment.status,
    companyName: "Bayojid AI Pro",
    notes: "Thank you for your purchase. Your access will be activated immediately.",
  };
}
