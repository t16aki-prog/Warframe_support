import React from 'react';
import { Volume2, Info } from 'lucide-react';

interface VoiceSettingsSectionProps {
  localVoiceSource: string;
  setLocalVoiceSource: (val: string) => void;
  localVoicevoxUrl: string;
  setLocalVoicevoxUrl: (val: string) => void;
  localVoicevoxSpeaker: number;
  setLocalVoicevoxSpeaker: (val: number) => void;
  localClipboardCopyMode: string;
  setLocalClipboardCopyMode: (val: string) => void;
}

export const VoiceSettingsSection: React.FC<VoiceSettingsSectionProps> = ({
  localVoiceSource,
  setLocalVoiceSource,
  localVoicevoxUrl,
  setLocalVoicevoxUrl,
  localVoicevoxSpeaker,
  setLocalVoicevoxSpeaker,
  localClipboardCopyMode,
  setLocalClipboardCopyMode,
}) => {
  return (
    <div className="glass-card neon-teal">
      <h3 className="card-title" style={{ color: 'var(--color-teal)' }}>
        <Volume2 size={20} className="card-title-icon" style={{ color: 'var(--color-teal)' }} />
        音声出力 ＆ 外部ソフト連携設定
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="form-group">
          <label className="form-label">音声の出力方法</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
              <input
                type="radio"
                name="voiceSource"
                value="standard"
                checked={localVoiceSource === 'standard'}
                onChange={() => setLocalVoiceSource('standard')}
              />
              <span>ブラウザ標準音声 (SpeechSynthesis)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
              <input
                type="radio"
                name="voiceSource"
                value="voicevox"
                checked={localVoiceSource === 'voicevox'}
                onChange={() => setLocalVoiceSource('voicevox')}
              />
              <span>VOICEVOX 連携 (ローカルAPI)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
              <input
                type="radio"
                name="voiceSource"
                value="clipboard"
                checked={localVoiceSource === 'clipboard'}
                onChange={() => setLocalVoiceSource('clipboard')}
              />
              <span>クリップボード自動コピー (VOICEROID等の監視ソフト用)</span>
            </label>
          </div>
        </div>

        {/* VOICEVOX configs */}
        {localVoiceSource === 'voicevox' && (
          <div
            style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '13px' }}>VOICEVOX API アドレス</label>
              <input
                type="text"
                className="input-text"
                value={localVoicevoxUrl}
                onChange={(e) => setLocalVoicevoxUrl(e.target.value)}
                placeholder="http://localhost:50021"
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '13px' }}>話者 ID (Speaker ID)</label>
              <input
                type="number"
                className="input-text"
                value={localVoicevoxSpeaker}
                onChange={(e) => setLocalVoicevoxSpeaker(Number(e.target.value))}
                placeholder="2"
              />
              <span className="cycle-sub">※ デフォルト: 2 (四国めたん・ノーマル), 3 (ずんだもん・ノーマル) など</span>
            </div>
          </div>
        )}

        {/* Clipboard configs */}
        {localVoiceSource === 'clipboard' && (
          <div
            style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '13px' }}>コピーテキストの処理</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', fontSize: '13px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="clipboardCopyMode"
                    value="all"
                    checked={localClipboardCopyMode === 'all'}
                    onChange={() => setLocalClipboardCopyMode('all')}
                  />
                  <span>すべての台詞（バグ台詞も含める）をコピー</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="clipboardCopyMode"
                    value="clean"
                    checked={localClipboardCopyMode === 'clean'}
                    onChange={() => setLocalClipboardCopyMode('clean')}
                  />
                  <span>通常の台詞のみ（バグ台詞を除去）コピー</span>
                </label>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
              <Info size={14} style={{ color: 'var(--color-teal)', flexShrink: 0, marginTop: '2px' }} />
              <span>「コトノハシ」や「SeikaSay」などのクリップボード監視読み上げツールをPCで起動しておくと、自動でVOICEROID音声で読み上げられます。</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
