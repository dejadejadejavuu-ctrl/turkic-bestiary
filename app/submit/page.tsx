"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const FIELDS = ["name", "type", "summary", "story", "powers", "image_url", "image_credit"] as const;

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function SubmitForm() {
  const slug = useSearchParams().get("creature");
  const [creatureId, setCreatureId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [user, setUser] = useState<boolean | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(!!data.user));
    if (slug) {
      supabase.from("creatures").select("*").eq("slug", slug).single().then(({ data }) => {
        if (!data) return;
        setCreatureId(data.id);
        const f: Record<string, string> = {};
        FIELDS.forEach((k) => (f[k] = data[k] ?? ""));
        setForm(f);
      });
    }
  }, [slug]);

  async function send() {
    const payload: Record<string, string> = {};
    FIELDS.forEach((k) => {
      if (form[k]?.trim()) payload[k] = form[k].trim();
    });
    if (!creatureId) {
      if (!payload.name) return setMsg("Name is required.");
      payload.slug = slugify(payload.name);
    }
    const { error } = await supabase
      .from("submissions")
      .insert({ creature_id: creatureId, payload, note });
    setMsg(error ? error.message : "Thanks! Your submission is waiting for review.");
  }

  if (user === false)
    return (
      <p className="p-6">
        Please <Link href="/login" className="underline">sign in</Link> first.
      </p>
    );

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/" className="text-gray-500 underline">← Back</Link>
      <h1 className="mt-4 text-3xl font-bold">
        {creatureId ? `Suggest an edit: ${form.name}` : "Suggest a new creature"}
      </h1>

      {FIELDS.map((k) => (
        <label key={k} className="mt-4 block">
          <span className="text-sm text-gray-600">{k.replace("_", " ")}</span>
          {["summary", "story", "powers"].includes(k) ? (
            <textarea
              rows={k === "story" ? 8 : 3}
              className="w-full rounded border px-3 py-2"
              value={form[k] ?? ""}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          ) : (
            <input
              className="w-full rounded border px-3 py-2"
              value={form[k] ?? ""}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          )}
        </label>
      ))}

      <label className="mt-4 block">
        <span className="text-sm text-gray-600">Your sources / note to the reviewer</span>
        <textarea
          rows={3}
          className="w-full rounded border px-3 py-2"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      <button onClick={send} className="mt-6 rounded bg-black px-4 py-2 text-white">
        Submit for review
      </button>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </main>
  );
}

export default function Submit() {
  return (
    <Suspense>
      <SubmitForm />
    </Suspense>
  );
}