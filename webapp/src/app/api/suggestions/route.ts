import { NextResponse } from 'next/server';
import { getSuggestions } from '@/lib/aliases.js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';
  return NextResponse.json({ suggestions: getSuggestions(query, type) });
}