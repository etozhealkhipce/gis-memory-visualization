export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";

export async function GET() {
  const hasApiKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith("sk-");
  
  return NextResponse.json({
    hasApiKey,
    mode: hasApiKey ? "openai" : "mock",
  });
}
