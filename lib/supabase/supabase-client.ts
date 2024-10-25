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
    evm_address: evmAddress
  };

  const secret = new TextEncoder().encode(supabaseJwtSecret);

  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .sign(secret);
}

export const createSupabaseClient = async (evmAddress?: string) => {
  const supabaseJWT = evmAddress ? await generateSupabaseJWT(evmAddress) : undefined;

  return createClient(supabaseUrl, supabaseAnonKey, {
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
};

// Create a default instance without auth
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
