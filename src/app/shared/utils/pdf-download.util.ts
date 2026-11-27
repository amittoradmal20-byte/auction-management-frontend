
import { HttpResponse } from '@angular/common/http';

export class PdfDownloadUtil {

  private constructor() {}

  // =====================================
  // 1. DOWNLOAD PDF RESPONSE
  // =====================================

  static download(
    response: HttpResponse<Blob>,
    fallbackFileName: string = 'document.pdf'
  ): void {

    const blob = response.body;

    // Validate response body
    if (!blob || blob.size === 0) {
      throw new Error(
        'PDF response is empty.'
      );
    }

    // Validate PDF content type
    const contentType = (
      response.headers.get('Content-Type')
      || blob.type
      || ''
    ).toLowerCase().split(';')[0].trim();

    if (contentType !== 'application/pdf') {
      throw new Error(
        'Invalid PDF response received.'
      );
    }

    // Resolve download filename
    const fileName = this.resolveFileName(
      response,
      fallbackFileName
    );

    // Create temporary object URL
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');

    try {

      link.href = objectUrl;
      link.download = fileName;
      link.style.display = 'none';

      document.body.appendChild(link);

      // Trigger browser download
      link.click();

    } finally {

      // Remove temporary anchor
      link.remove();

      // Release temporary object URL
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 1000);
    }
  }

  // =====================================
  // 2. RESOLVE DOWNLOAD FILE NAME
  // =====================================

  private static resolveFileName(
    response: HttpResponse<Blob>,
    fallbackFileName: string
  ): string {

    const disposition = response.headers.get(
      'Content-Disposition'
    );

    let fileName = fallbackFileName;

    if (disposition) {

      // RFC 5987 encoded filename
      const encodedMatch = disposition.match(
        /filename\*\s*=\s*UTF-8''([^;]+)/i
      );

      if (encodedMatch?.[1]) {

        try {
          fileName = decodeURIComponent(
            encodedMatch[1].trim()
          );
        } catch {
          fileName = fallbackFileName;
        }

      } else {

        // Standard filename
        const standardMatch = disposition.match(
          /filename\s*=\s*(?:"([^"]*)"|([^;]+))/i
        );

        const standardFileName =
          standardMatch?.[1]
          || standardMatch?.[2];

        if (standardFileName?.trim()) {
          fileName = standardFileName.trim();
        }
      }
    }

    return this.sanitizeFileName(fileName);
  }

  // =====================================
  // 3. SANITIZE DOWNLOAD FILE NAME
  // =====================================

  private static sanitizeFileName(
    fileName: string
  ): string {

    let safeFileName = fileName
      .replace(/[<>:"/\\|?*\x00-\x1F\x7F]/g, '_')
      .trim()
      .replace(/^[.\s]+|[.\s]+$/g, '');

    if (!safeFileName) {
      safeFileName = 'document.pdf';
    }

    if (!safeFileName.toLowerCase().endsWith('.pdf')) {
      safeFileName += '.pdf';
    }

    return safeFileName;
  }
}
