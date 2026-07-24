import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translateText } from './translateDict.js';

const CACHE_FILE = path.join(process.cwd(), 'src', 'lib', 'dataCache.json');

let itemsCache = [];
let dropsCache = [];
let lastFetch = 0;

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export let isCacheReady = false;

export async function initDataCache() {
  const now = Date.now();
  
  // Try loading from local file first
  if (itemsCache.length === 0 && fs.existsSync(CACHE_FILE)) {
    try {
      const fileData = fs.readFileSync(CACHE_FILE, 'utf8');
      const parsed = JSON.parse(fileData);
      
      // Check if cache is not expired
      if (now - parsed.lastFetch < CACHE_DURATION) {
        itemsCache = parsed.items;
        dropsCache = parsed.drops;
        lastFetch = parsed.lastFetch;
        isCacheReady = true;
        console.log(`Loaded cache from disk: ${itemsCache.length} items, ${dropsCache.length} drops.`);
        return;
      }
    } catch (e) {
      console.warn("Failed to read local cache, fetching fresh...");
    }
  }

  if (itemsCache.length > 0 && dropsCache.length > 0 && (now - lastFetch < CACHE_DURATION)) {
    isCacheReady = true;
    return; // Cache is still valid in memory
  }

  console.log('Fetching Warframe items and drops data. This might take a moment...');
  try {
    const [itemsRes, dropsRes] = await Promise.all([
      fetch('https://api.warframestat.us/items?language=ja'),
      fetch('https://api.warframestat.us/drops?language=ja')
    ]);

    if (!itemsRes.ok || !dropsRes.ok) {
      throw new Error('Failed to fetch data from Warframestat API');
    }

    itemsCache = await itemsRes.json();
    dropsCache = await dropsRes.json();
    lastFetch = Date.now();
    isCacheReady = true;
    
    // Save to disk
    try {
      fs.writeFileSync(CACHE_FILE, JSON.stringify({
        lastFetch: lastFetch,
        items: itemsCache,
        drops: dropsCache
      }), 'utf8');
      console.log('Saved data cache to disk.');
    } catch (e) {
      console.error('Failed to save cache to disk:', e);
    }
    
    console.log(`Cache updated: ${itemsCache.length} items, ${dropsCache.length} drops entries loaded.`);
  } catch (error) {
    console.error('Error initializing data cache:', error);
  }
}

// 1. Get Relic drop sources and contents
export function searchRelics(relicName) {
  if (!relicName) return [];
  // Example query: 'Lith G1', 'Axi L4'
  const query = relicName.toLowerCase();
  
  // Find contents of the relic from items cache
  const relicItems = itemsCache.filter(item => 
    item.type === 'Relic' && item.name.toLowerCase().includes(query)
  );

  // Find where the relic drops from drops cache
  const relicDropsLocations = dropsCache.filter(drop => 
    drop.item.toLowerCase().includes(query + ' relic') || drop.item.toLowerCase().includes(query + ' レリック')
  );

  return {
    relics: relicItems.map(r => ({
      name: r.name,
      vaulted: r.vaulted,
      rewards: r.rewards || []
    })),
    dropLocations: relicDropsLocations.map(d => ({
      ...d,
      place: translateText(d.place)
    })).slice(0, 10)
  };
}

// 2. Get Warframe acquisition
export function searchWarframeParts(frameName) {
  if (!frameName) return [];
  // "Prime" と検索された場合でも通常版とプライム版を一緒に出すため、"prime"をクエリから取り除く
  const query = frameName.toLowerCase().replace(' prime', '').trim();
  
  // Find frame and its parts in items
  const parts = itemsCache.filter(item => 
    (item.category === 'Warframes' || item.type === 'Warframe Blueprint') && 
    item.name.toLowerCase().includes(query)
  );

  // Find drop locations for these parts
  const partNames = parts.map(p => p.name);
  const partDropsLocations = dropsCache.filter(drop => 
    partNames.some(pn => drop.item.toLowerCase() === pn.toLowerCase())
  );

  return {
    parts: parts.map(p => {
      // 当該パーツ（フレーム本体）のドロップ（通常は無いが念のため）
      const partDrops = dropsCache
        .filter(drop => drop.item.toLowerCase() === p.name.toLowerCase())
        .map(d => ({
          place: translateText(d.place || d.location),
          chance: d.chance,
          rarity: d.rarity
        }));
        
      // コンポーネント（設計図、ニューロプティック等）ごとのドロップを抽出
      const enrichedComponents = (p.components || []).map(comp => {
        let compDrops = (comp.drops || []).map(d => ({
          place: translateText(d.location || d.place),
          chance: d.chance,
          rarity: d.rarity
        }));

        // Fallback to dropsCache if native drops are missing
        if (compDrops.length === 0) {
          const frameBaseName = p.name.replace(' Prime', '').toLowerCase();
          compDrops = dropsCache
            .filter(drop => 
              drop.item.toLowerCase().includes(comp.name.toLowerCase()) && 
              drop.item.toLowerCase().includes(frameBaseName)
            )
            .map(d => ({
              place: translateText(d.place || d.location),
              chance: d.chance,
              rarity: d.rarity
            }));
        }

        return { ...comp, drops: compDrops };
      });
        
      return {
        name: translateText(p.name),
        description: translateText(p.description),
        components: enrichedComponents,
        drops: partDrops
      };
    }),
    dropLocations: partDropsLocations.map(d => ({
      ...d,
      place: translateText(d.place || d.location)
    })).slice(0, 20)
  };
}

// 3. Get Vaulted Primes
export function getVaultedPrimes() {
  return itemsCache
    .filter(item => item.name.includes('Prime') && item.vaulted)
    .map(item => ({
      name: item.name,
      category: item.category
    }));
}

/**
 * 特定のアイテム（例: "Rhino Prime Blueprint"）が入っているレリックをすべて検索する
 */
export function findRelicsForItem(itemName) {
  const resultRelics = [];
  
  if (!itemName) return resultRelics;
  
  const searchName = itemName.toLowerCase();

  for (const relic of itemsCache) {
    if (relic.type === 'Relic' && relic.rewards) {
      for (const reward of relic.rewards) {
        if (reward.item && reward.item.toLowerCase().includes(searchName)) {
          resultRelics.push({
            tier: relic.name.split(' ')[0], // "Lith", "Meso" etc
            relicName: relic.name,
            vaulted: relic.vaulted,
            rarity: reward.rarity,
            chance: reward.chance
          });
        }
      }
    }
  }

  return resultRelics;
}

/**
 * 特定のアイテムがドロップするノード名（ミッション）のリストを取得する
 */
export function findLocationsForItem(itemName) {
  const resultLocations = new Set();
  
  if (!itemName) return [];
  
  const searchName = itemName.toLowerCase();

  for (const drop of dropsCache) {
    if (drop.item && drop.item.toLowerCase().includes(searchName)) {
      // プレイス名（ノード名）を取得。英語名のまま返すか、翻訳してもよいが、
      // Dashboard側でマッチングさせるため、一旦英語ノード名を返す
      if (drop.location) {
        resultLocations.add(drop.location);
      } else if (drop.place) {
        resultLocations.add(drop.place);
      }
    }
  }

  return Array.from(resultLocations);
}

export function getItemsCache() { return itemsCache; }
export function getDropsCache() { return dropsCache; }
