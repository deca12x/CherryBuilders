import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { hackathon, otp, evmAddress } = await request.json();

    // Check if the hackathon is supported
    if (hackathon !== 'LANNA_2024') {
      return NextResponse.json({ error: 'Unsupported hackathon' }, { status: 400 });
    }

    // Get the OTP from environment variables
    const correctOTP = process.env.LANNA_2024_OTP;

    if (!correctOTP) {
      return NextResponse.json({ error: 'OTP not configured for this hackathon' }, { status: 500 });
    }

    // Compare the provided OTP with the correct OTP
    if (otp === correctOTP) {
      // Update the user's LANNA_2024 column in the database
      const { data, error } = await supabase
        .from('user_data')
        .update({ LANNA_2024: true })
        .eq('evm_address', evmAddress);

      if (error) {
        console.error('Error updating user data:', error);
        return NextResponse.json({ error: 'Failed to update user data' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'OTP verified and attendance confirmed' });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
