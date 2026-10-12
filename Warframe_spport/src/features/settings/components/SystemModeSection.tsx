import React from 'react';
import { ShieldAlert, Trash2, Key, Eye, EyeOff } from 'lucide-react';

interface SystemModeSectionProps {
  isOnline: boolean;
  apiKey: string;
  inputKey: string;
  setInputKey: (val: string) => void;
  showKey: boolean;
  setShowKey: (val: boolean) => void;
  handleDeleteKey: () => void;
  showSteelPath: boolean;
  setShowSteelPath: (val: boolean) => void;
}

export const SystemModeSection: React.FC<SystemModeSectionProps> = ({
  isOnline,
  apiKey,
  inputKey,
  setInputKey,
  showKey,
  setShowKey,
  handleDeleteKey,
  showSteelPath,
  setShowSteelPath,
}) => {
  return (
    <div className={`glass-card ${isOnline ? 'neon-teal' : 'neon-purple'}`}>
      <h3 className="card-title" style={{ color: isOnline ? 'var(--color-teal)' : 'var(--color-purple)' }}>
        <ShieldAlert size={20} className="card-title-icon" style={{ color: isOnline ? 'var(--color-teal)' : 'var(--color-purple)' }} />
        現在のシステムモード
      </h3>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        {isOnline ? (
          <>
            <div
              className="input-text"
              style={{
                backgroundColor: 'rgba(0, 240, 255, 0.1)',
                color: 'var(--color-teal)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                fontWeight: 'bold',
              }}
            >
              🌐 オンラインモード稼働中 (Gemini AI 接続)
            </div>
            <p className="cycle-sub" style={{ marginTop: '12px', lineHeight: '1.6' }}>
              現在は外部AI（Gemini API）を使用し、雑談や専門的な質問に対応可能な「オンラインモード」で動作しています。
            </p>
          </>
        ) : (
          <>
            <div
              className="input-text"
              style={{
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                color: '#4CAF50',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                fontWeight: 'bold',
              }}
            >
              ✅ 完全オフラインモード稼働中
            </div>
            <p className="cycle-sub" style={{ marginTop: '12px', lineHeight: '1.6' }}>
              現在は外部AIを使用せず、アプリ内の固定データベースのみを使用する「完全オフラインモード」で動作しています。
            </p>
          </>
        )}
      </div>

      <div className="form-group" style={{ marginTop: '24px' }}>
        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
          Gemini API キー (AIチャット用)
          {apiKey && (
            <button
              type="button"
              onClick={handleDeleteKey}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-danger)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
              }}
            >
              <Trash2 size={12} /> キーを削除してオフラインに戻す
            </button>
          )}
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Key size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input
            type={showKey ? 'text' : 'password'}
            className="input-text"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="AIチャットを使用する場合はAI StudioのAPIキーを入力..."
            style={{ width: '100%', paddingLeft: '40px', paddingRight: '40px' }}
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            style={{
              position: 'absolute',
              right: '12px',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <h4
        style={{
          color: 'var(--text-color)',
          marginTop: '24px',
          marginBottom: '12px',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '4px',
        }}
      >
        表示設定
      </h4>
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
          <input
            type="checkbox"
            checked={showSteelPath}
            onChange={(e) => setShowSteelPath(e.target.checked)}
          />
          <span style={{ fontWeight: '500' }}>「鋼の道のり」のミッションを表示する</span>
        </label>
        <p className="cycle-sub" style={{ marginTop: '8px', marginLeft: '24px' }}>
          オフにすると、亀裂や依頼リストからレベル100以上の「鋼の道のり (Steel Path)」ミッションを非表示にします。
        </p>
      </div>
    </div>
  );
};
