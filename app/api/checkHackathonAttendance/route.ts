import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const hackathon = searchParams.get('hackathon');
  const evmAddress = searchParams.get('evmAddress');

  if (!hackathon || !evmAddress) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('user_data')
      .select(`${hackathon}`)
      .eq('evm_address', evmAddress)
      .single();

    if (error) {
      console.error('Error fetching user data:', error);
      return NextResponse.json({ error: 'Error fetching user data' }, { status: 500 });
    }

    const isConfirmed = data ? !!data[hackathon as any] : false;

    return NextResponse.json({ isConfirmed });

  } catch (error) {
    console.error('Error checking hackathon attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
