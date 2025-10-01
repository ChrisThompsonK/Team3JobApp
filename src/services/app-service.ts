import type { AppInfo } from '../models/app-info.js';
import { AppRepository } from '../repositories/app-repository.js';

/**
 * Application Service
 * Contains business logic for application operations
 */
export const AppService = {
  /**
   * Get application information with business logic
   */
  getAppInfo(userName = 'Developer'): AppInfo {
    // Business logic: validate user name
    const validatedUserName = userName.trim() || 'Guest';

    // Get data from repository
    return AppRepository.getAppInfo(validatedUserName);
  },
} as const;
