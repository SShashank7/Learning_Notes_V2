import jsPDF from "jspdf";

export const downloadCategoryPDF = (categoryName: string, notes: any[]) => {
  const doc = new jsPDF();

  let y = 10;

  doc.setFontSize(18);
  doc.text(categoryName, 10, y);
  y += 10;

  notes.forEach((note, index) => {
    doc.setFontSize(14);
    doc.text(`${index + 1}. ${note.title}`, 10, y);
    y += 8;

    doc.setFontSize(10);
    const contentLines = doc.splitTextToSize(note.content, 180);
    doc.text(contentLines, 10, y);
    y += contentLines.length * 6;

    doc.text(`Confidence: ${note.confidence}`, 10, y);
    y += 10;

    if (y > 270) {
      doc.addPage();
      y = 10;
    }
  });

  doc.save(`${categoryName}-notes.pdf`);
};