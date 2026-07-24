import { NextResponse } from 'next/server';
import { getVaultedPrimes, isCacheReady, initDataCache } from '@/lib/warframeData.js';

export async function GET() {
  if (!isCacheReady) await initDataCache();
  return NextResponse.json(getVaultedPrimes());
}