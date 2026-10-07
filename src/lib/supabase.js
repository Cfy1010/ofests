import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const publishableKey = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Sans ces variables, le build échoue : Cloudflare garde le déploiement
// précédent au lieu de publier un site sans données.
if (!url || !publishableKey) {
  throw new Error(
    "PUBLIC_SUPABASE_URL et PUBLIC_SUPABASE_PUBLISHABLE_KEY sont requises (voir .env.example)",
  );
}

// Client de build : lecture anonyme, sans session.
// La clé publishable est publique ; la RLS décide de ce qui est lisible.
export const supabase = createClient(url, publishableKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
