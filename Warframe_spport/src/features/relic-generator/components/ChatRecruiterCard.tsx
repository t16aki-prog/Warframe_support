import React from 'react';
import { MessageSquare, Copy } from 'lucide-react';
import { AutocompleteSearch } from '../../../components/AutocompleteSearch';

interface ChatRecruiterCardProps {
  selectedRelic: string;
  onSelectedRelicChange: (relic: string) => void;
  refinement: string;
  onRefinementChange: (ref: string) => void;
  missionType: string;
  onMissionTypeChange: (type: string) => void;
  partySize: string;
  onPartySizeChange: (size: string) => void;
  chatText: string;
  onCopyChatText: () => void;
}

export const ChatRecruiterCard: React.FC<ChatRecruiterCardProps> = ({
  selectedRelic,
  onSelectedRelicChange,
  refinement,
  onRefinementChange,
  missionType,
  onMissionTypeChange,
  partySize,
  onPartySizeChange,
  chatText,
  onCopyChatText,
}) => {
  return (
    <div className="glass-card" id="chat-generator" style={{ alignSelf: 'start' }}>
      <h3 className="card-title">
        <MessageSquare size={20} className="card-title-icon" style={{ color: 'var(--color-purple)' }} />
        リクルート募集メーカー
      </h3>
      <p className="cycle-sub" style={{ marginBottom: '16px' }}>
        ゲーム内のリクルート（分隊募集）チャットに貼り付ける定型文を作成します。
        左側の表の吹き出しアイコンをクリックすると自動入力されます。
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label">レリック名 (手入力も可)</label>
          <AutocompleteSearch
            value={selectedRelic}
            onChange={onSelectedRelicChange}
            onSearch={() => {}}
            placeholder="例: Lith G1 Relic"
            type="relics"
          />
        </div>

        <div className="form-group">
          <label className="form-label">精錬レベル (Refinement)</label>
          <select className="input-text" value={refinement} onChange={(e) => onRefinementChange(e.target.value)}>
            <option value="Intact">無垢 (Intact)</option>
            <option value="Exceptional">例外 (Exceptional)</option>
            <option value="Flawless">無傷 (Flawless)</option>
            <option value="Radiant">輝く (Radiant)</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">募集タイプ</label>
            <select className="input-text" value={missionType} onChange={(e) => onMissionTypeChange(e.target.value)}>
              <option value="H">募集 (H / Hosting)</option>
              <option value="LF">参加希望 (LF)</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">人数状況</label>
            <select className="input-text" value={partySize} onChange={(e) => onPartySizeChange(e.target.value)}>
              <option value="1/4">1/4 (@3人)</option>
              <option value="2/4">2/4 (@2人)</option>
              <option value="3/4">3/4 (@1人)</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-purple)' }}>
          <div style={{ fontSize: '12px', color: 'var(--color-purple)', marginBottom: '8px' }}>プレビュー (Preview)</div>
          <div style={{ fontSize: '16px', fontFamily: 'monospace', wordBreak: 'break-all', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
            {chatText}
          </div>
        </div>

        <button
          className="btn-primary"
          style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px', background: 'var(--color-purple)', borderColor: 'var(--color-purple)' }}
          onClick={onCopyChatText}
          disabled={!selectedRelic}
        >
          <Copy size={18} /> クリップボードにコピー
        </button>
      </div>
    </div>
  );
};
