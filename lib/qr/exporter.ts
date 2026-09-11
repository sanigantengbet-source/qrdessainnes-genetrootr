import { jsPDF } from 'jspdf';
import { slugifyFilename } from '@/lib/utils/slugify';

/**
 * Trigger browser file download from Blob
 */
export function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Export clean SVG file
 */
export function exportSVG(svgMarkup: string, qrName: string) {
  const filename = slugifyFilename(qrName, 'svg');
  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  triggerFileDownload(blob, filename);
}

/**
 * Render SVG into Canvas and export as PNG or JPG
 */
export async function exportRasterImage(
  svgMarkup: string,
  qrName: string,
  format: 'png' | 'jpeg',
  scale = 2 // default 2x high-res
): Promise<void> {
  return new Promise((resolve, reject) => {
    const filename = slugifyFilename(qrName, format === 'jpeg' ? 'jpg' : 'png');
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgMarkup, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');

    if (!svgEl) {
      reject(new Error('Invalid SVG markup'));
      return;
    }

    const viewBox = svgEl.getAttribute('viewBox');
    let width = 500;
    let height = 500;

    if (viewBox) {
      const parts = viewBox.split(/\s+/).map(Number);
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        width = parts[2];
        height = parts[3];
      }
    } else {
      width = parseFloat(svgEl.getAttribute('width') || '500');
      height = parseFloat(svgEl.getAttribute('height') || '500');
    }

    const targetWidth = Math.round(width * scale);
    const targetHeight = Math.round(height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas 2D context not available'));
      return;
    }

    // White base for JPEG
    if (format === 'jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    const img = new Image();
    const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            triggerFileDownload(blob, filename);
            resolve();
          } else {
            reject(new Error('Failed to generate image blob'));
          }
        },
        format === 'jpeg' ? 'image/jpeg' : 'image/png',
        0.98
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}

/**
 * Export Print-Ready PDF
 */
export async function exportPDF(
  svgMarkup: string,
  qrName: string,
  subheading = 'Scan with any smartphone camera'
): Promise<void> {
  const filename = slugifyFilename(qrName, 'pdf');

  // Convert SVG to high-res raster data URL for jsPDF
  const canvas = document.createElement('canvas');
  const scale = 2.5;
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgMarkup, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');

  const viewBox = svgEl?.getAttribute('viewBox')?.split(/\s+/).map(Number);
  const width = viewBox && viewBox[2] ? viewBox[2] : 500;
  const height = viewBox && viewBox[3] ? viewBox[3] : 500;

  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Canvas not supported');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const img = new Image();
  const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = reject;
    img.src = url;
  });

  const imgData = canvas.toDataURL('image/png');

  // Create A4 PDF (210 x 297 mm)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;

  // Header Brutalist styling in PDF
  pdf.setFillColor(255, 230, 0); // #FFE600
  pdf.rect(15, 15, pageWidth - 30, 14, 'F');
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.8);
  pdf.rect(15, 15, pageWidth - 30, 14, 'S');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text((qrName || 'QR CODE').toUpperCase(), pageWidth / 2, 24, { align: 'center' });

  // Render QR Code image in center
  const qrDisplayWidth = 140;
  const qrDisplayHeight = (height / width) * qrDisplayWidth;
  const qrX = (pageWidth - qrDisplayWidth) / 2;
  const qrY = 38;

  // Solid card outline behind QR
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(1);
  pdf.rect(qrX - 4, qrY - 4, qrDisplayWidth + 8, qrDisplayHeight + 8, 'S');

  pdf.addImage(imgData, 'PNG', qrX, qrY, qrDisplayWidth, qrDisplayHeight);

  // Subtitle / instructions
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(60, 60, 60);
  pdf.text(subheading, pageWidth / 2, qrY + qrDisplayHeight + 14, { align: 'center' });

  // Footer footer mark
  pdf.setFontSize(8);
  pdf.setTextColor(140, 140, 140);
  pdf.text('Generated with QR Design Generator • High Resolution Vector Print Document', pageWidth / 2, pageHeight - 15, {
    align: 'center',
  });

  pdf.save(filename);
}
