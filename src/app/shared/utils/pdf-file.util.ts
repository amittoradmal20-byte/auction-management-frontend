import { HttpResponse } from '@angular/common/http';

export class PdfFileUtil {

  private constructor() {}

  // =====================================
  // 1. VALIDATE PDF RESPONSE
  // =====================================

  static validateResponse(
    response: HttpResponse<Blob>
  ): Blob {

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

    return blob;
  }

  // =====================================
  // 2. RESOLVE PDF FILE NAME
  // =====================================

  static resolveFileName(
    response: HttpResponse<Blob>,
    fallbackFileName: string = 'document.pdf'
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

      // Prefer UTF-8 encoded filename
      if (encodedMatch?.[1]) {

        try {

          const decodedFileName =
            decodeURIComponent(
              encodedMatch[1].trim()
            );

          if (decodedFileName.trim()) {

            fileName = decodedFileName;
          }

        } catch {

          // Retain standard or fallback filename
        }
      }
    }

    return this.sanitizeFileName(fileName);
  }

  // =====================================
  // 3. SANITIZE PDF FILE NAME
  // =====================================

  static sanitizeFileName(
    fileName: string
  ): string {

    let safeFileName = fileName

      .replace(
        /[<>:"/\\|?*\x00-\x1F\x7F]/g,
        '_'
      )

      .trim()

      .replace(
        /^[.\s]+|[.\s]+$/g,
        ''
      );

    if (!safeFileName) {

      safeFileName = 'document.pdf';
    }

    if (!safeFileName.toLowerCase().endsWith('.pdf')) {

      safeFileName += '.pdf';
    }

    return safeFileName;
  }

  // =====================================
  // 4. CONVERT PDF RESPONSE TO FILE
  // =====================================

  static createFile(
    response: HttpResponse<Blob>,
    fallbackFileName: string = 'document.pdf'
  ): File {

    // Validate PDF response
    const blob = this.validateResponse(
      response
    );

    // Resolve PDF filename
    const fileName = this.resolveFileName(
      response,
      fallbackFileName
    );

    // Create browser File object
    return new File(
      [blob],
      fileName,
      {
        type: 'application/pdf',
        lastModified: Date.now()
      }
    );
  }
}