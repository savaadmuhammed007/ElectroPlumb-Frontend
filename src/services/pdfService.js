import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateA4PDF = (listData, userProfile) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const worker = userProfile || {};
  const workerName = worker.user?.first_name 
    ? `${worker.user.first_name} ${worker.user.last_name || ''}`.trim() 
    : worker.user?.username || 'Electrical & Plumbing Specialist';
  const businessName = worker.profile?.business_name || `${workerName} Technical Services`;
  const workerPhone = worker.profile?.phone || 'N/A';
  const workerEmail = worker.user?.email || '';
  const workerAddress = [worker.profile?.address, worker.profile?.city, worker.profile?.state, worker.profile?.pin_code]
    .filter(Boolean)
    .join(', ');

  const primaryColor = listData.list_type === 'plumbing' ? [13, 148, 136] : [217, 119, 6]; // Teal vs Amber

  // 1. Header & Business Branding Box
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 36, 'F');

  // Business Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(businessName.toUpperCase(), 14, 15);

  // Subtitle / Contact Info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Phone: ${workerPhone}  ${workerEmail ? '| Email: ' + workerEmail : ''}`, 14, 23);
  if (workerAddress) {
    doc.text(`Address: ${workerAddress}`, 14, 29);
  }

  // Right Side Badge: LIST TYPE
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(145, 10, 50, 16, 2, 2, 'F');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`${(listData.list_type || 'Electrical').toUpperCase()} LIST`, 170, 20, { align: 'center' });

  // 2. Document Title
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('MATERIAL REQUIREMENT LIST', 14, 46);

  // Horizontal divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 49, 196, 49);

  // 3. Client & Project Details Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 53, 182, 32, 2, 2, 'FD');

  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);

  // Column 1: Client & Phone
  doc.setFont('helvetica', 'bold');
  doc.text('Client Name:', 18, 61);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(listData.client_name || 'N/A', 42, 61);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Client Phone:', 18, 69);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(listData.client_phone || 'N/A', 42, 69);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Location:', 18, 77);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(listData.location || 'N/A', 42, 77);

  // Column 2: Project & Date
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Project / Site:', 115, 61);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(listData.project_name || 'N/A', 142, 61);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Date:', 115, 69);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(listData.date || new Date().toLocaleDateString('en-GB'), 142, 69);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('List ID:', 115, 77);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(listData.id ? `#MRL-${listData.id}` : 'DRAFT', 142, 77);

  // 4. Material Table
  const tableData = (listData.items || []).map((item, index) => [
    index + 1,
    item.item_name,
    item.category || 'General',
    item.quantity,
    item.unit || 'Piece',
  ]);

  autoTable(doc, {
    startY: 91,
    head: [['No.', 'Material / Item Description', 'Category', 'Quantity', 'Unit']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9.5,
      textColor: [30, 41, 59],
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 14, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 38 },
      3: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 22, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });

  let finalY = doc.lastAutoTable.finalY + 8;

  // 5. Total Count Banner
  const totalCount = (listData.items || []).reduce((sum, item) => sum + parseInt(item.quantity || 0, 10), 0);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, finalY, 182, 10, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`TOTAL DISTINCT ITEMS: ${listData.items?.length || 0}`, 18, finalY + 6.5);
  doc.text(`TOTAL QUANTITY UNITS: ${totalCount}`, 190, finalY + 6.5, { align: 'right' });

  finalY += 16;

  // 6. Additional Notes Box (If present)
  if (listData.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text('ADDITIONAL NOTES & INSTRUCTIONS:', 14, finalY);

    finalY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    const splitNotes = doc.splitTextToSize(listData.notes, 180);
    doc.text(splitNotes, 14, finalY);
    finalY += splitNotes.length * 4.5 + 8;
  }

  // Ensure signatures fit on page or handle page break
  if (finalY > 250) {
    doc.addPage();
    finalY = 30;
  }

  // 7. Signatures & Footer Area
  finalY += 12;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);

  // Client Signature Line
  doc.line(14, finalY + 12, 85, finalY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Client Signature', 14, finalY + 17);

  // Worker Signature Line
  doc.line(125, finalY + 12, 196, finalY + 12);
  doc.text('Worker Signature', 125, finalY + 17);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Prepared by: ${workerName}`, 125, finalY + 22);
  doc.text(`Contact: ${workerPhone}`, 125, finalY + 26);

  // 8. Footer Page Note
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Generated by ElectroPlumb Material Requirement Manager', 105, 290, { align: 'center' });

  // Return generated pdf blob / doc
  return doc;
};

export const downloadPDF = (listData, userProfile) => {
  const doc = generateA4PDF(listData, userProfile);
  const fileName = `Material_List_${(listData.client_name || 'Client').replace(/\s+/g, '_')}_${listData.date || 'date'}.pdf`;
  doc.save(fileName);
};

export const printPDFInNewTab = (listData, userProfile) => {
  const doc = generateA4PDF(listData, userProfile);
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, '_blank');
};
