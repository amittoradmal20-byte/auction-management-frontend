
export type PdfShareResult =
  | 'SHARED'
  | 'CANCELLED'
  | 'UNSUPPORTED';

export class PdfShareUtil {

  private constructor() {}

  // =====================================
  // 1. CHECK WEB SHARE API SUPPORT
  // =====================================

  static isShareSupported(): boolean {

    return typeof navigator !== 'undefined' &&
      typeof window !== 'undefined' &&
      window.isSecureContext &&
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function';
  }

  // =====================================
  // 2. VALIDATE PDF FILE
  // =====================================

  private static validatePdfFile(
    pdfFile: File
  ): void {

    if (!pdfFile || pdfFile.size === 0) {

      throw new Error(
        'PDF file is empty.'
      );
    }

    const contentType = pdfFile.type
      .toLowerCase()
      .split(';')[0]
      .trim();

    if (contentType !== 'application/pdf') {

      throw new Error(
        'Invalid PDF file received.'
      );
    }
  }

  // =====================================
  // 3. CHECK PDF FILE SHARING SUPPORT
  // =====================================

  static canShareFile(
    pdfFile: File
  ): boolean {

    if (!this.isShareSupported()) {

      return false;
    }

    if (!pdfFile || pdfFile.size === 0) {

      return false;
    }

    try {

      this.validatePdfFile(pdfFile);

      return navigator.canShare({
        files: [pdfFile]
      });

    } catch {

      return false;
    }
  }

  // =====================================
  // 4. SHARE PDF FILE
  // =====================================

  static async shareFile(
    pdfFile: File,
    title: string = 'PDF Document',
    text: string = ''
  ): Promise<PdfShareResult> {

    // Validate prepared PDF file
    this.validatePdfFile(pdfFile);

    // Check browser file sharing support
    if (!this.canShareFile(pdfFile)) {

      return 'UNSUPPORTED';
    }

    // Prepare native sharing data
    const shareData: ShareData = {

      title,

      files: [pdfFile]
    };

    if (text.trim()) {

      shareData.text = text.trim();
    }

    try {

      // Open native device sharing menu
      await navigator.share(shareData);

      return 'SHARED';

    } catch (error: unknown) {

      // Handle user cancellation
      if (
        error instanceof DOMException &&
        error.name === 'AbortError'
      ) {

        return 'CANCELLED';
      }

      // Propagate actual sharing errors
      throw error;
    }
  }
}
