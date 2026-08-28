import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Trash2, ShieldAlert, Volume2, Info, Compass, Database, Crosshair } from 'lucide-react';

interface SettingsProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  voiceSource: string;
  setVoiceSource: (source: string) => void;
  voicevoxUrl: string;
  setVoicevoxUrl: (url: string) => void;
  voicevoxSpeaker: number;
  setVoicevoxSpeaker: (speaker: number) => void;
  clipboardCopyMode?: string;
  setClipboardCopyMode?: (mode: string) => void;
  showSteelPath?: boolean;
  setShowSteelPath?: (show: boolean) => void;
  enabledExtensions?: Record<string, boolean>;
  setEnabledExtensions?: (ext: Record<string, boolean>) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  apiKey,
  setApiKey,
  voiceSource,
  setVoiceSource,
  voicevoxUrl,
  setVoicevoxUrl,
  voicevoxSpeaker,
  setVoicevoxSpeaker,
  clipboardCopyMode,
  setClipboardCopyMode,
  showSteelPath,
  setShowSteelPath,
  enabledExtensions,
  setEnabledExtensions
}) => {
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  
  // Local voice settings for form
  const [localVoiceSource, setLocalVoiceSource] = useState(voiceSource);
  const [localVoicevoxUrl, setLocalVoicevoxUrl] = useState(voicevoxUrl);
  const [localVoicevoxSpeaker, setLocalVoicevoxSpeaker] = useState(voicevoxSpeaker || 2);
  const [localClipboardCopyMode, setLocalClipboardCopyMode] = useState(clipboardCopyMode || 'all');
  const [localShowSteelPath, setLocalShowSteelPath] = useState(showSteelPath ?? true);
  const [localExtensions, setLocalExtensions] = useState<Record<string, boolean>>(enabledExtensions || {});

  const [localSyndicateRanks, setLocalSyndicateRanks] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('syndicateRanks');
    if (saved) return JSON.parse(saved);
    return {
      'Ostrons': 5,
      'Solaris United': 5,
      'Entrati': 5,
      'The Holdfasts': 5,
      'Cavia': 5,
      'The Hex': 5
    };
  });

  // Language and Region Settings
  const [locale, setLocale] = useState(localStorage.getItem('ordis_locale') || navigator.language);
  const [timeZone, setTimeZone] = useState(localStorage.getItem('ordis_timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'deleted'>('idle');

  useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = inputKey.trim();
    
    // Save Gemini Key
    localStorage.setItem('gemini_api_key', cleanKey);
    setApiKey(cleanKey);
    
    // Save Voice Settings
    if (localVoiceSource !== undefined) {
      localStorage.setItem('ordis_voice_source', localVoiceSource);
    }
    if (setVoiceSource) setVoiceSource(localVoiceSource);
    
    if (localVoicevoxUrl !== undefined) {
      localStorage.setItem('ordis_voicevox_url', localVoicevoxUrl.trim());
    }
    if (setVoicevoxUrl) setVoicevoxUrl(localVoicevoxUrl.trim());
    
    if (localVoicevoxSpeaker !== undefined) {
      localStorage.setItem('ordis_voicevox_speaker', String(localVoicevoxSpeaker));
    }
    if (setVoicevoxSpeaker) setVoicevoxSpeaker(localVoicevoxSpeaker);
    
    if (localClipboardCopyMode && setClipboardCopyMode) {
      localStorage.setItem('ordis_clipboard_copy_mode', localClipboardCopyMode);
      setClipboardCopyMode(localClipboardCopyMode);
    }

    if (setShowSteelPath) {
      setShowSteelPath(localShowSteelPath);
      localStorage.setItem('showSteelPath', String(localShowSteelPath));
    }

    if (setEnabledExtensions) {
      setEnabledExtensions(localExtensions);
      localStorage.setItem('enabledExtensions', JSON.stringify(localExtensions));
    }

    localStorage.setItem('syndicateRanks', JSON.stringify(localSyndicateRanks));

    // Save Language and Region Settings
    localStorage.setItem('ordis_locale', locale);
    localStorage.setItem('ordis_timezone', timeZone);

    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleDeleteKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setInputKey('');
    setSaveStatus('deleted');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">システム設定 (Settings)</h2>
        <p className="page-desc">AIチャット設定および音声出力連携の設定を行います。</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '650px', margin: '0 auto' }}>
        
        {/* Save Form */}
        <form onSubmit={handleSave} className="settings-form" style={{ display: 'contents' }}>
          
          {/* Card 1: System Mode */}
          <div className={`glass-card ${inputKey ? 'neon-teal' : 'neon-purple'}`}>
            <h3 className="card-title" style={{ color: inputKey ? 'var(--color-teal)' : 'var(--color-purple)' }}>
              <ShieldAlert size={20} className="card-title-icon" style={{ color: inputKey ? 'var(--color-teal)' : 'var(--color-purple)' }} />
              現在のシステムモード
            </h3>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              {inputKey ? (
                <>
                  <div className="input-text" style={{backgroundColor: 'rgba(0, 240, 255, 0.1)', color: 'var(--color-teal)', border: '1px solid rgba(0, 240, 255, 0.3)', fontWeight: 'bold'}}>
                    🌐 オンラインモード稼働中 (Gemini AI 接続)
                  </div>
                  <p className="cycle-sub" style={{ marginTop: '12px', lineHeight: '1.6' }}>
                    現在は外部AI（Gemini API）を使用し、雑談や専門的な質問に対応可能な「オンラインモード」で動作しています。
                  </p>
                </>
              ) : (
                <>
                  <div className="input-text" style={{backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', border: '1px solid rgba(76, 175, 80, 0.3)', fontWeight: 'bold'}}>
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
                  <button type="button" onClick={handleDeleteKey} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
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
                  style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <h4 style={{ color: 'var(--text-color)', marginTop: '24px', marginBottom: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px' }}>表示設定</h4>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={localShowSteelPath}
                  onChange={(e) => setLocalShowSteelPath(e.target.checked)}
                />
                <span style={{ fontWeight: '500' }}>「鋼の道のり」のミッションを表示する</span>
              </label>
              <p className="cycle-sub" style={{ marginTop: '8px', marginLeft: '24px' }}>
                オフにすると、亀裂や依頼リストからレベル100以上の「鋼の道のり (Steel Path)」ミッションを非表示にします。
              </p>
            </div>
          </div>

          {/* Card 2: Voice Settings */}
          <div className="glass-card neon-teal">
            <h3 className="card-title" style={{ color: 'var(--color-teal)' }}>
              <Volume2 size={20} className="card-title-icon" style={{ color: 'var(--color-teal)' }} />
              音声出力 ＆ 外部ソフト連携設定
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Radio options for voice sources */}
              <div className="form-group">
                <label className="form-label">音声の出力方法</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                  
                  {/* Standard Web Speech */}
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

                  {/* VOICEVOX integration */}
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

                  {/* Clipboard copy helper */}
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
                    gap: '12px'
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
                    gap: '12px'
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

          {/* Card 3: Language & Region Settings */}
          <div className="glass-card neon-gold">
            <h3 className="card-title" style={{ color: 'var(--color-gold)' }}>
              <Compass size={20} className="card-title-icon" style={{ color: 'var(--color-gold)' }} />
              言語・地域設定 (Language & Region)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">言語 (Locale)</label>
                <select
                  className="input-text"
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="ja-JP">日本語 (ja-JP)</option>
                  <option value="en-US">English (en-US)</option>
                  <option value="en-GB">English (en-GB)</option>
                  <option value="zh-CN">中文 - 簡体字 (zh-CN)</option>
                  <option value="zh-TW">中文 - 繁体字 (zh-TW)</option>
                  <option value="ko-KR">한국어 (ko-KR)</option>
                  <option value="fr-FR">Français (fr-FR)</option>
                  <option value="de-DE">Deutsch (de-DE)</option>
                  <option value="es-ES">Español (es-ES)</option>
                  <option value="ru-RU">Русский (ru-RU)</option>
                </select>
                <p className="cycle-sub" style={{ marginTop: '4px' }}>※ 日付や時刻の表記言語を変更します。</p>
              </div>

              <div className="form-group">
                <label className="form-label">地域・タイムゾーン (Timezone)</label>
                <select
                  className="input-text"
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  style={{ width: '100%' }}
                >
                  {typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function' ? (
                    Intl.supportedValuesOf('timeZone').map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))
                  ) : (
                    <>
                      <option value="Asia/Tokyo">Asia/Tokyo</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Europe/London">Europe/London</option>
                    </>
                  )}
                </select>
                <p className="cycle-sub" style={{ marginTop: '4px' }}>※ 世界地図に登録されているすべての国・地域から選択できます。</p>
              </div>
            </div>
          </div>

          {/* Card 4: Syndicate Ranks */}
          <div className="glass-card neon-purple" style={{ marginBottom: '24px' }}>
            <h3 className="card-title" style={{ color: 'var(--color-purple)' }}>
              <Crosshair size={20} className="card-title-icon" style={{ color: 'var(--color-purple)' }} />
              中立シンジケート 地位ランク設定
            </h3>
            <p className="cycle-sub" style={{ marginBottom: '20px' }}>
              現在の自分の地位ランク (0〜5) を設定すると、中立シンジケート画面で受注条件を満たさない依頼が非表示になります。
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {[
                { id: 'Ostrons', label: 'オストロン (シータス)' },
                { id: 'Solaris United', label: 'ソラリス連合 (フォーチュナー)' },
                { id: 'Entrati', label: 'エントラティ (ダイモス)' },
                { id: 'The Holdfasts', label: 'ホールドファスト (Zariman)' },
                { id: 'Cavia', label: 'カビア (サンクタム)' },
                { id: 'The Hex', label: 'The Hex (1999)' },
              ].map(syn => (
                <div key={syn.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="form-label" style={{ fontSize: '13px' }}>{syn.label}</label>
                  <select 
                    className="input-text" 
                    value={localSyndicateRanks[syn.id] ?? 5} 
                    onChange={(e) => setLocalSyndicateRanks(prev => ({ ...prev, [syn.id]: Number(e.target.value) }))}
                  >
                    {[0, 1, 2, 3, 4, 5].map(rank => (
                      <option key={rank} value={rank}>ランク {rank}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <h3 className="card-title">
              <Database size={20} className="card-title-icon" style={{ color: 'var(--color-teal)' }} />
              拡張機能 (Extensions)
            </h3>
            <p className="cycle-sub" style={{ marginBottom: '20px' }}>
              サイドバーに表示する機能を個別にオン・オフできます。不要な機能を隠して画面をスッキリさせましょう。
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {[
                { id: 'beginnerguide', label: '初心者ガイド' },
                { id: 'weekly', label: 'ウィークリー情報' },
                { id: 'syndicates', label: '中立シンジケート' },
                { id: 'builds', label: 'フレームビルド' },
                { id: 'dataexplorer', label: 'データベース検索' },
                { id: 'wishlist', label: '欲しいもの・追跡' },
                { id: 'relicgenerator', label: 'レリック表生成' },
                { id: 'tradehelper', label: 'トレードコピペ' },
                { id: 'rulesguide', label: '安全規約＆マナー' },
                { id: 'localchat', label: 'ローカルチャット' },
                { id: 'cephalonai', label: 'セファロンAI' }
              ].map(ext => (
                <label key={ext.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <input 
                    type="checkbox" 
                    checked={localExtensions[ext.id] !== false}
                    onChange={(e) => setLocalExtensions(prev => ({ ...prev, [ext.id]: e.target.checked }))}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold)' }}
                  />
                  <span>{ext.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-primary" style={{ alignSelf: 'center', padding: '12px 40px' }}>
            設定をすべて保存する
          </button>
        </form>

        {saveStatus === 'saved' && (
          <div className="alert-box info" style={{ textAlign: 'center' }}>
            設定を保存しました！
          </div>
        )}

        <div className="alert-box info" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <ShieldAlert size={24} style={{ color: 'var(--color-teal)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: 'var(--color-teal)', display: 'block', marginBottom: '4px' }}>セキュリティとプライバシーについて</strong>
            本アプリケーションはサーバーを持たない完全なクライアントサイド（SPA）アプリです。
            入力されたAPIキーはユーザー自身のブラウザ（localStorage）にのみ保存され、開発者を含むいかなる外部サーバーにも送信されません。
          </div>
        </div>
      </div>
    </div>
  );
};
