export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface ISignUp {
  name: string;
  email: string;
  password: string;
  photoUrl?: string;
}
