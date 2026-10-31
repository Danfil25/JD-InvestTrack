import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUsersDB } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Dados em falta." }, { status: 400 });
    }

    const users = getUsersDB();
    const normalizedEmail = email.trim().toLowerCase();
    
    const user = users.find((u) => u.email === normalizedEmail);

    if (!user) {
      return NextResponse.json({ error: "Email ou palavra-passe incorrectos." }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Email ou palavra-passe incorrectos." }, { status: 401 });
    }

    const { passwordHash: _, ...profile } = user;
    return NextResponse.json({ user: profile }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}