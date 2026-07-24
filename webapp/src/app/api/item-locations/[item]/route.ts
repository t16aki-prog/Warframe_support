import { NextResponse } from 'next/server';
import { findLocationsForItem } from '@/lib/warframeData.js';
import { resolveAlias } from '@/lib/aliases.js';

export async function GET(request: Request, { params }: { params: Promise<{ item: string }> }) {
  const resolvedItem = resolveAlias((await params).item);
  return NextResponse.json({ locations: findLocationsForItem(resolvedItem) });
}