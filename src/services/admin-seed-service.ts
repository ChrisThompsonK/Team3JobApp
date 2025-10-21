import bcrypt from 'bcrypt';
import { config } from '../config/index.js';
import type { CreateUserData } from '../models/user.js';
import { userRepository } from '../repositories/user-repository.js';

export class AdminSeedService {
  async seedAdminUser(): Promise<void> {
    const adminEmail = process.env['ADMIN_SEED_EMAIL'];
    const adminPassword = process.env['ADMIN_SEED_PASSWORD'];

    if (!adminEmail || !adminPassword) {
      console.warn('⚠️ Admin seed credentials not provided in environment variables');
      return;
    }

    try {
      // Check if admin user already exists
      const existingAdmin = await userRepository.findByEmail(adminEmail);

      if (existingAdmin) {
        console.log('✅ Admin user already exists');

        // Check if password is still the default and warn
        if (adminPassword === 'ChangeMe123!') {
          console.warn(
            '⚠️ WARNING: Admin is using default password! Please change it immediately for security.'
          );
        }
        return;
      }

      // Hash the password using config
      const passwordHash = await bcrypt.hash(adminPassword, config.auth.password.saltRounds);

      // Create admin user
      const adminData: CreateUserData = {
        email: adminEmail.toLowerCase(),
        passwordHash,
        role: 'admin',
        isActive: true,
      };

      await userRepository.create(adminData);
      console.log('✅ Admin user created successfully');

      // Warn if using default password
      if (adminPassword === 'ChangeMe123!') {
        console.warn(
          '⚠️ WARNING: Admin was created with default password! Please login and change it immediately.'
        );
        console.warn('   Login URL: /auth/login');
        console.warn(`   Email: ${adminEmail}`);
      }
    } catch (error) {
      console.error('❌ Failed to seed admin user:', error);
      throw error;
    }
  }

  async ensureAdminExists(): Promise<void> {
    try {
      // Count total users to see if this is a fresh installation
      const userCount = await userRepository.count();

      if (userCount === 0) {
        console.log('📚 Fresh installation detected, seeding admin user...');
        await this.seedAdminUser();
      } else {
        // Check if any admin exists
        const adminEmail = process.env['ADMIN_SEED_EMAIL'];
        if (adminEmail) {
          const adminExists = await userRepository.findByEmail(adminEmail);
          if (!adminExists) {
            console.log('👤 No admin user found, creating one...');
            await this.seedAdminUser();
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to ensure admin exists:', error);
      // Don't throw - let the application continue to start
    }
  }
}

export const adminSeedService = new AdminSeedService();
