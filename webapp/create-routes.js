const fs = require('fs');
const path = require('path');
const base = 'e:/Oasobi/webapp/src/app/api';

const routes = {
  'chat/route.ts': `import { NextResponse } from 'next/server';
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
}`,
  'relics/route.ts': `import { NextResponse } from 'next/server';
import { searchRelics, isCacheReady, initDataCache } from '@/lib/warframeData.js';

export async function GET(request: Request) {
  if (!isCacheReady) await initDataCache();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  return NextResponse.json(searchRelics(query));
}`,
  'warframes/[name]/route.ts': `import { NextResponse } from 'next/server';
import { searchWarframeParts, isCacheReady, initDataCache } from '@/lib/warframeData.js';
import { resolveAlias } from '@/lib/aliases.js';

export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  if (!isCacheReady) await initDataCache();
  const resolvedName = resolveAlias((await params).name);
  return NextResponse.json(searchWarframeParts(resolvedName));
}`,
  'vaulted/route.ts': `import { NextResponse } from 'next/server';
import { getVaultedPrimes, isCacheReady, initDataCache } from '@/lib/warframeData.js';

export async function GET() {
  if (!isCacheReady) await initDataCache();
  return NextResponse.json(getVaultedPrimes());
}`,
  'item-relics/[item]/route.ts': `import { NextResponse } from 'next/server';
import { findRelicsForItem } from '@/lib/warframeData.js';
import { resolveAlias } from '@/lib/aliases.js';

export async function GET(request: Request, { params }: { params: Promise<{ item: string }> }) {
  const resolvedItem = resolveAlias((await params).item);
  return NextResponse.json({ relics: findRelicsForItem(resolvedItem) });
}`,
  'item-locations/[item]/route.ts': `import { NextResponse } from 'next/server';
import { findLocationsForItem } from '@/lib/warframeData.js';
import { resolveAlias } from '@/lib/aliases.js';

export async function GET(request: Request, { params }: { params: Promise<{ item: string }> }) {
  const resolvedItem = resolveAlias((await params).item);
  return NextResponse.json({ locations: findLocationsForItem(resolvedItem) });
}`,
  'resources/route.ts': `import { NextResponse } from 'next/server';
import { staticResources } from '@/lib/staticResources.js';

export async function GET() {
  return NextResponse.json({ resources: staticResources });
}`,
  'augments/route.ts': `import { NextResponse } from 'next/server';
import { staticBuilds } from '@/lib/staticBuilds.js';

export async function GET() {
  const augmentsList = [];
  for (const [frameName, frameData] of Object.entries(staticBuilds.frames)) {
    if (frameData.augments && frameData.augments.length > 0) {
      frameData.augments.forEach(aug => {
        augmentsList.push({
          frame: frameData.itemName,
          modName: aug.name,
          effect: aug.effect,
          syndicate: aug.syndicate || '不明'
        });
      });
    }
  }
  return NextResponse.json({ augments: augmentsList });
}`,
  'suggestions/route.ts': `import { NextResponse } from 'next/server';
import { getSuggestions } from '@/lib/aliases.js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';
  return NextResponse.json({ suggestions: getSuggestions(query, type) });
}`,
  'builds/[item]/route.ts': `import { NextResponse } from 'next/server';
import { generateWarframeBuild } from '@/lib/ordisAi.js';
import { resolveAlias } from '@/lib/aliases.js';

export async function GET(request: Request, { params }: { params: Promise<{ item: string }> }) {
  try {
    const apiKey = request.headers.get('x-api-key') || process.env.GEMINI_API_KEY;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'Warframe';
    const resolvedItem = resolveAlias((await params).item);
    const buildData = await generateWarframeBuild(resolvedItem, apiKey, category);
    return NextResponse.json(buildData);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to generate build data. ' + error.message }, { status: 500 });
  }
}`
};

for (const [routePath, content] of Object.entries(routes)) {
  const fullPath = path.join(base, routePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('API Routes created successfully.');
