// Warframe_spport/src/features/multiplayer/components/LobbyFormFields.tsx
import React from 'react';
import { MISSION_CATEGORIES, ICEBIND_STAGES, POPULAR_WARFRAMES } from '../constants';
import type { LobbyType } from '../types';

interface Props {
  lobbyType: LobbyType;
  title: string;
  setTitle: (val: string) => void;
  missionCategory: string;
  setMissionCategory: (val: string) => void;
  targetMission: string;
  setTargetMission: (val: string) => void;
  maxMembers: number;
  setMaxMembers: (val: number) => void;
  inGameName: string;
  setInGameName: (val: string) => void;
  warframe: string;
  setWarframe: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  onClose: () => void;
}

export const LobbyFormFields: React.FC<Props> = ({
  lobbyType,
  title,
  setTitle,
  missionCategory,
  setMissionCategory,
  targetMission,
  setTargetMission,
  maxMembers,
  setMaxMembers,
  inGameName,
  setInGameName,
  warframe,
  setWarframe,
  description,
  setDescription,
  onClose
}) => {
  return (
    <>
      {/* Title */}
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
          募集タイトル
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={lobbyType === 'narin' ? '例: 【氷河の縛り】全ステージ完全制覇 6人重複禁止' : '例: Axi V8 レリック持ち寄り 3周'}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#fff'
          }}
        />
      </div>

      {/* Category & Target */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
            ゲームモード / 種別
          </label>
          {lobbyType === 'narin' ? (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                color: '#38bdf8',
                fontWeight: 700,
                fontSize: '13px'
              }}
            >
              ❄️ 氷河の縛り (The Icebind)
            </div>
          ) : (
            <select
              value={missionCategory}
              onChange={e => setMissionCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff'
              }}
            >
              {MISSION_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
            {lobbyType === 'narin' ? '目標選択 (メイン目標のみ / 全目標)' : '目標・対象 (任意)'}
          </label>
          {lobbyType === 'narin' ? (
            <select
              value={targetMission}
              onChange={e => setTargetMission(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                color: '#bae6fd',
                fontSize: '13px'
              }}
            >
              {ICEBIND_STAGES.map(stage => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={targetMission}
              onChange={e => setTargetMission(e.target.value)}
              placeholder="例: Axi V8, ルア結合耐久, アルコン等"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff'
              }}
            />
          )}
        </div>
      </div>

      {/* Member Count & Warframe */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
            募集定員
          </label>
          <select
            value={maxMembers}
            onChange={e => setMaxMembers(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff'
            }}
          >
            {lobbyType === 'narin' ? (
              <>
                <option value={6}>6名 (フルスクワッド - 公式仕様)</option>
                <option value={5}>5名</option>
                <option value={4}>4名</option>
                <option value={3}>3名</option>
                <option value={2}>2名</option>
              </>
            ) : (
              <>
                <option value={4}>4名 (フルスクワッド)</option>
                <option value={3}>3名 (トリオ)</option>
                <option value={2}>2名 (デュオ)</option>
              </>
            )}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
            ゲーム内IGN
          </label>
          <input
            type="text"
            value={inGameName}
            onChange={e => setInGameName(e.target.value)}
            required
            placeholder="Warframeの表示名"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
            使用Warframe
          </label>
          <input
            list="wf-list"
            value={warframe}
            onChange={e => setWarframe(e.target.value)}
            placeholder="例: Narin"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff'
            }}
          />
          <datalist id="wf-list">
            {POPULAR_WARFRAMES.map(w => (
              <option key={w} value={w} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Description */}
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
          備考・参加者へのメッセージ (任意)
        </label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="例: 初心者歓迎、無言OK、VCなし"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#fff'
          }}
        />
      </div>

      {/* Submit Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="primary-btn"
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            fontWeight: 700,
            background: lobbyType === 'narin'
              ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
              : 'linear-gradient(135deg, #00d2ff 0%, #0099cc 100%)'
          }}
        >
          募集を開始する
        </button>
      </div>
    </>
  );
};
