import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { initDataCache, searchRelics, searchWarframeParts, getVaultedPrimes, findRelicsForItem, findLocationsForItem, isCacheReady, getLatestPrimes } from './warframeData.js';
import { sendOrdisMessage, generateWarframeBuild } from './ordisAi.js';
import { resolveAlias, getSuggestions } from './aliases.js';
import { staticBuilds } from './staticBuilds.js';
import { staticResources } from './staticResources.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('chat_message', async (data) => {
    // 1. Broadcast the user's message immediately
    io.emit('chat_message', {
      ...data,
      id: Date.now() + Math.random().toString(36).substr(2, 9)
    });

    // 2. Send to Ordis AI and broadcast Ordis' response
    if (data.username !== 'Ordis') {
      try {
        const ordisReply = await sendOrdisMessage(data.message);
        io.emit('chat_message', {
          username: 'Ordis',
          message: ordisReply,
          timestamp: new Date().toISOString(),
          id: Date.now() + Math.random().toString(36).substr(2, 9)
        });
      } catch (error) {
        console.error('Failed to get Ordis response:', error);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// --- API Endpoints ---
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  const apiKey = req.headers['x-api-key'];
  try {
    const reply = await sendOrdisMessage(message, apiKey, history);
    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Ordis failed to respond.' });
  }
});

app.get('/api/relics', (req, res) => {
  if (!isCacheReady) return res.status(503).json({ error: "データベースを構築中です。数秒お待ちください..." });
  const query = req.query.q || '';
  res.json(searchRelics(query));
});

app.get('/api/warframes/:name', (req, res) => {
  if (!isCacheReady) return res.status(503).json({ error: "データベースを構築中です。数秒お待ちください..." });
  const resolvedName = resolveAlias(req.params.name);
  res.json(searchWarframeParts(resolvedName));
});

app.get('/api/vaulted', (req, res) => {
  if (!isCacheReady) return res.status(503).json({ error: "データベースを構築中です。数秒お待ちください..." });
  res.json(getVaultedPrimes());
});

app.get('/api/latest-primes', (req, res) => {
  if (!isCacheReady) return res.status(503).json({ error: "データベースを構築中です。数秒お待ちください..." });
  res.json({ primes: getLatestPrimes(3) });
});

app.get('/api/item-relics/:item', (req, res) => {
  const resolvedItem = resolveAlias(req.params.item);
  res.json({ relics: findRelicsForItem(resolvedItem) });
});

app.get('/api/item-locations/:item', (req, res) => {
  const resolvedItem = resolveAlias(req.params.item);
  res.json({ locations: findLocationsForItem(resolvedItem) });
});

app.get('/api/resources', (req, res) => {
  res.json({ resources: staticResources });
});

app.get('/api/augments', (req, res) => {
  const augmentsList = [];
  // Extract augments from the staticBuilds database
  for (const [frameName, frameData] of Object.entries(staticBuilds.frames)) {
    if (frameData.augments && frameData.augments.length > 0) {
      frameData.augments.forEach(aug => {
        augmentsList.push({
          frame: frameData.itemName,
          modName: aug.name,
          effect: aug.effect,
          syndicate: aug.syndicate || "不明"
        });
      });
    }
  }
  res.json({ augments: augmentsList });
});

app.get('/api/suggestions', (req, res) => {
  const query = req.query.q || '';
  const type = req.query.type || 'all'; // 'warframes', 'relics', 'all'
  res.json({ suggestions: getSuggestions(query, type) });
});

app.get('/api/builds/:item', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const category = req.query.category || 'Warframe';
    const resolvedItem = resolveAlias(req.params.item);
    const buildData = await generateWarframeBuild(resolvedItem, apiKey, category);
    res.json(buildData);
  } catch (error) {
    console.error('Build API error:', error);
    res.status(500).json({ error: 'Failed to generate build data. ' + error.message });
  }
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', async () => {
  console.log(`Chat server is running on http://0.0.0.0:${PORT}`);
  // Initialize the Warframe Data Cache
  await initDataCache();
});
