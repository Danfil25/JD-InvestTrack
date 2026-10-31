/**
 * ⚠️ SERVIÇO DE AUTENTICAÇÃO PROVISÓRIO (apenas frontend).
 *
 * Guarda o perfil e a sessão em localStorage e NÃO verifica palavras-passe.
 * Serve exclusivamente para desenvolver e testar a interface.
 * Na fase de backend, substituir o corpo destas funções por chamadas ao
 * Supabase Auth (signUp, signInWithPassword, signOut, resetPasswordForEmail,
 * getSession) mantendo as mesmas assinaturas.
 */
import type { CurrencyCode, Profile } from "@/types";
import { newId } from "@/lib/utils/format";

const USERS_KEY = "investtrack:users";
const SESSION_KEY = "investtrack:session";

function readUsers(): Profile[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as Profile[];
  } catch {
    return [];
  }
}

function writeUsers(users: Profile[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession(): Profile | null {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return readUsers().find((u) => u.id === id) ?? null;
}

export async function signUp(input: {
  name: string;
  email: string;
  currency: CurrencyCode;
}): Promise<Profile> {
  const users = readUsers();
  const email = input.email.trim().toLowerCase();
  if (users.some((u) => u.email === email)) {
    throw new Error("Já existe uma conta com este email.");
  }
  const profile: Profile = {
    id: newId(),
    name: input.name.trim(),
    email,
    currency: input.currency,
    created_at: new Date().toISOString(),
  };
  writeUsers([...users, profile]);
  localStorage.setItem(SESSION_KEY, profile.id);
  return profile;
}

export async function signIn(input: { email: string }): Promise<Profile> {
  const email = input.email.trim().toLowerCase();
  const profile = readUsers().find((u) => u.email === email);
  // Mensagem genérica: não revelar se o email existe.
  if (!profile) throw new Error("Email ou palavra-passe incorrectos.");
  localStorage.setItem(SESSION_KEY, profile.id);
  return profile;
}

export async function signOut(): Promise<void> {
  localStorage.removeItem(SESSION_KEY);
}

export async function requestPasswordReset(): Promise<void> {
  // Provisório: com Supabase → auth.resetPasswordForEmail(email).
  // Resposta sempre igual, exista ou não a conta.
  return;
}

export async function updateProfile(
  id: string,
  patch: Pick<Profile, "name" | "currency">,
): Promise<Profile> {
  const users = readUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) throw new Error("Perfil não encontrado.");
  users[index] = { ...users[index], ...patch };
  writeUsers(users);
  return users[index];
}
