import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export type Creature = {
  id: string;
  slug: string;
  name: string;
  alt_names: string[] | null;
  type: string | null;
  summary: string | null;
  story: string | null;
  powers: string | null;
  image_url: string | null;
  image_credit: string | null;
  creature_peoples?: { peoples: { name: string; region: string | null } }[];
  sources?: { id: number; citation: string; url: string | null }[];
};
