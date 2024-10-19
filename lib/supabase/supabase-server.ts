import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase URL or Service Role Key");
}

// Creates a Supabase client with a service_role key
// This only works in the backend
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
