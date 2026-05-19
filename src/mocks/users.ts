export type UserRole = 'administrador' | 'vendedor';

export interface MockUser {
  id: number;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  avatar?: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'administrador',
    name: 'Administrador General',
  },
  {
    id: 2,
    username: 'vendedor',
    password: 'venta123',
    role: 'vendedor',
    name: 'Vendedor',
  },
];

export function findUser(username: string, password: string): MockUser | null {
  return (
    MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    ) ?? null
  );
}
