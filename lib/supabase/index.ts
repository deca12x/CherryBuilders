import { createClient } from "@supabase/supabase-js";

// Creates a Supabase client with an anon key
// This works both on backend and frontend
export const supabaseAnonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_ANON_KEY as string,
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Creates a Supabase client with a service_role key
// This only works in the backend
export const supabaseServiceRoleClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SERVICE_ROLE_KEY as string,
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
