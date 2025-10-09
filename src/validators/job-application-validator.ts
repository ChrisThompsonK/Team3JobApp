import type { JobApplicationData } from '../models/job-roles.js';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class JobApplicationValidator {
  validate(data: JobApplicationData): ValidationResult {
    const errors: string[] = [];

    if (!data.firstName?.trim()) {
      errors.push('First name is required');
    }

    if (!data.lastName?.trim()) {
      errors.push('Last name is required');
    }

    if (!data.email?.trim()) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Email must be a valid email address');
    }

    if (!data.phone?.trim()) {
      errors.push('Phone number is required');
    }

    if (!data.currentJobTitle?.trim()) {
      errors.push('Current job title is required');
    }

    if (!data.yearsOfExperience?.trim()) {
      errors.push('Years of experience is required');
    }

    if (!data.coverLetter?.trim()) {
      errors.push('Cover letter is required');
    }

    if (!data.acceptTerms) {
      errors.push('You must accept the terms and conditions');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
