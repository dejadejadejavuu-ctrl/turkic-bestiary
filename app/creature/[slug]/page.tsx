import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, Creature } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function CreaturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data } = await supabase
    .from("creatures")
    .select("*, creature_peoples(peoples(name, region)), sources(*)")
    .eq("slug", slug)
    .single();

  if (!data) notFound();
  const c = data as Creature;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/" className="text-gray-500 underline">← All creatures</Link>

      <h1 className="mt-4 text-4xl font-bold">{c.name}</h1>
      {c.alt_names && c.alt_names.length > 0 && (
        <p className="text-gray-500">Also known as: {c.alt_names.join(", ")}</p>
      )}

      <div className="mt-6 flex h-64 items-center justify-center rounded-lg bg-gray-100 text-7xl">
        {c.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.image_url} alt={c.name} className="h-full w-full rounded-lg object-cover" />
        ) : (
          "🐉"
        )}
      </div>
      {c.image_credit && <p className="mt-1 text-xs text-gray-500">Image: {c.image_credit}</p>}

      <p className="mt-6 text-sm uppercase tracking-wide text-gray-500">
        {c.type} · Origin: {c.creature_peoples?.map((cp) => cp.peoples.name).join(", ")}
      </p>

      <h2 className="mt-6 text-2xl font-semibold">Story</h2>
      <p className="mt-2 leading-relaxed">{c.story}</p>

      {c.powers && (
        <>
          <h2 className="mt-6 text-2xl font-semibold">Powers</h2>
          <p className="mt-2">{c.powers}</p>
        </>
      )}

      {c.sources && c.sources.length > 0 && (
        <>
          <h2 className="mt-6 text-2xl font-semibold">Sources</h2>
          <ul className="mt-2 list-disc pl-5">
            {c.sources.map((s) => (
              <li key={s.id}>
                {s.url ? <a href={s.url} className="underline">{s.citation}</a> : s.citation}
              </li>
            ))}
          </ul>
        </>
      )}

      <Link
        href={`/submit?creature=${c.slug}`}
        className="mt-8 inline-block rounded border px-4 py-2"
      >
        Suggest an edit
      </Link>
    </main>
  );
}