import jsPDF from "jspdf";

interface CertificateData {
    id?: string;
    status?: string;
    certificate_id?: string;
    issue_date?: string;
    expiry_date?: string;
    property_name?: string;
    address?: string;
    property_type?: string;
    ownership?: string;
    description?: string;
    applicant_name?: string;
    email?: string;
    qrCodeUrl?: string;
}

const loadImage = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = url;
    });
};

export const generateCertificatePDF = async (certificate: CertificateData) => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    try {
        const bgUrl = "/images/auth-logo.png";
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d")!;
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.globalAlpha = 0.2;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            const fadedImg = canvas.toDataURL("image/png");

            // Center smaller image
            const imgWidth = 80;
            const imgHeight = 80;
            const x = (pageWidth - imgWidth) / 2;
            const y = (pageHeight - imgHeight) / 2;

            doc.addImage(fadedImg, "PNG", x, y, imgWidth, imgHeight);
        };

        img.src = bgUrl;
    } catch (e) {
        console.warn("Background image not loaded:", e);
    }
    doc.setFillColor(74, 84, 57);
    doc.rect(0, 0, pageWidth, 20, "F");
    // HEADER SECTION

    const headerHeight = 20;
    doc.setFillColor(74, 84, 57);
    doc.rect(0, 0, pageWidth, headerHeight, "F");

    try {
        const logoUrl = "/images/auth-logo.png";
        const logoDataUrl = await loadImage(logoUrl);
        doc.addImage(logoDataUrl, "PNG", 8, 3, 15, 15);
    } catch (e) {
        console.warn("Logo not loaded:", e);
    }
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Property Verification Report", pageWidth / 2, headerHeight / 2 + 4, { align: "center" });

    // Right-side report info 
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 255, 255);

    const rightBlockX = pageWidth - 50;
    const rightBlockY = headerHeight / 2 - 1;

    const reportId = certificate.id ? certificate.id.slice(0, 13) + "..." : "N/A";

    doc.text(`Report ID: ${reportId}`, rightBlockX, rightBlockY + 2, { align: "left" });
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, rightBlockX, rightBlockY + 6, { align: "left" });



    let yPos = 35;

    // Light background box for details
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(10, yPos - 5, pageWidth - 20, 65, 4, 4, "F");

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text("Certificate Details", 15, yPos);

    yPos += 10;
    const boxWidth = (pageWidth - 30) / 2;
    const boxHeight = 80;

    // Left box (QR Code area)
    const qrBoxX = 10;
    const qrBoxY = yPos;
    const qrBoxWidth = boxWidth;
    const qrBoxHeight = boxHeight;

    doc.setFillColor(245, 247, 250);
    doc.roundedRect(qrBoxX, qrBoxY, qrBoxWidth, qrBoxHeight, 5, 5, "F"); // rounded corners

    if (certificate.qrCodeUrl) {
        try {
            const qrDataUrl = await loadImage(certificate.qrCodeUrl);
            const qrSize = 50; // QR size remains same
            const qrX = qrBoxX + (qrBoxWidth - qrSize) / 2;
            const qrY = qrBoxY + (qrBoxHeight - qrSize) / 2;
            doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
        } catch {
            doc.setFontSize(8);
            doc.text("QR Unavailable", qrBoxX + qrBoxWidth / 2, qrBoxY + qrBoxHeight / 2, { align: "center" });
        }
    } else {
        doc.setFontSize(8);
        doc.text("No QR Code", qrBoxX + qrBoxWidth / 2, qrBoxY + qrBoxHeight / 2, { align: "center" });
    }


    const detailsBoxX = 10 + boxWidth + 10;
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(detailsBoxX, yPos, boxWidth, boxHeight, 5, 5, "F");

    const details = [
        { label: "Status", value: certificate.status || "Active" },
        { label: "Certificate ID", value: certificate.certificate_id || "N/A" },
        { label: "Issue Date", value: certificate.issue_date || "N/A" },
        { label: "Expiry Date", value: certificate.expiry_date || "N/A" },
    ];

    doc.setFontSize(10);
    let detailY = yPos + 16;

    details.forEach((item, i) => {
        const x = detailsBoxX + 10;
        const maxTextWidth = boxWidth - 20;

        doc.setFont("helvetica", "bold");
        doc.setTextColor(17, 24, 39);

        const valueLines = doc.splitTextToSize(item.value, maxTextWidth);
        doc.text(valueLines, x, detailY);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        const labelY = detailY + valueLines.length * 5;
        doc.text(item.label, x, labelY);

        if (i < details.length - 1) {
            const lineY = labelY + 4;
            doc.setDrawColor(229, 231, 235);
            doc.setLineWidth(0.3);
            doc.line(detailsBoxX + 5, lineY, detailsBoxX + boxWidth - 5, lineY);
            detailY = lineY + 6;
        } else {
            detailY = labelY + 6;
        }
    });
    // PROPERTY DETAILS

    yPos += boxHeight + 20;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Property Details", 15, yPos);

    const propertyDetails = [
        { label: "Property Name", value: certificate.property_name || "N/A" },
        { label: "Address", value: certificate.address || "N/A" },
        { label: "Property Type", value: certificate.property_type || "N/A" },
        { label: "Ownership", value: certificate.ownership || "N/A" },
        { label: "Description", value: certificate.description || "N/A" },

    ];

    yPos += 8;
    doc.setFontSize(9);

    propertyDetails.forEach((item) => {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(item.label, 15, yPos);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(item.value, 70, yPos);

        yPos += 7;
    });

    yPos += 4;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(10, yPos, doc.internal.pageSize.getWidth() - 10, yPos);
    yPos += 6;

    // APPLICANT DETAILS
    yPos += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Applicant Details", 15, yPos);

    const applicantDetails = [
        { label: "Applicant Name", value: certificate.applicant_name || "N/A" },
        { label: "Email", value: certificate.email || "N/A" },
    ];

    yPos += 8;
    doc.setFontSize(9);

    applicantDetails.forEach((item) => {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(item.label, 15, yPos);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100); // lighter gray
        doc.text(item.value, 70, yPos);

        yPos += 7;
    });



    // Footer
    doc.setFillColor(0, 0, 0);
    doc.rect(0, pageHeight - 15, pageWidth, 15, "F");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("www.rentalhost.com", pageWidth / 2, pageHeight - 7, { align: "center" });

    // Save PDF
    const fileName = `${certificate.property_name || "certificate"}_${certificate.id || "report"}.pdf`;
    doc.save(fileName);
};
