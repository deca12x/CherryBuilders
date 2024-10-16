import { createClient } from "@supabase/supabase-js";

// Creates a Supabase client
// This only works in the backend
export const supabase = createClient(process.env.SUPABASE_URL as string, process.env.ANON_KEY as string, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
