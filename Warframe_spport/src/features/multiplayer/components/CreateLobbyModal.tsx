// Warframe_spport/src/features/multiplayer/components/CreateLobbyModal.tsx
import React, { useState } from 'react';
import { X, Users, Snowflake, Sparkles } from 'lucide-react';
import { MISSION_CATEGORIES, ICEBIND_STAGES, ICEBIND_OFFICIAL_RULE } from '../constants';
import type { CreateLobbyFormInput, LobbyType } from '../types';
import { IcebindRuleNotice } from './IcebindRuleNotice';
import { LobbyFormFields } from './LobbyFormFields';

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
      narinRulePreset: ICEBIND_OFFICIAL_RULE.id,
      narinRuleDescription: lobbyType === 'narin' ? ICEBIND_OFFICIAL_RULE.rules.trim() : '',
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
          {lobbyType === 'narin' && <IcebindRuleNotice />}

          <LobbyFormFields
            lobbyType={lobbyType}
            title={title}
            setTitle={setTitle}
            missionCategory={missionCategory}
            setMissionCategory={setMissionCategory}
            targetMission={targetMission}
            setTargetMission={setTargetMission}
            maxMembers={maxMembers}
            setMaxMembers={setMaxMembers}
            inGameName={inGameName}
            setInGameName={setInGameName}
            warframe={warframe}
            setWarframe={setWarframe}
            description={description}
            setDescription={setDescription}
            onClose={onClose}
          />
        </form>
      </div>
    </div>
  );
};
