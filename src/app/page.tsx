import { redirect } from "next/navigation";

// A protecção das rotas privadas está em (dashboard)/layout.tsx.
export default function Home() {
  redirect("/dashboard");
}
