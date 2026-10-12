// Warframe_spport/src/features/multiplayer/hooks/useMultiplayerLobbies.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Lobby, LobbyMessage, ActiveFilterTab, CreateLobbyFormInput, LobbyStatus } from '../types';

export function useMultiplayerLobbies() {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [activeLobbyId, setActiveLobbyId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ActiveFilterTab>('all');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ユーザー設定（IGN、Warframe）
  const [inGameName, setInGameName] = useState<string>(() => {
    return localStorage.getItem('tenno_navi_ign') || localStorage.getItem('tenno_navi_username') || 'Tenno';
  });
  const [myWarframe, setMyWarframe] = useState<string>(() => {
    return localStorage.getItem('tenno_navi_warframe') || 'Narin';
  });

  const socketRef = useRef<Socket | null>(null);

  // ユーザー名 / IGN の保存
  const saveUserData = useCallback((ign: string, wf: string) => {
    setInGameName(ign);
    setMyWarframe(wf);
    localStorage.setItem('tenno_navi_ign', ign);
    localStorage.setItem('tenno_navi_warframe', wf);
  }, []);

  // Socket.IO 接続
  useEffect(() => {
    const serverUrl = `http://${window.location.hostname}:3001`;
    const socket = io(serverUrl);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setErrorMsg(null);
      socket.emit('lobby:list');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('lobbies_list', (data: Lobby[]) => {
      setLobbies(data);
    });

    socket.on('lobby:updated', (updatedLobby: Lobby) => {
      setLobbies(prev => {
        const index = prev.findIndex(l => l.id === updatedLobby.id);
        if (index === -1) return [updatedLobby, ...prev];
        const next = [...prev];
        next[index] = updatedLobby;
        return next;
      });
    });

    socket.on('lobby:new_message', ({ lobbyId, message }: { lobbyId: string; message: LobbyMessage }) => {
      setLobbies(prev => {
        return prev.map(l => {
          if (l.id === lobbyId) {
            return {
              ...l,
              messages: [...l.messages, message]
            };
          }
          return l;
        });
      });
    });

    socket.on('lobby:closed', ({ lobbyId }: { lobbyId: string }) => {
      setActiveLobbyId(current => (current === lobbyId ? null : current));
      setLobbies(prev => prev.filter(l => l.id !== lobbyId));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const activeLobby = lobbies.find(l => l.id === activeLobbyId) || null;

  // ロビー作成
  const createLobby = useCallback((formData: CreateLobbyFormInput) => {
    if (!socketRef.current || !isConnected) {
      setErrorMsg('サーバーに接続されていません。');
      return;
    }
    saveUserData(formData.inGameName, formData.warframe);

    socketRef.current.emit(
      'lobby:create',
      {
        ...formData,
        username: formData.inGameName,
        warframe: formData.warframe
      },
      (res: { success: boolean; lobby?: Lobby; error?: string }) => {
        if (res.success && res.lobby) {
          setActiveLobbyId(res.lobby.id);
        } else {
          setErrorMsg(res.error || 'ロビーの作成に失敗しました。');
        }
      }
    );
  }, [isConnected, saveUserData]);

  // ロビー参加
  const joinLobby = useCallback((lobbyId: string) => {
    if (!socketRef.current || !isConnected) return;
    saveUserData(inGameName, myWarframe);

    socketRef.current.emit(
      'lobby:join',
      {
        lobbyId,
        memberData: {
          username: inGameName,
          inGameName,
          warframe: myWarframe
        }
      },
      (res: { success: boolean; lobby?: Lobby; error?: string }) => {
        if (res.success && res.lobby) {
          setActiveLobbyId(res.lobby.id);
        } else {
          setErrorMsg(res.error || 'ロビーへの参加に失敗しました。');
        }
      }
    );
  }, [isConnected, inGameName, myWarframe, saveUserData]);

  // ロビー退出
  const leaveLobby = useCallback(() => {
    if (!socketRef.current || !activeLobbyId) return;
    socketRef.current.emit('lobby:leave', { lobbyId: activeLobbyId }, () => {
      setActiveLobbyId(null);
    });
  }, [activeLobbyId]);

  // 準備完了切り替え
  const toggleReady = useCallback(() => {
    if (!socketRef.current || !activeLobby || !socketRef.current.id) return;
    const me = activeLobby.members.find(m => m.socketId === socketRef.current?.id);
    if (!me) return;

    socketRef.current.emit('lobby:update_member', {
      lobbyId: activeLobby.id,
      updates: { ready: !me.ready }
    });
  }, [activeLobby]);

  // フレーム変更
  const updateMyWarframe = useCallback((wf: string) => {
    setMyWarframe(wf);
    localStorage.setItem('tenno_navi_warframe', wf);
    if (!socketRef.current || !activeLobby) return;
    socketRef.current.emit('lobby:update_member', {
      lobbyId: activeLobby.id,
      updates: { warframe: wf }
    });
  }, [activeLobby]);

  // ロビーステータス変更（ホスト専用）
  const updateLobbyStatus = useCallback((status: LobbyStatus) => {
    if (!socketRef.current || !activeLobby) return;
    socketRef.current.emit('lobby:update_status', {
      lobbyId: activeLobby.id,
      status
    });
  }, [activeLobby]);

  // チャット送信
  const sendLobbyMessage = useCallback((text: string) => {
    if (!socketRef.current || !activeLobby || !text.trim()) return;
    socketRef.current.emit('lobby:send_message', {
      lobbyId: activeLobby.id,
      username: inGameName,
      message: text.trim()
    });
  }, [activeLobby, inGameName]);

  // フィルタリングされたロビー一覧
  const filteredLobbies = lobbies.filter(lobby => {
    if (activeFilter === 'all') return true;
    return lobby.type === activeFilter;
  });

  return {
    lobbies: filteredLobbies,
    allLobbiesCount: lobbies.length,
    activeLobby,
    activeFilter,
    setActiveFilter,
    isConnected,
    errorMsg,
    clearError: () => setErrorMsg(null),
    inGameName,
    setInGameName,
    myWarframe,
    setMyWarframe,
    saveUserData,
    createLobby,
    joinLobby,
    leaveLobby,
    toggleReady,
    updateMyWarframe,
    updateLobbyStatus,
    sendLobbyMessage,
    currentSocketId: socketRef.current?.id || ''
  };
}
