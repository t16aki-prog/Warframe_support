// Warframe_spport/src/features/multiplayer/components/CreateLobbyModal.tsx
import React, { useState } from 'react';
import { X, Users, Snowflake, Sparkles } from 'lucide-react';
import { MISSION_CATEGORIES, ICEBIND_STAGES, ICEBIND_OFFICIAL_RULE, POPULAR_WARFRAMES } from '../constants';
import type { CreateLobbyFormInput, LobbyType } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLobbyFormInput) => void;
  defaultIgn: string;
  defaultWarframe: string;
  initialType?: LobbyType;
}

export const CreateLobbyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultIgn,
  defaultWarframe,
  initialType = 'standard'
}) => {
  const [lobbyType, setLobbyType] = useState<LobbyType>(initialType);
  const [title, setTitle] = useState('');
  const [missionCategory, setMissionCategory] = useState<string>(
    initialType === 'narin' ? '氷河の縛り (The Icebind)' : MISSION_CATEGORIES[0]
  );
  const [targetMission, setTargetMission] = useState<string>(
    initialType === 'narin' ? ICEBIND_STAGES[0] : ''
  );
  const narinPresetId = ICEBIND_OFFICIAL_RULE.id;
  const narinRuleDescription = ICEBIND_OFFICIAL_RULE.rules;
  const [maxMembers, setMaxMembers] = useState<number>(initialType === 'narin' ? 6 : 4);
  const [inGameName, setInGameName] = useState<string>(defaultIgn);
  const [warframe, setWarframe] = useState<string>(initialType === 'narin' ? 'Narin' : defaultWarframe);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleTypeChange = (type: LobbyType) => {
    setLobbyType(type);
    if (type === 'narin') {
      setMissionCategory('氷河の縛り (The Icebind)');
      setTargetMission(ICEBIND_STAGES[0]);
      setMaxMembers(6);
      setWarframe('Narin');
      setTitle(`【氷河の縛り】${ICEBIND_STAGES[0]}`);
    } else {
      setMissionCategory(MISSION_CATEGORIES[0]);
      setTargetMission('');
      setMaxMembers(4);
      setWarframe(defaultWarframe || 'Excalibur');
      setTitle('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim() || (
      lobbyType === 'narin'
        ? `【氷河の縛り】${targetMission} (6人重複禁止)`
        : `${missionCategory} 募集`
    );

    onSubmit({
      type: lobbyType,
      title: finalTitle,
      missionCategory: lobbyType === 'narin' ? '氷河の縛り (The Icebind)' : missionCategory,
      targetMission: targetMission.trim(),
      narinRulePreset: narinPresetId,
      narinRuleDescription: lobbyType === 'narin' ? narinRuleDescription.trim() : '',
      maxMembers,
      inGameName: inGameName.trim() || 'Tenno',
      warframe: warframe.trim() || (lobbyType === 'narin' ? 'Narin' : 'Excalibur'),
      description: description.trim()
    });

    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '16px',
          border: '1px solid',
          borderColor: lobbyType === 'narin' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.15)',
          background: 'var(--card-bg, #0f172a)',
          padding: '24px'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={22} style={{ color: lobbyType === 'narin' ? '#38bdf8' : '#00d2ff' }} />
            マルチプレイ分隊を新規募集
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary, #94a3b8)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => handleTypeChange('standard')}
            style={{
              padding: '12px',
              borderRadius: '10px',
              border: '2px solid',
              borderColor: lobbyType === 'standard' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
              background: lobbyType === 'standard' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.02)',
              color: lobbyType === 'standard' ? '#60a5fa' : 'var(--text-secondary, #94a3b8)',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Users size={18} />
            通常マルチ募集
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('narin')}
            style={{
              padding: '12px',
              borderRadius: '10px',
              border: '2px solid',
              borderColor: lobbyType === 'narin' ? '#38bdf8' : 'rgba(255,255,255,0.1)',
              background: lobbyType === 'narin' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.02)',
              color: lobbyType === 'narin' ? '#38bdf8' : 'var(--text-secondary, #94a3b8)',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: lobbyType === 'narin' ? '0 0 16px rgba(56, 189, 248, 0.25)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <Snowflake size={18} />
            ❄️ 氷河の縛り (The Icebind)
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 氷河の縛り 公式ルール固定カード */}
          {lobbyType === 'narin' && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: '12px',
                padding: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Snowflake size={16} />
                  {ICEBIND_OFFICIAL_RULE.name}
                </span>
                <span className="badge frost" style={{ fontSize: '10px', padding: '2px 8px', fontWeight: 700 }}>
                  {ICEBIND_OFFICIAL_RULE.badge} (固定)
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>
                {ICEBIND_OFFICIAL_RULE.description}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#bae6fd',
                  lineHeight: '1.6',
                  background: 'rgba(0,0,0,0.35)',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  whiteSpace: 'pre-line',
                  border: '1px solid rgba(56, 189, 248, 0.2)'
                }}
              >
                {ICEBIND_OFFICIAL_RULE.rules}
              </div>
            </div>
          )}

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
        </form>
      </div>
    </div>
  );
};
