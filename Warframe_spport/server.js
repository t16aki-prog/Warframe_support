import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { initDataCache, searchRelics, searchWarframeParts, getVaultedPrimes, findRelicsForItem, findLocationsForItem, isCacheReady, getLatestPrimes } from './warframeData.js';
import { sendOrdisMessage, generateWarframeBuild } from './ordisAi.js';
import { resolveAlias, getSuggestions } from './aliases.js';
import { staticBuilds } from './staticBuilds.js';
import { staticResources } from './staticResources.js';
import { lobbyManager } from './lobbyManager.js';
import llmRouter from './server/llm/routes.js';
import { startIngestScheduler } from './server/llm/ingestService.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 接続時に現在のロビー一覧を送信
  socket.emit('lobbies_list', lobbyManager.getLobbies());

  // 1. チャットメッセージ
  socket.on('chat_message', async (data) => {
    io.emit('chat_message', {
      ...data,
      id: Date.now() + Math.random().toString(36).substr(2, 9)
    });

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

  // 2. ロビー作成
  socket.on('lobby:create', (data, callback) => {
    try {
      const lobby = lobbyManager.createLobby(socket.id, data);
      socket.join(`lobby:${lobby.id}`);
      io.emit('lobbies_list', lobbyManager.getLobbies());
      if (typeof callback === 'function') callback({ success: true, lobby });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // 3. ロビー一覧要求
  socket.on('lobby:list', () => {
    socket.emit('lobbies_list', lobbyManager.getLobbies());
  });

  // 4. ロビー参加
  socket.on('lobby:join', ({ lobbyId, memberData }, callback) => {
    try {
      const lobby = lobbyManager.joinLobby(socket.id, lobbyId, memberData);
      socket.join(`lobby:${lobbyId}`);
      io.to(`lobby:${lobbyId}`).emit('lobby:updated', lobby);
      io.emit('lobbies_list', lobbyManager.getLobbies());
      if (typeof callback === 'function') callback({ success: true, lobby });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // 5. ロビー退出
  socket.on('lobby:leave', ({ lobbyId }, callback) => {
    try {
      const result = lobbyManager.leaveLobby(socket.id, lobbyId);
      socket.leave(`lobby:${lobbyId}`);
      if (result) {
        if (!result.deleted) {
          io.to(`lobby:${lobbyId}`).emit('lobby:updated', result.lobby);
        } else {
          io.to(`lobby:${lobbyId}`).emit('lobby:closed', { lobbyId });
        }
      }
      io.emit('lobbies_list', lobbyManager.getLobbies());
      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // 6. メンバー状態の更新（準備完了、フレーム等）
  socket.on('lobby:update_member', ({ lobbyId, updates }) => {
    const lobby = lobbyManager.updateMember(socket.id, lobbyId, updates);
    if (lobby) {
      io.to(`lobby:${lobbyId}`).emit('lobby:updated', lobby);
      io.emit('lobbies_list', lobbyManager.getLobbies());
    }
  });

  // 7. ロビーステータスの更新（ホストによる出撃・締切・解散）
  socket.on('lobby:update_status', ({ lobbyId, status }, callback) => {
    try {
      const lobby = lobbyManager.updateLobbyStatus(socket.id, lobbyId, status);
      if (lobby) {
        if (status === 'closed') {
          io.to(`lobby:${lobbyId}`).emit('lobby:closed', { lobbyId });
        } else {
          io.to(`lobby:${lobbyId}`).emit('lobby:updated', lobby);
        }
        io.emit('lobbies_list', lobbyManager.getLobbies());
        if (typeof callback === 'function') callback({ success: true, lobby });
      }
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // 8. ロビー内チャット
  socket.on('lobby:send_message', ({ lobbyId, username, message }) => {
    const result = lobbyManager.addMessage(lobbyId, { username, message });
    if (result) {
      io.to(`lobby:${lobbyId}`).emit('lobby:new_message', { lobbyId, message: result.message });
    }
  });

  // 9. 切断時
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    const affected = lobbyManager.handleDisconnect(socket.id);
    if (affected.length > 0) {
      for (const item of affected) {
        if (item.deleted) {
          io.to(`lobby:${item.lobbyId}`).emit('lobby:closed', { lobbyId: item.lobbyId });
        } else {
          io.to(`lobby:${item.lobbyId}`).emit('lobby:updated', item.lobby);
        }
      }
      io.emit('lobbies_list', lobbyManager.getLobbies());
    }
  });
});

// ロビー一覧・詳細 REST API
app.get('/api/lobbies', (req, res) => {
  res.json({ lobbies: lobbyManager.getLobbies() });
});

app.get('/api/lobbies/:id', (req, res) => {
  const lobby = lobbyManager.getLobby(req.params.id);
  if (!lobby) return res.status(404).json({ error: 'Lobby not found' });
  res.json({ lobby });
});

// --- Local LLM (Ollama + RAG) ---
app.use('/api/llm', llmRouter);

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
  startIngestScheduler();
});
