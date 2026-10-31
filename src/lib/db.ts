import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'users.json');

export type UserDB = {
  id: string;
  name: string;
  email: string;
  currency: string;
  passwordHash: string;
  created_at: string;
};

export function getUsersDB(): UserDB[] {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data) as UserDB[];
  } catch (error) {
    console.error("Erro ao ler a base de dados JSON:", error);
    return [];
  }
}

export function saveUsersDB(users: UserDB[]) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2), 'utf8');
  } catch (error) {
    console.error("Erro ao escrever na base de dados JSON:", error);
  }
}