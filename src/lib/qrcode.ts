import QRCode from "qrcode";

/**
 * Standard ISO/IEC 18004 Vector SVG QR Code Generator
 * Generates valid, error-corrected, scannable QR Code SVG for shipping labels
 * and parcel tracking tokens.
 */
export function generateQrCodeSvg(
  text: string,
  size: number = 100,
  margin: number = 4
): string {
  try {
    const rawText = text?.trim() || "https://sscourierservice.in/track";
    const qr = QRCode.create(rawText, {
      errorCorrectionLevel: "M",
    });

    const moduleCount = qr.modules.size;
    const totalModules = moduleCount + margin * 2;
    const cellSize = size / totalModules;

    let path = "";
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (qr.modules.get(r, c)) {
          const x = (c + margin) * cellSize;
          const y = (r + margin) * cellSize;
          path += `M${x.toFixed(2)},${y.toFixed(2)}h${cellSize.toFixed(2)}v${cellSize.toFixed(2)}h-${cellSize.toFixed(2)}z `;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">
  <rect width="${size}" height="${size}" fill="#FFFFFF" />
  <path d="${path}" fill="#0F172A" />
</svg>`;
  } catch (err) {
    console.error("Failed to generate QR code SVG:", err);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="#FFFFFF" />
  <rect x="${size * 0.1}" y="${size * 0.1}" width="${size * 0.8}" height="${size * 0.8}" fill="#F1F5F9" />
</svg>`;
  }
}
