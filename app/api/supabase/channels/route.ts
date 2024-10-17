import { supabase } from "@/lib/supabase";
import { ChatMessage } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const channels = supabase.getChannels();
  return NextResponse.json({ channels }, { status: 200 });
}

export async function DELETE(req: NextRequest) {
  const { channel } = await req.json();
  const result = await supabase.removeChannel(channel);

  if (result === "error" || result === "timed out") {
    return NextResponse.json({ error: "Error deleting channel" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
