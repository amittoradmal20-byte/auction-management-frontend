
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CricketGroupService } from '../../../core/services/cricket-group';
import { CricketGroupCreateRequest } from '../../../core/models/cricket-group/cricket-group-create-request.model';

@Component({
  selector: 'app-cricket-group-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cricket-group-create.html',
  styleUrl: './cricket-group-create.scss'
})
export class CricketGroupCreate {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cricketGroupService = inject(CricketGroupService);

  isSubmitting = false;
  errorMessage = '';

  cricketGroupForm = this.fb.nonNullable.group({
    name: ['', [
      Validators.required,
      Validators.maxLength(150)
    ]],
    description: ['', [
      Validators.maxLength(500)
    ]]
  });

  get name() {
    return this.cricketGroupForm.controls.name;
  }

  get description() {
    return this.cricketGroupForm.controls.description;
  }

  createCricketGroup(): void {

    if (this.cricketGroupForm.invalid) {
      this.cricketGroupForm.markAllAsTouched();
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    const request: CricketGroupCreateRequest = {
      name: this.name.value.trim(),
      description: this.description.value.trim()
    };

    if (!request.name) {
      this.name.setErrors({ required: true });
      this.name.markAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.cricketGroupService.createCricketGroup(request).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/cricket-groups']);
      },
      error: (error) => {
        console.error('Error creating cricket group:', error);

        this.errorMessage =
          error.error?.message ||
          'Unable to create cricket group. Please try again.';

        this.isSubmitting = false;
      }
    });
  }
}
