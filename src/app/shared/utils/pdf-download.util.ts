
import { HttpResponse } from '@angular/common/http';

import { PdfFileUtil } from './pdf-file.util';

export class PdfDownloadUtil {

  private constructor() {}

  // =====================================
  // 1. DOWNLOAD PDF RESPONSE
  // =====================================

  static download(
    response: HttpResponse<Blob>,
    fallbackFileName: string = 'document.pdf'
  ): void {

    // Validate response and create PDF file
    const pdfFile = PdfFileUtil.createFile(
      response,
      fallbackFileName
    );

    // Download prepared PDF file
    this.downloadFile(pdfFile);
  }

  // =====================================
  // 2. DOWNLOAD PREPARED PDF FILE
  // =====================================

  static downloadFile(
    pdfFile: File
  ): void {

    // Validate file
    if (!pdfFile || pdfFile.size === 0) {

      throw new Error(
        'PDF file is empty.'
      );
    }

    // Validate PDF content type
    const contentType = pdfFile.type
      .toLowerCase()
      .split(';')[0]
      .trim();

    if (contentType !== 'application/pdf') {

      throw new Error(
        'Invalid PDF file received.'
      );
    }

    // Resolve safe filename
    const fileName =
      PdfFileUtil.sanitizeFileName(
        pdfFile.name
      );

    // Create temporary object URL
    const objectUrl = URL.createObjectURL(
      pdfFile
    );

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
}
