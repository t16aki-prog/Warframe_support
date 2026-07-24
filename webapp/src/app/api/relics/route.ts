import { NextResponse } from 'next/server';
import { searchRelics, isCacheReady, initDataCache } from '@/lib/warframeData.js';

export async function GET(request: Request) {
  if (!isCacheReady) await initDataCache();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  return NextResponse.json(searchRelics(query));
}