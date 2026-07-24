import { NextResponse } from 'next/server';
import { sendOrdisMessage } from '@/lib/ordisAi.js';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const apiKey = request.headers.get('x-api-key') || process.env.GEMINI_API_KEY;
    const reply = await sendOrdisMessage(message, apiKey);
    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ error: 'Ordis failed to respond.' }, { status: 500 });
  }
}