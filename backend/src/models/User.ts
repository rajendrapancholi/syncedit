export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

