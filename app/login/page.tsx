"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setMsg(error.message);
    router.push("/");
  }

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    setMsg(error ? error.message : "Account created. You can now sign in.");
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <input
        className="mt-6 w-full rounded border px-3 py-2"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="mt-3 w-full rounded border px-3 py-2"
        placeholder="Password (min 6 characters)"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="mt-4 flex gap-3">
        <button onClick={signIn} className="rounded bg-black px-4 py-2 text-white">Sign in</button>
        <button onClick={signUp} className="rounded border px-4 py-2">Sign up</button>
      </div>
      {msg && <p className="mt-4 text-sm text-gray-600">{msg}</p>}
    </main>
  );
}