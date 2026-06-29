import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const BRAND_COLOR: [number, number, number] = [16, 185, 129];

type LineItem = {
    description: string;
    amount: number;
};

type InvoiceData = {
    invoiceNumber: string;
    brandName: string;
    customerName: string;
    jobTitle: string;
    items: LineItem[];
    subtotal: number;
    depositRequired: number;
    depositPaid: number;
    balance: number;
    currency: string;
    notes?: string;
};

export function generateInvoice(data: InvoiceData) {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("en-NG");

    // ── HEADER ──────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(30, 30, 30);
    doc.text(data.brandName, 105, 22, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(110, 110, 110);
    doc.text("Professional Invoice", 105, 30, { align: "center" });

    doc.setDrawColor(...BRAND_COLOR);
    doc.setLineWidth(0.8);
    doc.line(20, 38, 190, 38);

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Invoice #: ${data.invoiceNumber}`, 20, 48);
    doc.text(`Date: ${today}`, 190, 48, { align: "right" });

    // ── BILL TO ─────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text("BILL TO", 20, 60);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(30, 30, 30);
    doc.text(data.customerName, 20, 69);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(data.jobTitle, 20, 77);

    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(20, 84, 190, 84);

    // ── LINE ITEMS TABLE ────────────────────────────────────
    autoTable(doc, {
        startY: 92,
        head: [["Description", "Amount"]],
        body: data.items.map((item) => [
            item.description,
            `${data.currency} ${item.amount.toLocaleString()}`,
        ]),
        theme: "grid",
        headStyles: {
            fillColor: BRAND_COLOR,
            textColor: 255,
            fontStyle: "bold",
            halign: "left",
        },
        bodyStyles: {
            textColor: 40,
            fontSize: 10,
        },
        alternateRowStyles: {
            fillColor: [248, 248, 248],
        },
        columnStyles: {
            0: { cellWidth: 130 },
            1: { cellWidth: 40, halign: "right" },
        },
        margin: { left: 20, right: 20 },
    });

    // ── TOTALS ───────────────────────────────────────────────
    // Get Y position after the table
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);

    doc.text("Subtotal", 130, finalY);
    doc.text(
        `${data.currency} ${data.subtotal.toLocaleString()}`,
        190, finalY, { align: "right" }
    );

    doc.text("Deposit Required", 130, finalY + 9);
    doc.text(
        `${data.currency} ${data.depositRequired.toLocaleString()}`,
        190, finalY + 9, { align: "right" }
    );

    doc.text("Deposit Paid", 130, finalY + 18);
    doc.text(
        `${data.currency} ${data.depositPaid.toLocaleString()}`,
        190, finalY + 18, { align: "right" }
    );

    // Balance line
    doc.setDrawColor(...BRAND_COLOR);
    doc.setLineWidth(0.5);
    doc.line(130, finalY + 23, 190, finalY + 23);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text("Balance Due", 130, finalY + 31);
    doc.text(
        `${data.currency} ${data.balance.toLocaleString()}`,
        190, finalY + 31, { align: "right" }
    );

    // ── NOTES ────────────────────────────────────────────────
    if (data.notes) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        doc.text("Notes", 20, finalY + 48);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(data.notes, 20, finalY + 56, { maxWidth: 170 });
    }

    // ── FOOTER ───────────────────────────────────────────────
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerY = pageHeight - 15;

    doc.setDrawColor(...BRAND_COLOR);
    doc.setLineWidth(0.5);
    doc.line(20, footerY, pageWidth - 20, footerY);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text("Thank you for choosing us.", 20, footerY + 8);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND_COLOR);
    doc.text("Powered by FitHouseAfrica", pageWidth - 20, footerY + 8, {
        align: "right",
    });

    return doc;
}