import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Trash2, ShieldAlert, Volume2, Info, Compass, Database } from 'lucide-react';

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
  cephalonName?: string;
  setCephalonName?: (name: string) => void;
  cephalonVoiceURI?: string;
  setCephalonVoiceURI?: (uri: string) => void;
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
  setEnabledExtensions,
  cephalonName,
  setCephalonName,
  cephalonVoiceURI,
  setCephalonVoiceURI
}) => {
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  
  const [localCephalonName, setLocalCephalonName] = useState(cephalonName || 'オーディス');
  const [localCephalonVoiceURI, setLocalCephalonVoiceURI] = useState(cephalonVoiceURI || '');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        setAvailableVoices(window.speechSynthesis.getVoices());
      }
    };
    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);
  
  // Local voice settings for form
  const [localVoiceSource, setLocalVoiceSource] = useState(voiceSource);
  const [localVoicevoxUrl, setLocalVoicevoxUrl] = useState(voicevoxUrl);
  const [localVoicevoxSpeaker, setLocalVoicevoxSpeaker] = useState(voicevoxSpeaker || 2);
  const [localClipboardCopyMode, setLocalClipboardCopyMode] = useState(clipboardCopyMode || 'all');
  const [localShowSteelPath, setLocalShowSteelPath] = useState(showSteelPath ?? true);
  const [localExtensions, setLocalExtensions] = useState<Record<string, boolean>>(enabledExtensions || {});

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

    if (setCephalonName) {
      localStorage.setItem('cephalonName', localCephalonName);
      setCephalonName(localCephalonName);
    }
    
    if (setCephalonVoiceURI) {
      localStorage.setItem('cephalonVoiceURI', localCephalonVoiceURI);
      setCephalonVoiceURI(localCephalonVoiceURI);
    }

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
          <div className="glass-card neon-purple">
            <h3 className="card-title" style={{ color: 'var(--color-purple)' }}>
              <ShieldAlert size={20} className="card-title-icon" style={{ color: 'var(--color-purple)' }} />
              現在のシステムモード
            </h3>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Key size={16} />
                  Gemini API キー (AIチャット用)
                </label>
                {apiKey && (
                  <button type="button" onClick={handleDeleteKey} className="btn-copy" style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
                    <Trash2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    キーを削除
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <input
                  type={showKey ? 'text' : 'password'}
                  className="input-text"
                  placeholder="AIzer..."
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn-copy"
                  onClick={() => setShowKey(!showKey)}
                  style={{ padding: '0 12px' }}
                >
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="cycle-sub" style={{ marginTop: '8px' }}>
                ※ Google AI Studioで取得したGemini APIキーを入力してください。<br/>
                ※ キーを入力するとAIが世界ニュースや雑談にも対応できるオンラインモードになり、未入力の場合は定型文のみの完全オフラインモードとして動作します。
              </p>
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

          {/* Card 1.5: Cephalon Settings */}
          <div className="glass-card neon-gold">
            <h3 className="card-title" style={{ color: 'var(--color-gold)' }}>
              <Volume2 size={20} className="card-title-icon" style={{ color: 'var(--color-gold)' }} />
              セファロンAI カスタマイズ
            </h3>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">セファロンの名前</label>
              <input
                type="text"
                className="input-text"
                value={localCephalonName}
                onChange={(e) => setLocalCephalonName(e.target.value)}
                placeholder="例: オーディス"
              />
              <p className="cycle-sub" style={{ marginTop: '4px' }}>
                ※ 音声認識の起動（ウェイクワード）も「Hi {localCephalonName || 'オーディス'}」に変わります。
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">セファロンの音声 (ブラウザ標準TTS用)</label>
              <select
                className="input-text"
                value={localCephalonVoiceURI}
                onChange={(e) => setLocalCephalonVoiceURI(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">(自動選択 - デフォルト)</option>
                {availableVoices.map((voice, idx) => (
                  <option key={idx} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
              <p className="cycle-sub" style={{ marginTop: '4px' }}>
                ※ OSやブラウザにインストールされている合成音声から好みのものを選択できます。
              </p>
              <button 
                type="button" 
                className="btn-copy" 
                style={{ marginTop: '8px' }}
                onClick={() => {
                  if (!('speechSynthesis' in window)) return;
                  window.speechSynthesis.cancel();
                  const utt = new SpeechSynthesisUtterance(`こんにちは、テンノ。私の名前は${localCephalonName || 'オーディス'}です。`);
                  if (localCephalonVoiceURI) {
                    const selectedVoice = availableVoices.find(v => v.voiceURI === localCephalonVoiceURI);
                    if (selectedVoice) utt.voice = selectedVoice;
                  } else {
                    const jaVoice = availableVoices.find(v => v.lang.startsWith('ja'));
                    if (jaVoice) utt.voice = jaVoice;
                  }
                  window.speechSynthesis.speak(utt);
                }}
              >
                音声をテスト再生する
              </button>
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
                    <label className="form-label" style={{ fontSize: '13px' }}>話者 (Speaker)</label>
                    <select
                      className="input-text"
                      value={localVoicevoxSpeaker}
                      onChange={(e) => setLocalVoicevoxSpeaker(Number(e.target.value))}
                      style={{ width: '100%', marginBottom: '4px' }}
                    >
                      <option value="3">ずんだもん (ノーマル) [ID:3]</option>
                      <option value="1">ずんだもん (あまあま) [ID:1]</option>
                      <option value="2">四国めたん (ノーマル) [ID:2]</option>
                      <option value="8">春日部つむぎ (ノーマル) [ID:8]</option>
                      <option value="10">雨晴はう (ノーマル) [ID:10]</option>
                      <option value="13">冥鳴ひまり (ノーマル) [ID:13]</option>
                      <option value="14">九州そら (ノーマル) [ID:14]</option>
                      <option value="20">もち子さん (ノーマル) [ID:20]</option>
                      <option value="46">小夜/SAYO (ノーマル) [ID:46]</option>
                    </select>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="cycle-sub">カスタムID指定:</span>
                      <input
                        type="number"
                        className="input-text"
                        style={{ width: '80px', padding: '4px 8px', minHeight: '28px' }}
                        value={localVoicevoxSpeaker}
                        onChange={(e) => setLocalVoicevoxSpeaker(Number(e.target.value))}
                      />
                    </div>
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
