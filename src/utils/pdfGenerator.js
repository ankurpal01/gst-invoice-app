import { jsPDF } from "jspdf";
import { numberToWords } from "./numberToWords";

export function generateInvoicePDF(invoice, settings) {
  // Create jsPDF instance
  // A4 size: 210mm x 297mm
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const width = 210;
  const height = 297;
  const margin = 10;
  const contentWidth = width - 2 * margin; // 190mm (from x = 10 to x = 200)

  // Colors (tailored dark blue / teal palette matching JOSHI ENTERPRISES reference)
  const primaryColor = "#1D3B6C"; // Dark blue
  const secondaryColor = "#00828A"; // Teal
  const greyLight = "#F2F5F8"; // Light grey for table header or totals
  const borderGrey = "#666666"; // Border lines color
  const textDark = "#333333";

  // Helper to draw clean lines
  function drawLine(x1, y1, x2, y2, color = borderGrey, width = 0.2) {
    doc.setDrawColor(color);
    doc.setLineWidth(width);
    doc.line(x1, y1, x2, y2);
  }

  // Draw Main Outer Border Box
  doc.setDrawColor(borderGrey);
  doc.setLineWidth(0.4);
  doc.rect(margin, margin, contentWidth, 277, "S"); // y from 10 to 287

  // ==========================================
  // HEADER SECTION (y: 10 to 38)
  // ==========================================
  
  // Left Side: Company Name
  doc.setTextColor(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(settings.supplierName || "JOSHI ENTERPRISES", 12, 18);

  // A subtle teal decorative separator line
  drawLine(12, 20.5, 120, 20.5, secondaryColor, 0.45);

  // Supplier Address details
  doc.setTextColor(textDark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const supplierAddrLines = (settings.supplierAddress || "").split("\n");
  let addrY = 25;
  supplierAddrLines.forEach((line) => {
    doc.text(line, 12, addrY);
    addrY += 3.5;
  });
  doc.setFont("helvetica", "bold");
  doc.text(`GSTIN : ${settings.supplierGstin || "07AUQPJ4127M1Z6"}`, 12, addrY + 0.5);

  // Right Side: Beautiful Rounded Contact details box
  const hasLogo = !!settings.companyLogo;
  const cardWidth = hasLogo ? 43 : 67;

  // Draw light teal card container
  doc.setFillColor("#F0FDFA"); // 5% opacity Teal
  doc.setDrawColor("#CCFBF1"); // Soft teal border
  doc.setLineWidth(0.25);
  doc.roundedRect(129, 13, cardWidth, 23, 2, 2, "FD");

  // Contact labels & details
  doc.setTextColor(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Phone :", 133, 18.5);
  doc.text("Email :", 133, 23.5);
  doc.text("Web   :", 133, 28.5);

  doc.setTextColor(textDark);
  doc.setFont("helvetica", "normal");
  doc.text(settings.supplierPhone || "9212312312", 145, 18.5);
  doc.text(settings.supplierEmail || "info@joshienterprises.in", 145, 23.5);
  doc.text(settings.supplierWebsite || "www.joshienterprises.in", 145, 28.5);

  // Logo rendering on the right of the contact card (if uploaded)
  if (hasLogo) {
    try {
      doc.addImage(settings.companyLogo, "PNG", 178, 13, 18, 18);
      // Small logo caption
      doc.setTextColor(primaryColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text(settings.supplierName || "JOSHI ENTERPRISES", 187, 34.5, { align: "center" });
    } catch (e) {
      console.warn("Failed to load logo in PDF:", e);
    }
  }

  // Divider below header
  drawLine(margin, 43, 200, 43);

  // ==========================================
  // TAX INVOICE HEADING (y: 43 to 49)
  // ==========================================
  doc.setFillColor(greyLight);
  doc.rect(margin, 43, contentWidth, 6, "F");
  drawLine(margin, 49, 200, 49);
  
  doc.setTextColor("#000000");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("TAX INVOICE", width / 2, 47.5, { align: "center" });

  // ==========================================
  // INVOICE DETAILS ROW (y: 49 to 55)
  // ==========================================
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Invoice No. : ${invoice.invoiceNumber}`, 12, 53);
  doc.text(`Invoice Date : ${new Date(invoice.invoiceDate).toLocaleDateString("en-GB")}`, 115, 53);
  drawLine(margin, 55, 200, 55);

  // Vertical divider between supplier/customer and details
  drawLine(105, 55, 105, 90);

  // ==========================================
  // SUPPLIER & CUSTOMER BOXES (y: 55 to 90)
  // ==========================================
  
  // Left Column: SUPPLIER details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("SUPPLIER (Invoice Issuer)", 12, 60);
  drawLine(12, 61.2, 53, 61.2, borderGrey, 0.15); // Underline header

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Name    : ${settings.supplierName || "JOSHI ENTERPRISES"}`, 12, 66);
  doc.text(`GSTIN   : ${settings.supplierGstin || "07AUQPJ4127M1Z6"}`, 12, 71);
  doc.text("Address :", 12, 76);
  
  // Draw supplier address lines nicely
  const supplierLines = (settings.supplierAddress || "").split("\n");
  let supAddrY = 76;
  supplierLines.forEach((line) => {
    doc.text(line, 27, supAddrY);
    supAddrY += 4;
  });

  // Right Column: CUSTOMER details
  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER (Bill To)", 107, 60);
  drawLine(107, 61.2, 140, 61.2, borderGrey, 0.15); // Underline header

  doc.setFont("helvetica", "normal");
  doc.text(`Name    : ${invoice.customerName}`, 107, 66);
  doc.text(`GST No. : ${invoice.customerGstin}`, 107, 71);
  doc.text("Address :", 107, 76);

  // Draw customer address lines wrapped
  const customerLines = doc.splitTextToSize(invoice.customerAddress || "", 65);
  let custAddrY = 76;
  customerLines.forEach((line) => {
    doc.text(line, 122, custAddrY);
    custAddrY += 4;
  });

  // Divider above table
  drawLine(margin, 90, 200, 90);

  // ==========================================
  // ITEMS TABLE (y: 90 to 175)
  // ==========================================
  // Table columns definition:
  // Sr. No.: x = 10 to 22 (width 12)
  // Particulars: x = 22 to 135 (width 113)
  // HSN/SAC: x = 135 to 165 (width 30)
  // Amount (₹): x = 165 to 200 (width 35)

  // Header background
  doc.setFillColor(greyLight);
  doc.rect(margin, 90, contentWidth, 7, "F");
  drawLine(margin, 97, 200, 97);

  // Header labels
  doc.setTextColor("#000000");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Sr. No.", 16, 94.5, { align: "center" });
  doc.text("Particulars", 78, 94.5, { align: "center" });
  doc.text("HSN / SAC", 150, 94.5, { align: "center" });
  doc.text("Amount (Rs.)", 182.5, 94.5, { align: "center" });

  // Vertical lines of the table
  const tableTop = 90;
  const tableBottom = 168;
  drawLine(22, tableTop, 22, tableBottom);
  drawLine(135, tableTop, 135, tableBottom);
  drawLine(165, tableTop, 165, tableBottom);

  // Table rows rendering
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  
  let rowY = 102;
  const rowHeight = 6.5;

  (invoice.items || []).forEach((item, index) => {
    const srNo = String(index + 1);
    
    // Sr No center-aligned
    doc.text(srNo, 16, rowY, { align: "center" });

    // HSN/SAC center-aligned
    doc.text(item.hsnSac || "", 150, rowY, { align: "center" });

    // Amount right-aligned
    const amtStr = parseFloat(item.amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    doc.text(amtStr, 196, rowY, { align: "right" });

    // Particulars left-aligned (handled with multi-line wrapping in case it's long)
    const partLines = doc.splitTextToSize(item.particular || "", 110);
    let partY = rowY;
    partLines.forEach((line) => {
      doc.text(line, 25, partY);
      partY += 4;
    });

    // Make sure we increment rowY based on text lines or default height
    const maxLineOffset = (partLines.length - 1) * 4;
    rowY += Math.max(rowHeight, maxLineOffset + rowHeight);
  });

  // Table bottom border line
  drawLine(margin, tableBottom, 200, tableBottom);

  // ==========================================
  // TABLE TOTAL ROW (y: 168 to 174)
  // ==========================================
  doc.setFillColor(greyLight);
  doc.rect(margin, tableBottom, contentWidth, 6, "F");
  drawLine(margin, tableBottom + 6, 200, tableBottom + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Total", 78.5, tableBottom + 4.2, { align: "center" });
  
  const taxableStr = parseFloat(invoice.taxableValue || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  doc.text(taxableStr, 196, tableBottom + 4.2, { align: "right" });

  // Vertical lines for the total row
  drawLine(135, tableBottom, 135, tableBottom + 6);
  drawLine(165, tableBottom, 165, tableBottom + 6);

  // ==========================================
  // AMOUNT IN WORDS ROW (y: 174 to 180)
  // ==========================================
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Total Amount (in words) : ${invoice.amountInWords || numberToWords(invoice.grandTotal)}`, 12, 178);

  const grandTotalText = parseFloat(invoice.grandTotal || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  doc.setFont("helvetica", "bold");
  doc.text(`Total (Rs.) :    ${grandTotalText}`, 196, 178, { align: "right" });
  
  drawLine(margin, 180, 200, 180);
  // Divider before total value on the right
  drawLine(150, 174, 150, 180);

  // ==========================================
  // BOTTOM SECTIONS (y: 180 to 277)
  // ==========================================
  // Vertical split between Bottom-Left and Bottom-Right details
  // Left: x = 10 to 125, Right: x = 125 to 200
  drawLine(125, 180, 125, 287);

  // ------------------------------------------
  // BOTTOM-LEFT SECTION (y: 180 to 287)
  // ------------------------------------------
  // Terms & Conditions (shifted up since Bank Details are removed)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Terms & Conditions :", 12, 186);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("1. Goods once sold will not be taken back or exchanged.", 12, 191);
  doc.text("2. Interest @ 18% p.a. will be charged if the payment is delayed.", 12, 195);
  doc.text("3. All disputes are subject to Delhi Jurisdiction.", 12, 199);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Thank you for your business!", 12, 207);

  // QR Code section (aligned side-by-side with terms)
  if (settings.qrCodeImage) {
    try {
      doc.addImage(settings.qrCodeImage, "PNG", 92, 184, 24, 24);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text("Scan to Pay", 104, 211.5, { align: "center" });
    } catch (e) {
      console.warn("Failed to load QR code in PDF:", e);
    }
  }

  // ------------------------------------------
  // BOTTOM-RIGHT SECTION (y: 180 to 287)
  // ------------------------------------------
  
  // Tax details block
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  
  doc.text("Taxable Value", 128, 186);
  doc.text(":", 168, 186);
  doc.text(taxableStr, 196, 186, { align: "right" });

  const igstAmtStr = parseFloat(invoice.igstAmount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  doc.text(`IGST @ ${invoice.igstRate}%`, 128, 192);
  doc.text(":", 168, 192);
  doc.text(igstAmtStr, 196, 192, { align: "right" });

  doc.text("Total Tax", 128, 198);
  doc.text(":", 168, 198);
  doc.text(igstAmtStr, 196, 198, { align: "right" });

  drawLine(125, 202, 200, 202);

  // Grand Total Box
  doc.setFillColor(greyLight);
  doc.rect(125, 202, 75, 8, "F");
  drawLine(125, 210, 200, 210);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("Grand Total (Rs.)", 128, 207.5);
  doc.text(":", 168, 207.5);
  doc.text(grandTotalText, 196, 207.5, { align: "right" });

  // Authorized Signatory Box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(`For ${settings.supplierName || "JOSHI ENTERPRISES"}`, 162.5, 218, { align: "center" });

  // Signature image rendering if exists (shifted down closer to line to look hand-signed)
  if (settings.signatureImage) {
    try {
      doc.addImage(settings.signatureImage, "PNG", 145, 224, 35, 17);
    } catch (e) {
      console.warn("Failed to load signature image in PDF:", e);
    }
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Authorised Signatory", 162.5, 245, { align: "center" });

  // ==========================================
  // FOOTER (y: 287 to 297)
  // ==========================================
  doc.setTextColor("#777777");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("This is a computer generated invoice.", width / 2, 292, { align: "center" });

  // Save the PDF / Get Blob URL
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  return {
    blob: pdfBlob,
    url: pdfUrl,
    filename: `${invoice.invoiceNumber || "INVOICE"}.pdf`,
    download: () => {
      doc.save(`${invoice.invoiceNumber || "INVOICE"}.pdf`);
    }
  };
}
