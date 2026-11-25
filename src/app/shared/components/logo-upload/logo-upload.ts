
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { SecureImage } from '../secure-image/secure-image';

@Component({
  selector: 'app-logo-upload',
  standalone: true,
  imports: [SecureImage],
  templateUrl: './logo-upload.html',
  styleUrl: './logo-upload.scss'
})
export class LogoUpload implements OnDestroy {

  private readonly cdr = inject(ChangeDetectorRef);

  // =====================================
  // Component Configuration
  // =====================================

  @Input() label = 'Logo';

  @Input() existingImagePath: string | null | undefined = null;

  @Input() placeholderIcon = 'bi-image';

  @Input() placeholderText = 'No logo';

  @Input() disabled = false;

  @Input() previewWidth = 150;

  @Input() previewHeight = 150;

  // =====================================
  // Component Events
  // =====================================

  @Output() fileSelected = new EventEmitter<File | null>();

  @Output() removeExistingLogo = new EventEmitter<void>();

  @Output() validationStateChange = new EventEmitter<boolean>();

  // =====================================
  // File Validation Configuration
  // =====================================

  readonly maxFileSize = 2 * 1024 * 1024;

  readonly maxImageWidth = 4096;

  readonly maxImageHeight = 4096;

  readonly allowedFileTypes = [
    'image/png',
    'image/jpeg'
  ];

  readonly acceptedFileTypes =
    '.png,.jpg,.jpeg,image/png,image/jpeg';

  // =====================================
  // Component State
  // =====================================

  selectedFile: File | null = null;

  previewUrl: string | null = null;

  errorMessage = '';

  isValidating = false;

  private validationRequestId = 0;

  private pendingPreviewUrl: string | null = null;

  // =====================================
  // Selected File Information
  // =====================================

  get selectedFileName(): string {
    return this.selectedFile?.name ?? '';
  }

  get selectedFileSize(): string {

    if (!this.selectedFile) {
      return '';
    }

    const size = this.selectedFile.size;

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  get hasSelectedFile(): boolean {
    return this.selectedFile !== null;
  }

  get hasExistingLogo(): boolean {
    return !!this.existingImagePath;
  }

  get hasError(): boolean {
    return !!this.errorMessage;
  }

  // =====================================
  // Handle File Selection
  // =====================================

  async onFileSelected(event: Event): Promise<void> {

    const input = event.target as HTMLInputElement;

    const file = input.files?.[0];

    // Reset the input so the same file
    // can be selected again.
    input.value = '';

    if (this.disabled || !file) {
      return;
    }

    // Cancel any previous validation.
    this.cancelPendingValidation();

    const requestId = this.validationRequestId;

    this.errorMessage = '';

    // Clear previous selection.
    this.clearSelectedFileState();

    // Prevent the parent from using an old file.
    this.fileSelected.emit(null);

    // Validate file type and size.
    const validationError = this.validateFile(file);

    if (validationError) {

      this.errorMessage = validationError;

      this.validationStateChange.emit(false);

      this.cdr.markForCheck();

      return;
    }

    this.isValidating = true;

    this.validationStateChange.emit(false);

    this.cdr.markForCheck();

    try {

      // Create temporary image preview.
      const objectUrl = URL.createObjectURL(file);

      this.pendingPreviewUrl = objectUrl;

      // Validate actual image dimensions.
      const dimensions =
        await this.getImageDimensions(objectUrl);

      // Ignore stale validation results.
      if (requestId !== this.validationRequestId) {
        return;
      }

      if (
        dimensions.width > this.maxImageWidth ||
        dimensions.height > this.maxImageHeight
      ) {

        this.errorMessage =
          `Image dimensions must not exceed ` +
          `${this.maxImageWidth} × ${this.maxImageHeight} pixels.`;

        return;
      }

      // Store the successfully validated file.
      this.selectedFile = file;

      this.previewUrl = objectUrl;

      // Ownership transferred to previewUrl.
      this.pendingPreviewUrl = null;

      // Notify the parent component.
      this.fileSelected.emit(file);

    } catch {

      if (requestId !== this.validationRequestId) {
        return;
      }

      this.errorMessage =
        'Unable to read the selected image. Please choose a valid PNG or JPEG file.';

    } finally {

      if (requestId === this.validationRequestId) {

        this.releasePendingPreviewUrl();

        this.isValidating = false;

        this.validationStateChange.emit(!this.hasError);

        this.cdr.markForCheck();
      }
    }
  }

  // =====================================
  // Validate File Type and Size
  // =====================================

  private validateFile(file: File): string | null {

    if (file.size === 0) {
      return 'The selected image file is empty.';
    }

    if (!this.allowedFileTypes.includes(file.type)) {
      return 'Only PNG and JPEG images are allowed.';
    }

    if (file.size > this.maxFileSize) {
      return 'Image file size must not exceed 2 MB.';
    }

    return null;
  }

  // =====================================
  // Read Image Dimensions
  // =====================================

  private getImageDimensions(
    imageUrl: string
  ): Promise<{ width: number; height: number }> {

    return new Promise((resolve, reject) => {

      const image = new Image();

      image.onload = () => {

        resolve({
          width: image.naturalWidth,
          height: image.naturalHeight
        });
      };

      image.onerror = () => {

        reject(
          new Error('Invalid or corrupted image file.')
        );
      };

      image.src = imageUrl;
    });
  }

  // =====================================
  // Clear Selected Logo
  // =====================================

  clearSelectedFile(): void {

    if (this.disabled) {
      return;
    }

    this.cancelPendingValidation();

    this.clearSelectedFileState();

    this.errorMessage = '';

    this.fileSelected.emit(null);

    this.validationStateChange.emit(true);

    this.cdr.markForCheck();
  }

  // =====================================
  // Request Existing Logo Removal
  // =====================================

  requestRemoveExistingLogo(): void {

    if (
      this.disabled ||
      this.isValidating ||
      this.hasSelectedFile ||
      !this.hasExistingLogo
    ) {
      return;
    }

    // Parent component controls confirmation
    // and the actual delete API call.
    this.removeExistingLogo.emit();
  }

  // =====================================
  // Handle Local Preview Error
  // =====================================

  onPreviewError(): void {

    if (!this.previewUrl) {
      return;
    }

    this.cancelPendingValidation();

    this.clearSelectedFileState();

    this.errorMessage =
      'Unable to display the selected image. Please select another file.';

    this.fileSelected.emit(null);

    this.validationStateChange.emit(false);

    this.cdr.markForCheck();
  }

  // =====================================
  // Clear Selected File State
  // =====================================

  private clearSelectedFileState(): void {

    this.releasePreviewUrl();

    this.selectedFile = null;
  }

  // =====================================
  // Cancel Pending Image Validation
  // =====================================

  private cancelPendingValidation(): void {

    this.validationRequestId++;

    this.isValidating = false;

    this.releasePendingPreviewUrl();
  }

  // =====================================
  // Release Preview Object URL
  // =====================================

  private releasePreviewUrl(): void {

    if (this.previewUrl) {

      URL.revokeObjectURL(this.previewUrl);

      this.previewUrl = null;
    }
  }

  // =====================================
  // Release Pending Preview Object URL
  // =====================================

  private releasePendingPreviewUrl(): void {

    if (this.pendingPreviewUrl) {

      URL.revokeObjectURL(this.pendingPreviewUrl);

      this.pendingPreviewUrl = null;
    }
  }

  // =====================================
  // Component Cleanup
  // =====================================

  ngOnDestroy(): void {

    this.cancelPendingValidation();

    this.clearSelectedFileState();
  }

}
