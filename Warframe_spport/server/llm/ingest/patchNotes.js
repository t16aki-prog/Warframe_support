// server/llm/ingest/patchNotes.js
// 公式フォーラムの公開RSS（PC Update Notes）からパッチノートを取り込む。
// HTMLページのクロールはせず、RSSの1リクエストのみ。本文は短い抜粋と出典URLだけ保持する。

import { safeFetch } from '../sourceAllowlist.js';
import { PATCH_NOTES_RSS_URL, PATCH_NOTES_MIN_INTERVAL_MS, PATCH_EXCERPT_MAX_CHARS, MAX_PATCH_NOTES_KEPT } from '../config.js';
import { loadKnowledge, replaceSourceDocs } from '../knowledgeStore.js';

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };

function decode(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m] ?? m)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

function stripHtml(html) {
  return decode(html)
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>|<\/p>|<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const tag = (xml, name) => (xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`)) || [])[1] ?? '';

export function parseRss(xml) {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  return items.slice(0, MAX_PATCH_NOTES_KEPT).map((item) => {
    const link = decode(tag(item, 'link')).trim();
    const safeLink = link.startsWith('https://forums.warframe.com/') ? link : undefined;
    return {
      id: `pn:${decode(tag(item, 'guid')) || link}`,
      source: 'patchnotes',
      title: stripHtml(tag(item, 'title')),
      text: stripHtml(tag(item, 'description')).slice(0, PATCH_EXCERPT_MAX_CHARS),
      url: safeLink,
      publishedAt: tag(item, 'pubDate'),
      fetchedAt: new Date().toISOString(),
    };
  });
}

export async function ingestPatchNotes({ force = false } = {}) {
  const last = loadKnowledge().lastFetched.patchnotes || 0;
  if (!force && Date.now() - last < PATCH_NOTES_MIN_INTERVAL_MS) {
    return { skipped: true, reason: 'interval', nextAllowedAt: last + PATCH_NOTES_MIN_INTERVAL_MS };
  }
  const docs = parseRss(await safeFetch(PATCH_NOTES_RSS_URL));
  replaceSourceDocs('patchnotes', docs);
  return { skipped: false, count: docs.length };
}
