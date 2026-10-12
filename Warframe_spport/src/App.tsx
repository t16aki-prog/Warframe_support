import { useState, useEffect } from 'react';
import { Compass, MessageSquare, Search, Shield, Settings as SettingsIcon, Cpu, Users, Crosshair, Database, Star, CheckSquare, Calendar, Map, Snowflake } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Syndicates } from './components/Syndicates';
import { Builds } from './components/Builds';
import { Wishlist } from './components/Wishlist';
import { TradeHelper } from './components/TradeHelper';
import { RulesGuide } from './components/RulesGuide';
import { Settings } from './components/Settings';
import { DataExplorer } from './components/DataExplorer';
import { RelicGenerator } from './components/RelicGenerator';
import { Weekly } from './components/Weekly';
import { OrdisChat } from './components/OrdisChat';
import { BeginnerGuide } from './components/BeginnerGuide';
import { Icebind } from './components/Icebind';
import { Multiplayer } from './components/Multiplayer';
import './App.css';

type Tab = 'dashboard' | 'beginnerguide' | 'weekly' | 'icebind' | 'syndicates' | 'builds' | 'tradehelper' | 'dataexplorer' | 'relicgenerator' | 'wishlist' | 'rulesguide' | 'multiplayer' | 'localchat' | 'cephalonai' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [apiKey, setApiKey] = useState<string>('');
  const [showSteelPath, setShowSteelPath] = useState<boolean>(true);
  const [navState, setNavState] = useState<any>(null);

  const [voiceSource, setVoiceSource] = useState<string>('standard');
  const [voicevoxUrl, setVoicevoxUrl] = useState<string>('http://localhost:50021');
  const [voicevoxSpeaker, setVoicevoxSpeaker] = useState<number>(2);
  const [clipboardCopyMode, setClipboardCopyMode] = useState<string>('all');

  const defaultExtensions = {
    beginnerguide: true,
    weekly: true,
    icebind: true,
    syndicates: true,
    builds: true,
    dataexplorer: true,
    wishlist: true,
    relicgenerator: true,
    tradehelper: true,
    rulesguide: true,
    multiplayer: true,
    localchat: true,
    cephalonai: true
  };

  const [enabledExtensions, setEnabledExtensions] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('enabledExtensions');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge saved with defaults so new features aren't hidden for existing users
      return { ...defaultExtensions, ...parsed };
    }
    return defaultExtensions;
  });

  // Load API Key and Settings from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key') || '';
    setApiKey(savedKey);
    const savedSteelPath = localStorage.getItem('showSteelPath');
    if (savedSteelPath !== null) {
      setShowSteelPath(savedSteelPath === 'true');
    }

    const savedVoiceSource = localStorage.getItem('ordis_voice_source');
    if (savedVoiceSource) setVoiceSource(savedVoiceSource);

    const savedVoicevoxUrl = localStorage.getItem('ordis_voicevox_url');
    if (savedVoicevoxUrl) setVoicevoxUrl(savedVoicevoxUrl);

    const savedVoicevoxSpeaker = localStorage.getItem('ordis_voicevox_speaker');
    if (savedVoicevoxSpeaker) setVoicevoxSpeaker(Number(savedVoicevoxSpeaker));

    const savedClipboardMode = localStorage.getItem('ordis_clipboard_copy_mode');
    if (savedClipboardMode) setClipboardCopyMode(savedClipboardMode);

    const handleNavigate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.tab) {
        setActiveTab(detail.tab);
        setNavState(detail);
      }
    };
    window.addEventListener('navigateTab', handleNavigate);
    return () => window.removeEventListener('navigateTab', handleNavigate);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard showSteelPath={showSteelPath} />;
      case 'beginnerguide':
        return <BeginnerGuide />;
      case 'weekly':
        return <Weekly />;
      case 'icebind':
        return <Icebind />;
      case 'syndicates':
        return <Syndicates showSteelPath={showSteelPath} />;
      case 'builds':
        return <Builds />;
      case 'wishlist':
        return <Wishlist />;
      case 'dataexplorer':
        return <DataExplorer navState={navState} clearNavState={() => setNavState(null)} />;
      case 'relicgenerator':
        return <RelicGenerator navState={navState} clearNavState={() => setNavState(null)} />;
      case 'tradehelper':
        return <TradeHelper />;
      case 'rulesguide':
        return <RulesGuide />;
      case 'multiplayer':
        return <Multiplayer />;
      case 'localchat':
        return <Multiplayer />;
      case 'cephalonai':
        return <OrdisChat 
          apiKey={apiKey} 
          onNavigateToSettings={() => setActiveTab('settings')} 
        />;
      case 'settings':
        return <Settings 
          apiKey={apiKey} 
          setApiKey={setApiKey} 
          showSteelPath={showSteelPath} 
          setShowSteelPath={setShowSteelPath} 
          enabledExtensions={enabledExtensions}
          setEnabledExtensions={setEnabledExtensions}
          voiceSource={voiceSource}
          setVoiceSource={setVoiceSource}
          voicevoxUrl={voicevoxUrl}
          setVoicevoxUrl={setVoicevoxUrl}
          voicevoxSpeaker={voicevoxSpeaker}
          setVoicevoxSpeaker={setVoicevoxSpeaker}
          clipboardCopyMode={clipboardCopyMode}
          setClipboardCopyMode={setClipboardCopyMode}
        />;
      default:
        return <Dashboard showSteelPath={showSteelPath} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-section">
          <Cpu className="logo-icon" size={24} />
          <span className="logo-text">TENNO NAVI</span>
        </div>

        <nav className="nav-links">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <Compass size={18} />
            システム状況
          </button>

          {enabledExtensions.beginnerguide && (
            <button
              onClick={() => setActiveTab('beginnerguide')}
              className={`nav-item ${activeTab === 'beginnerguide' ? 'active' : ''}`}
            >
              <Map size={18} />
              初心者ガイド
            </button>
          )}
          
          {enabledExtensions.weekly && (
            <button
              onClick={() => setActiveTab('weekly')}
              className={`nav-item ${activeTab === 'weekly' ? 'active' : ''}`}
            >
              <Calendar size={18} />
              ウィークリー
            </button>
          )}

          {enabledExtensions.icebind && (
            <button
              onClick={() => setActiveTab('icebind')}
              className={`nav-item ${activeTab === 'icebind' ? 'active' : ''}`}
            >
              <Snowflake size={18} style={{ color: '#38bdf8' }} />
              氷河の縛り (The Icebind)
            </button>
          )}
          
          {enabledExtensions.syndicates && (
            <button
              onClick={() => setActiveTab('syndicates')}
              className={`nav-item ${activeTab === 'syndicates' ? 'active' : ''}`}
            >
              <Crosshair size={18} />
              中立シンジケート
            </button>
          )}
          
          {enabledExtensions.builds && (
            <button
              onClick={() => setActiveTab('builds')}
              className={`nav-item ${activeTab === 'builds' ? 'active' : ''}`}
            >
              <Shield size={18} />
              フレームビルド
            </button>
          )}

          {enabledExtensions.dataexplorer && (
            <button
              onClick={() => setActiveTab('dataexplorer')}
              className={`nav-item ${activeTab === 'dataexplorer' ? 'active' : ''}`}
            >
              <Database size={18} />
              データベース検索
            </button>
          )}

          {enabledExtensions.wishlist && (
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
            >
              <Star size={18} />
              欲しいもの・追跡
            </button>
          )}

          {enabledExtensions.relicgenerator && (
            <button
              onClick={() => setActiveTab('relicgenerator')}
              className={`nav-item ${activeTab === 'relicgenerator' ? 'active' : ''}`}
            >
              <CheckSquare size={18} />
              レリック表生成
            </button>
          )}

          {enabledExtensions.tradehelper && (
            <button
              onClick={() => setActiveTab('tradehelper')}
              className={`nav-item ${activeTab === 'tradehelper' ? 'active' : ''}`}
            >
              <Search size={18} />
              トレードコピペ
            </button>
          )}

          {enabledExtensions.rulesguide && (
            <button
              onClick={() => setActiveTab('rulesguide')}
              className={`nav-item ${activeTab === 'rulesguide' ? 'active' : ''}`}
            >
              <Shield size={18} />
              安全規約＆マナー
            </button>
          )}

          {(enabledExtensions.multiplayer ?? enabledExtensions.localchat) && (
            <button
              onClick={() => setActiveTab('multiplayer')}
              className={`nav-item ${activeTab === 'multiplayer' || activeTab === 'localchat' ? 'active' : ''}`}
            >
              <Users size={18} />
              マルチプレイ (募集)
            </button>
          )}

          {enabledExtensions.cephalonai && (
            <button
              onClick={() => setActiveTab('cephalonai')}
              className={`nav-item ${activeTab === 'cephalonai' ? 'active' : ''}`}
            >
              <MessageSquare size={18} />
              セファロンAI
            </button>
          )}

          <button
            onClick={() => setActiveTab('settings')}
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          >
            <SettingsIcon size={18} />
            システム設定
          </button>
        </nav>

        <div className="sidebar-footer">
          <p>© 2026 TENNO NAVI</p>
          <p style={{ fontSize: '10px', marginTop: '4px' }}>
            本アプリは非公式のファンメイドツールです。WarframeおよびDigital Extremesは、Digital Extremes Ltd.の商標または登録商標です。
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">{renderContent()}</main>
    </div>
  );
}

export default App;
