
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject
} from '@angular/core';

import { Subscription } from 'rxjs';

import { ImageService } from '../../../core/services/image';

@Component({
  selector: 'app-secure-image',
  standalone: true,
  imports: [],
  templateUrl: './secure-image.html',
  styleUrl: './secure-image.scss'
})
export class SecureImage implements OnChanges, OnDestroy {

  private readonly imageService = inject(ImageService);

  // =====================================
  // Component Inputs
  // =====================================

  @Input() imagePath: string | null | undefined = null;

  @Input() alt = 'Image';

  @Input() width = 100;

  @Input() height = 100;

  @Input() placeholderIcon = 'bi-image';

  @Input() placeholderText = 'No image';

  @Input() objectFit: 'contain' | 'cover' = 'contain';

  // =====================================
  // Component State
  // =====================================

  imageUrl: string | null = null;

  loading = false;

  hasError = false;

  private imageSubscription: Subscription | null = null;

  // =====================================
  // Detect Image Path Changes
  // =====================================

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['imagePath']) {

      this.loadImage();
    }
  }

  // =====================================
  // Load Secured Image
  // =====================================

  private loadImage(): void {

    // Cancel any previous image request
    this.cancelImageRequest();

    // Release previously generated object URL
    this.releaseObjectUrl();

    // Reset component state
    this.loading = false;
    this.hasError = false;

    // No image uploaded
    if (!this.imagePath) {

      return;
    }

    // Validate relative image path
    if (!this.imageService.isValidImagePath(this.imagePath)) {

      this.hasError = true;

      return;
    }

    this.loading = true;

    // Retrieve authenticated image
    this.imageSubscription = this.imageService
      .getImage(this.imagePath)
      .subscribe({

        next: (blob: Blob) => {

          this.imageUrl = URL.createObjectURL(blob);

          this.loading = false;
          this.hasError = false;
        },

        error: () => {

          this.releaseObjectUrl();

          this.loading = false;
          this.hasError = true;
        }
      });
  }

  // =====================================
  // Handle Browser Image Loading Error
  // =====================================

  onImageError(): void {

    this.releaseObjectUrl();

    this.loading = false;
    this.hasError = true;
  }

  // =====================================
  // Retry Image Retrieval
  // =====================================

  retryImage(): void {

    this.loadImage();
  }

  // =====================================
  // Cancel Previous Image Request
  // =====================================

  private cancelImageRequest(): void {

    if (this.imageSubscription) {

      this.imageSubscription.unsubscribe();

      this.imageSubscription = null;
    }
  }

  // =====================================
  // Release Browser Object URL
  // =====================================

  private releaseObjectUrl(): void {

    if (this.imageUrl) {

      URL.revokeObjectURL(this.imageUrl);

      this.imageUrl = null;
    }
  }

  // =====================================
  // Component Cleanup
  // =====================================

  ngOnDestroy(): void {

    this.cancelImageRequest();

    this.releaseObjectUrl();
  }

}
