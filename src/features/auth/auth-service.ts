import type { CurrencyCode, Profile } from "@/types";
import { newId } from "@/lib/utils/format";

const USERS_KEY = "investtrack:users";
const SESSION_KEY = "investtrack:session";

function readLocalUsers(): Profile[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as Profile[];
  } catch {
    return [];
  }
}

function writeLocalUsers(users: Profile[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession(): Profile | null {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return readLocalUsers().find((u) => u.id === id) ?? null;
}

export async function signUp(input: {
  name: string;
  email: string;
  currency: CurrencyCode;
  password?: string; 
}): Promise<Profile> {
  
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Erro ao criar conta.");
  }

  const profile = data.user as Profile;

  localStorage.setItem(SESSION_KEY, profile.id);
  
  const localUsers = readLocalUsers();
  writeLocalUsers([...localUsers, profile]);

  return profile;
}

export async function signIn(input: { email: string; password?: string }): Promise<Profile> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Email ou palavra-passe incorrectos.");
  }

  const profile = data.user as Profile;

  localStorage.setItem(SESSION_KEY, profile.id);

  const localUsers = readLocalUsers();
  if (!localUsers.some(u => u.id === profile.id)) {
    writeLocalUsers([...localUsers, profile]);
  }

  return profile;
}

export async function signOut(): Promise<void> {
  localStorage.removeItem(SESSION_KEY);
}

export async function requestPasswordReset(): Promise<void> {
  return; 
}

export async function updateProfile(
  id: string,
  patch: Pick<Profile, "name" | "currency">,
): Promise<Profile> {
  const users = readLocalUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) throw new Error("Perfil não encontrado.");
  users[index] = { ...users[index], ...patch };
  writeLocalUsers(users);
  return users[index];
}