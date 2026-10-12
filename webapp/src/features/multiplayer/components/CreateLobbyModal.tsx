// Warframe_spport/src/features/multiplayer/components/CreateLobbyModal.tsx
import React, { useState } from 'react';
import { X, Users, Snowflake, Sparkles } from 'lucide-react';
import { MISSION_CATEGORIES, NARIN_RULE_PRESETS, POPULAR_WARFRAMES } from '../constants';
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
  const [missionCategory, setMissionCategory] = useState<string>(MISSION_CATEGORIES[0]);
  const [targetMission, setTargetMission] = useState('');
  const [narinPresetId, setNarinPresetId] = useState<string>(NARIN_RULE_PRESETS[0].id);
  const [narinRuleDescription, setNarinRuleDescription] = useState<string>(NARIN_RULE_PRESETS[0].recommendedRules);
  const [maxMembers, setMaxMembers] = useState<number>(4);
  const [inGameName, setInGameName] = useState<string>(defaultIgn);
  const [warframe, setWarframe] = useState<string>(initialType === 'narin' ? 'Narin' : defaultWarframe);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handlePresetChange = (presetId: string) => {
    setNarinPresetId(presetId);
    const found = NARIN_RULE_PRESETS.find(p => p.id === presetId);
    if (found) {
      setNarinRuleDescription(found.recommendedRules);
      if (presetId === 'narin_frost_unite') {
        setWarframe('Narin');
      }
    }
  };

  const handleTypeChange = (type: LobbyType) => {
    setLobbyType(type);
    if (type === 'narin') {
      setWarframe('Narin');
      if (!title) setTitle('【Narin縛り】氷刃舞踏会 Lv999耐久');
    } else {
      if (!title || title.includes('Narin')) setTitle('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim() || (lobbyType === 'narin' ? '【Narin縛り】分隊募集' : `${missionCategory} 募集`);

    onSubmit({
      type: lobbyType,
      title: finalTitle,
      missionCategory,
      targetMission: targetMission.trim(),
      narinRulePreset: narinPresetId,
      narinRuleDescription: lobbyType === 'narin' ? narinRuleDescription.trim() : '',
      maxMembers,
      inGameName: inGameName.trim() || 'Tenno',
      warframe: warframe.trim() || 'Excalibur',
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
            ❄️ Narin縛りマルチ募集
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Narin Presets Selection */}
          {lobbyType === 'narin' && (
            <div
              style={{
                background: 'rgba(56, 189, 248, 0.06)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '12px',
                padding: '16px'
              }}
            >
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
                ❄️ Narin縛りプリセット
              </label>
              <select
                value={narinPresetId}
                onChange={e => handlePresetChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#f8fafc',
                  marginBottom: '10px'
                }}
              >
                {NARIN_RULE_PRESETS.map(preset => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name} [{preset.badge}]
                  </option>
                ))}
              </select>

              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted, #94a3b8)', marginBottom: '4px' }}>
                縛りルール詳細・達成条件
              </label>
              <textarea
                rows={3}
                value={narinRuleDescription}
                onChange={e => setNarinRuleDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#bae6fd',
                  fontSize: '13px',
                  lineHeight: '1.5'
                }}
                placeholder="縛りルールを入力してください..."
              />
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
              placeholder={lobbyType === 'narin' ? '例: 【Narin縛り】氷刃舞踏会4人冷気統一' : '例: Axi V8 レリック持ち寄り 3周'}
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
                ミッション種別
              </label>
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
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
                目標・対象 (任意)
              </label>
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
                <option value={2}>2名 (デュオ)</option>
                <option value={3}>3名 (トリオ)</option>
                <option value={4}>4名 (フルスクワッド)</option>
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
