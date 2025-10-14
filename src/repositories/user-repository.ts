import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, type User, type InsertUser } from '../db/schema.js';
import type { CreateUserData } from '../models/user.js';

export class UserRepository {
  async findByEmail(email: string): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.email, email.toLowerCase())).get();
  }

  async findById(id: string): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  async create(userData: CreateUserData): Promise<User> {
    const newUser: InsertUser = {
      ...userData,
      email: userData.email.toLowerCase(),
    };
    
    return db.insert(users).values(newUser).returning().get();
  }

  async updateLastLogin(id: string): Promise<void> {
    await db.update(users)
      .set({ 
        lastLoginAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
  }

  async updateRole(id: string, role: 'admin' | 'user'): Promise<void> {
    await db.update(users)
      .set({ 
        role,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    await db.update(users)
      .set({ 
        isActive,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return !!user;
  }

  async count(): Promise<number> {
    const result = await db.select({ count: users.id }).from(users);
    return result.length;
  }
}

export const userRepository = new UserRepository();