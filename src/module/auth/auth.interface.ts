export interface ILoginPayload {
  email: string;
  password: string;
}

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

export interface IJwtPayload {
  userId: string;
  email: string;
  role: Role;
}
