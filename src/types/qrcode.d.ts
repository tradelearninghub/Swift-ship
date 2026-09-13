declare module "qrcode" {
  export interface QRCodeRenderersOptions {
    margin?: number;
    scale?: number;
    width?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    errorCorrectionLevel?: "low" | "medium" | "quartile" | "high" | "L" | "M" | "Q" | "H";
  }

  export interface QRCodeSegment {
    data: string | Uint8Array;
    mode?: string;
  }

  export interface QRCodeData {
    modules: {
      size: number;
      data: Uint8Array;
      get(row: number, col: number): boolean;
    };
  }

  export function create(
    text: string | QRCodeSegment[],
    options?: QRCodeRenderersOptions
  ): QRCodeData;

  export function toString(
    text: string | QRCodeSegment[],
    options?: QRCodeRenderersOptions & { type?: "svg" | "utf8" }
  ): Promise<string>;

  export function toString(
    text: string | QRCodeSegment[],
    callback: (error: Error | null, string: string) => void
  ): void;

  export function toDataURL(
    text: string | QRCodeSegment[],
    options?: QRCodeRenderersOptions
  ): Promise<string>;

  export default {
    create,
    toString,
    toDataURL,
  };
}
