import Link from "next/link";
import { supabase, Creature } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const TYPES = ["spirit", "hybrid", "animal", "monster"];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; people?: string; type?: string }>;
}) {
  const { q, people, type } = await searchParams;

  const [{ data: creatures }, { data: peoplesList }] = await Promise.all([
    supabase
      .from("creatures")
      .select("*, creature_peoples(peoples(name, region))")
      .order("name"),
    supabase.from("peoples").select("name").order("name"),
  ]);

  const list = ((creatures ?? []) as Creature[]).filter((c) => {
    const names = c.creature_peoples?.map((cp) => cp.peoples.name) ?? [];
    const text = [c.name, ...(c.alt_names ?? [])].join(" ").toLowerCase();
    return (
      (!q || text.includes(q.toLowerCase())) &&
      (!people || names.includes(people)) &&
      (!type || c.type === type)
    );
  });

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-4xl font-bold">Turkic Bestiary</h1>
      <p className="mt-2 text-gray-500">
        Mythological creatures of the Turkic world, in one place.
      </p>

      <form className="mt-6 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name..."
          className="rounded border px-3 py-2"
        />
        <select name="people" defaultValue={people ?? ""} className="rounded border px-3 py-2">
          <option value="">All peoples</option>
          {peoplesList?.map((p) => (
            <option key={p.name} value={p.name}>{p.name}</option>
          ))}
        </select>
        <select name="type" defaultValue={type ?? ""} className="rounded border px-3 py-2">
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button className="rounded bg-black px-4 py-2 text-white">Filter</button>
        <Link href="/" className="px-2 py-2 text-gray-500 underline">Reset</Link>
      </form>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <Link
            key={c.id}
            href={`/creature/${c.slug}`}
            className="overflow-hidden rounded-lg border transition hover:shadow-lg"
          >
            <div className="flex h-40 items-center justify-center bg-gray-100 text-5xl">
              {c.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image_url} alt={c.name} className="h-full w-full object-cover" />
              ) : (
                "🐉"
              )}
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold">{c.name}</h2>
              <p className="text-sm text-gray-500">
                {c.type} · {c.creature_peoples?.map((cp) => cp.peoples.name).join(", ")}
              </p>
              <p className="mt-2 text-sm">{c.summary}</p>
            </div>
          </Link>
        ))}
        {list.length === 0 && <p className="text-gray-500">No creatures match.</p>}
      </div>
    </main>
  );
}