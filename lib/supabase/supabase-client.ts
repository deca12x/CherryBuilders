import { createClient } from "@supabase/supabase-js";
import * as jose from 'jose';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_ANON_KEY;
const supabaseJwtSecret = process.env.NEXT_PUBLIC_SUPABASE_JWT_SECRET;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key");
}

if (!supabaseJwtSecret) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_JWT_SECRET');
}

export async function generateSupabaseJWT(evmAddress: string) {
  const payload = {
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour from now
    sub: evmAddress,
    role: 'authenticated',
    evm_address: evmAddress,
    iat: Math.floor(Date.now() / 1000),
    iss: 'supabase'
  };

  console.log("JWT payload:", payload);

  const secret = new TextEncoder().encode(supabaseJwtSecret);

  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .sign(secret);
}

export const createSupabaseClient = async (evmAddress?: string) => {
  const supabaseJWT = evmAddress ? await generateSupabaseJWT(evmAddress) : undefined;

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
