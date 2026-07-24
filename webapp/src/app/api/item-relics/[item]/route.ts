import { NextResponse } from 'next/server';
import { findRelicsForItem } from '@/lib/warframeData.js';
import { resolveAlias } from '@/lib/aliases.js';

export async function GET(request: Request, { params }: { params: Promise<{ item: string }> }) {
  const resolvedItem = resolveAlias((await params).item);
  return NextResponse.json({ relics: findRelicsForItem(resolvedItem) });
}