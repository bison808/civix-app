// Shared user storage for authentication routes
// In production, this would be replaced with a database

export interface SecureUser {
  email: string;
  passwordHash: string;
  zipCode: string;
  createdAt: string;
  lastLoginAt?: string;
}

// Global user storage (in-memory for development)
const users = new Map<string, SecureUser>();

export { users };