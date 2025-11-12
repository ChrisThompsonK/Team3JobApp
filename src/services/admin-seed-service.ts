export class AdminSeedService {
  async seedAdminUser(): Promise<void> {
    // Admin seeding has been moved to the backend
    // See backend src/seeds/ folder
    console.log('ℹ️ Admin seeding is now handled by the backend');
  }

  async ensureAdminExists(): Promise<void> {
    // Admin seeding has been moved to the backend
    // See backend src/seeds/ folder
    console.log('ℹ️ Admin seeding is now handled by the backend');
  }
}

export const adminSeedService = new AdminSeedService();
