import { NextResponse } from 'next/server';
import { searchWarframeParts, isCacheReady, initDataCache } from '@/lib/warframeData.js';
import { resolveAlias } from '@/lib/aliases.js';

export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  if (!isCacheReady) await initDataCache();
  const resolvedName = resolveAlias((await params).name);
  return NextResponse.json(searchWarframeParts(resolvedName));
}