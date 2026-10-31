import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUsersDB, saveUsersDB } from "@/lib/db";
import { newId } from "@/lib/utils/format"; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, currency } = body;

    if (!name || !email || !password || !currency) {
      return NextResponse.json({ error: "Dados em falta." }, { status: 400 });
    }

    const users = getUsersDB();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some((u) => u.email === normalizedEmail)) {
      return NextResponse.json({ error: "Já existe uma conta com este email." }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: newId(),
      name: name.trim(),
      email: normalizedEmail,
      currency,
      passwordHash,
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsersDB(users);

    const { passwordHash: _, ...profile } = newUser;
    return NextResponse.json({ user: profile }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}