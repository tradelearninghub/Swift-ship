/**
 * Code 128 Barcode Generator for Logistics AWBs
 * Produces crisp, vector-based scannable SVG barcodes without external dependencies.
 */

// Code 128 Code Set B patterns (index corresponds to character ASCII value - 32)
const CODE128_PATTERNS: string[] = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", // 0-9
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", // 10-19
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", // 20-29
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313", // 30-39
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", // 40-49
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", // 50-59
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", // 60-69
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", // 70-79
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", // 80-89
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", // 90-99
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112", // 100-106 (104: Start B, 106: Stop)
];

const START_B_PATTERN = "211214";
const STOP_PATTERN = "2331112";

/**
 * Generate SVG string representing a Code 128B barcode.
 */
export function generateCode128Svg(
  text: string,
  options: {
    height?: number;
    barWidth?: number;
    showText?: boolean;
  } = {}
): string {
  const height = options.height || 50;
  const barWidth = options.barWidth || 1.8;
  const showText = options.showText ?? true;

  const sanitized = (text || "AWB123456").replace(/[^\x20-\x7E]/g, "");

  // Calculate Checksum for Code 128B
  let checksum = 104; // Start B value
  for (let i = 0; i < sanitized.length; i++) {
    const codeVal = sanitized.charCodeAt(i) - 32;
    checksum += codeVal * (i + 1);
  }
  const checkCharVal = checksum % 103;

  // Build pattern sequence: Start B + chars + checksum + stop
  const patterns: string[] = [START_B_PATTERN];
  for (let i = 0; i < sanitized.length; i++) {
    const idx = sanitized.charCodeAt(i) - 32;
    if (idx >= 0 && idx < CODE128_PATTERNS.length) {
      patterns.push(CODE128_PATTERNS[idx]);
    }
  }
  patterns.push(CODE128_PATTERNS[checkCharVal]);
  patterns.push(STOP_PATTERN);

  // Render bars
  const fullPattern = patterns.join("");
  let x = 10;
  const rects: string[] = [];

  let isBar = true;
  for (let i = 0; i < fullPattern.length; i++) {
    const widthCount = parseInt(fullPattern[i], 10);
    const w = widthCount * barWidth;
    if (isBar) {
      rects.push(`<rect x="${x.toFixed(1)}" y="0" width="${w.toFixed(1)}" height="${height}" fill="#0F172A" />`);
    }
    x += w;
    isBar = !isBar;
  }

  const totalWidth = x + 10;
  const totalHeight = showText ? height + 16 : height;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="100%" height="${totalHeight}" style="max-height: ${totalHeight}px; display: block; margin: 0 auto;">
    ${rects.join("")}
    ${
      showText
        ? `<text x="${(totalWidth / 2).toFixed(1)}" y="${height + 13}" font-family="JetBrains Mono, monospace, sans-serif" font-size="11" font-weight="700" fill="#0F172A" text-anchor="middle" letter-spacing="2">${sanitized}</text>`
        : ""
    }
  </svg>`;
}
