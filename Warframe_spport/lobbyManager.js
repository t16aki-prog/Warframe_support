// Warframe_spport/lobbyManager.js
// マッチング・パーティ募集（通常マルチ & Narin縛り）のリアルタイム管理マネージャー

class LobbyManager {
  constructor() {
    /** @type {Map<string, Object>} */
    this.lobbies = new Map();
    // socketId -> Set of lobbyIds
    this.userLobbies = new Map();
  }

  /**
   * 現在有効なロビー一覧を取得（非公開・解散済み以外）
   */
  getLobbies() {
    const list = Array.from(this.lobbies.values()).filter(l => l.status !== 'closed');
    // 新しい順にソート
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * 特定のロビーを取得
   */
  getLobby(lobbyId) {
    return this.lobbies.get(lobbyId) || null;
  }

  /**
   * 新規ロビーを作成
   */
  createLobby(socketId, data) {
    const id = 'lobby_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const hostMember = {
      socketId,
      username: data.username || 'Tenno',
      inGameName: data.inGameName || data.username || 'Tenno',
      warframe: data.warframe || 'Excalibur',
      isHost: true,
      ready: true,
      joinedAt: Date.now()
    };

    const isNarin = data.type === 'narin';
    const maxLimit = isNarin ? 6 : 4;
    const requestedMax = Number(data.maxMembers) || (isNarin ? 6 : 4);
    const maxMembers = Math.min(Math.max(requestedMax, 2), maxLimit);

    const newLobby = {
      id,
      type: isNarin ? 'narin' : 'standard',
      title: data.title || (isNarin ? '【氷河の縛り】6人分隊募集 (重複禁止)' : 'マルチプレイ募集'),
      missionCategory: isNarin ? '氷河の縛り (The Icebind)' : (data.missionCategory || '亀裂/レリック'),
      targetMission: data.targetMission || (isNarin ? 'メイン目標のみ' : ''),
      // Narin縛り固有フィールド
      narinRulePreset: data.narinRulePreset || 'none',
      narinRuleDescription: data.narinRuleDescription || '',
      
      maxMembers,
      members: [hostMember],
      status: 'recruiting', // recruiting | full | departed | closed
      description: data.description || '',
      createdAt: Date.now(),
      messages: [
        {
          id: 'sys_' + Date.now(),
          username: 'System',
          message: `${hostMember.inGameName} がロビーを開設しました。`,
          timestamp: Date.now(),
          isSystem: true
        }
      ]
    };

    this.lobbies.set(id, newLobby);

    if (!this.userLobbies.has(socketId)) {
      this.userLobbies.set(socketId, new Set());
    }
    this.userLobbies.get(socketId).add(id);

    return newLobby;
  }

  /**
   * ロビーに参加
   */
  joinLobby(socketId, lobbyId, memberData) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      throw new Error('ロビーが見つかりません。');
    }
    if (lobby.status === 'closed') {
      throw new Error('このロビーは既に終了しています。');
    }
    if (lobby.members.length >= lobby.maxMembers) {
      throw new Error('このロビーは満員です。');
    }

    const targetWarframe = memberData.warframe || 'Excalibur';

    // 氷河の縛り専用ルール: Warframe重複をサーバー側で完全禁止
    if (lobby.type === 'narin') {
      const isDup = lobby.members.some(
        m => m.socketId !== socketId && m.warframe?.trim().toLowerCase() === targetWarframe.trim().toLowerCase()
      );
      if (isDup) {
        throw new Error(`【氷河の縛り】すでに「${targetWarframe}」を使用しているメンバーがいます。別のWarframeを選択してください。`);
      }
    }

    // 既に参加しているかチェック
    const existingIndex = lobby.members.findIndex(m => m.socketId === socketId);
    if (existingIndex !== -1) {
      // 既に参加済みの場合は更新して返す
      lobby.members[existingIndex].username = memberData.username || lobby.members[existingIndex].username;
      lobby.members[existingIndex].inGameName = memberData.inGameName || lobby.members[existingIndex].inGameName;
      lobby.members[existingIndex].warframe = targetWarframe;
      return lobby;
    }

    const newMember = {
      socketId,
      username: memberData.username || 'Tenno',
      inGameName: memberData.inGameName || memberData.username || 'Tenno',
      warframe: targetWarframe,
      isHost: false,
      ready: false,
      joinedAt: Date.now()
    };

    lobby.members.push(newMember);
    if (lobby.members.length >= lobby.maxMembers) {
      lobby.status = 'full';
    }

    lobby.messages.push({
      id: 'sys_' + Date.now(),
      username: 'System',
      message: `${newMember.inGameName} が参加しました。`,
      timestamp: Date.now(),
      isSystem: true
    });

    if (!this.userLobbies.has(socketId)) {
      this.userLobbies.set(socketId, new Set());
    }
    this.userLobbies.get(socketId).add(lobbyId);

    return lobby;
  }

  /**
   * ロビーから退出
   */
  leaveLobby(socketId, lobbyId) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return null;

    const memberIndex = lobby.members.findIndex(m => m.socketId === socketId);
    if (memberIndex === -1) return lobby;

    const leavingMember = lobby.members[memberIndex];
    lobby.members.splice(memberIndex, 1);

    if (this.userLobbies.has(socketId)) {
      this.userLobbies.get(socketId).delete(lobbyId);
    }

    // メンバーが0人になったらロビー削除
    if (lobby.members.length === 0) {
      lobby.status = 'closed';
      this.lobbies.delete(lobbyId);
      return { lobby, deleted: true };
    }

    // ホストが抜けた場合は先頭メンバーにホスト権譲渡
    if (leavingMember.isHost && lobby.members.length > 0) {
      lobby.members[0].isHost = true;
      lobby.members[0].ready = true;
      lobby.messages.push({
        id: 'sys_' + Date.now(),
        username: 'System',
        message: `${leavingMember.inGameName} が退出したため、${lobby.members[0].inGameName} が新しいホストになりました。`,
        timestamp: Date.now(),
        isSystem: true
      });
    } else {
      lobby.messages.push({
        id: 'sys_' + Date.now(),
        username: 'System',
        message: `${leavingMember.inGameName} が退出しました。`,
        timestamp: Date.now(),
        isSystem: true
      });
    }

    if (lobby.status === 'full' && lobby.members.length < lobby.maxMembers) {
      lobby.status = 'recruiting';
    }

    return { lobby, deleted: false };
  }

  /**
   * メンバー状態の更新（準備完了、フレーム変更など）
   */
  updateMember(socketId, lobbyId, updates) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return null;

    const member = lobby.members.find(m => m.socketId === socketId);
    if (!member) return null;

    if (typeof updates.ready === 'boolean') {
      member.ready = updates.ready;
    }
    if (updates.warframe) {
      if (lobby.type === 'narin') {
        const isDup = lobby.members.some(
          m => m.socketId !== socketId && m.warframe?.trim().toLowerCase() === updates.warframe.trim().toLowerCase()
        );
        if (isDup) {
          throw new Error(`【氷河の縛り】すでに「${updates.warframe}」は分隊内で使用されています。`);
        }
      }
      member.warframe = updates.warframe;
    }
    if (updates.inGameName) {
      member.inGameName = updates.inGameName;
    }

    return lobby;
  }

  /**
   * ロビーステータスの更新（ホストのみ可能）
   */
  updateLobbyStatus(socketId, lobbyId, newStatus) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return null;

    const host = lobby.members.find(m => m.socketId === socketId && m.isHost);
    if (!host) {
      throw new Error('ホストのみがステータスを変更できます。');
    }

    lobby.status = newStatus;
    if (newStatus === 'closed') {
      this.lobbies.delete(lobbyId);
    }

    return lobby;
  }

  /**
   * ロビー内チャットメッセージ追加
   */
  addMessage(lobbyId, { username, message }) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return null;

    const msg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      username: username || 'Tenno',
      message: message.trim(),
      timestamp: Date.now()
    };

    lobby.messages.push(msg);
    // 最大100件保持
    if (lobby.messages.length > 100) {
      lobby.messages.shift();
    }

    return { lobby, message: msg };
  }

  /**
   * ソケット切断時の全ロビー退出処理
   */
  handleDisconnect(socketId) {
    const affectedLobbies = [];
    const joined = this.userLobbies.get(socketId);
    if (!joined) return affectedLobbies;

    for (const lobbyId of joined) {
      const res = this.leaveLobby(socketId, lobbyId);
      if (res) {
        affectedLobbies.push({ lobbyId, ...res });
      }
    }

    this.userLobbies.delete(socketId);
    return affectedLobbies;
  }
}

export const lobbyManager = new LobbyManager();
