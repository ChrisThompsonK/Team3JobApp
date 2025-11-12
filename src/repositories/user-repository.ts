// NOTE: User repository has been moved to the backend
// Frontend no longer manages user data directly
// All user operations go through backend API at /api/auth

export class UserRepository {
  // Deprecated - all user operations are now on the backend
  async findByEmail(_email: string) {
    throw new Error('User repository is deprecated. Use backend API instead.');
  }

  async findById(_id: string) {
    throw new Error('User repository is deprecated. Use backend API instead.');
  }

  async create(_userData: any) {
    throw new Error('User repository is deprecated. Use backend API instead.');
  }

  async updateLastLogin(_id: string) {
    throw new Error('User repository is deprecated. Use backend API instead.');
  }

  async updateRole(_id: string, _role: string) {
    throw new Error('User repository is deprecated. Use backend API instead.');
  }

  async setActive(_id: string, _isActive: boolean) {
    throw new Error('User repository is deprecated. Use backend API instead.');
  }

  async emailExists(_email: string) {
    throw new Error('User repository is deprecated. Use backend API instead.');
  }

  async count() {
    throw new Error('User repository is deprecated. Use backend API instead.');
  }
}

export const userRepository = new UserRepository();
