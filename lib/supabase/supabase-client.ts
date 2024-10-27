import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key");
}

export const createSupabaseClient = async (evmAddress?: string, privyAuthToken?: string) => {
  let supabaseJWT;
  
  if (evmAddress && privyAuthToken) {
    const response = await fetch('/api/auth/supabase-token', {
      headers: {
        Authorization: `Bearer ${privyAuthToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get Supabase token');
    }
    
    const data = await response.json();
    supabaseJWT = data.token;
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: supabaseJWT ? { Authorization: `Bearer ${supabaseJWT}` } : {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  if (supabaseJWT) {
    client.auth.setSession({ access_token: supabaseJWT, refresh_token: '' });
    client.realtime.setAuth(supabaseJWT);
  }

  return client;
};

// Create a default instance without auth
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
