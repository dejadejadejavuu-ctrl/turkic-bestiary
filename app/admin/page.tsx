"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Sub = {
  id: string;
  creature_id: string | null;
  payload: Record<string, string>;
  note: string | null;
  created_at: string;
};

export default function Admin() {
  const [ok, setOk] = useState<boolean | null>(null);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [current, setCurrent] = useState<Record<string, Record<string, string>>>({});
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const { data: admin } = await supabase.rpc("is_admin");
    setOk(!!admin);
    if (!admin) return;

    const { data } = await supabase
      .from("submissions")
      .select("*")
      .eq("status", "pending")
      .order("created_at");
    const list = (data ?? []) as Sub[];
    setSubs(list);

    const ids = list.map((s) => s.creature_id).filter(Boolean) as string[];
    if (ids.length) {
      const { data: cs } = await supabase.from("creatures").select("*").in("id", ids);
      const map: Record<string, Record<string, string>> = {};
      cs?.forEach((c) => (map[c.id] = c));
      setCurrent(map);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function approve(id: string) {
    const { error } = await supabase.rpc("approve_submission", { sub: id });
    if (error) setErr(error.message);
    else load();
  }

  async function reject(id: string) {
    const reason = prompt("Reason for rejecting (optional)") ?? "";
    const { error } = await supabase
      .from("submissions")
      .update({ status: "rejected", reject_reason: reason })
      .eq("id", id);
    if (error) setErr(error.message);
    else load();
  }

  if (ok === null) return <p className="p-6">Loading...</p>;
  if (!ok) return <p className="p-6">Admins only. Sign in with your admin account.</p>;

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold">Pending submissions ({subs.length})</h1>
      {err && <p className="mt-2 text-red-600">{err}</p>}

      {subs.map((s) => {
        const cur = s.creature_id ? current[s.creature_id] : null;
        return (
          <section key={s.id} className="mt-6 rounded border p-4">
            <h2 className="text-xl font-semibold">
              {cur ? `Edit: ${cur.name}` : `New creature: ${s.payload.name}`}
            </h2>
            {s.note && <p className="mt-1 text-sm text-gray-600">Note: {s.note}</p>}

            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="w-28">Field</th>
                  <th>Current</th>
                  <th>Proposed</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(s.payload).map(([k, v]) => {
                  const old = cur?.[k] ?? "";
                  return (
                    <tr key={k} className="align-top">
                      <td className="py-1 font-medium">{k}</td>
                      <td className="py-1 pr-3 text-gray-500">{old || "-"}</td>
                      <td className={`py-1 ${v !== old ? "bg-green-50" : ""}`}>{v}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-4 flex gap-3">
              <button onClick={() => approve(s.id)} className="rounded bg-green-700 px-4 py-2 text-white">
                Approve
              </button>
              <button onClick={() => reject(s.id)} className="rounded border px-4 py-2">
                Reject
              </button>
            </div>
          </section>
        );
      })}
      {subs.length === 0 && <p className="mt-6 text-gray-500">Nothing to review.</p>}
    </main>
  );
}