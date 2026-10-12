import React from 'react';
import type { SettingsProps } from './types';
import { useSettingsForm } from './hooks/useSettingsForm';
import { SystemModeSection } from './components/SystemModeSection';
import { VoiceSettingsSection } from './components/VoiceSettingsSection';
import { LocaleSettingsSection } from './components/LocaleSettingsSection';
import { SyndicateRanksSection } from './components/SyndicateRanksSection';
import { ExtensionsSection } from './components/ExtensionsSection';
import { SecurityNotice } from './components/SecurityNotice';

export const Settings: React.FC<SettingsProps> = (props) => {
  const {
    inputKey,
    setInputKey,
    showKey,
    setShowKey,
    localVoiceSource,
    setLocalVoiceSource,
    localVoicevoxUrl,
    setLocalVoicevoxUrl,
    localVoicevoxSpeaker,
    setLocalVoicevoxSpeaker,
    localClipboardCopyMode,
    setLocalClipboardCopyMode,
    localShowSteelPath,
    setLocalShowSteelPath,
    localExtensions,
    handleExtensionToggle,
    localSyndicateRanks,
    handleSyndicateRankChange,
    locale,
    setLocale,
    timeZone,
    setTimeZone,
    saveStatus,
    handleSave,
    handleDeleteKey,
    isOnline,
  } = useSettingsForm(props);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">システム設定 (Settings)</h2>
        <p className="page-desc">AIチャット設定および音声出力連携の設定を行います。</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '650px', margin: '0 auto' }}>
        <form onSubmit={handleSave} className="settings-form" style={{ display: 'contents' }}>
          <SystemModeSection
            isOnline={isOnline}
            apiKey={props.apiKey}
            inputKey={inputKey}
            setInputKey={setInputKey}
            showKey={showKey}
            setShowKey={setShowKey}
            handleDeleteKey={handleDeleteKey}
            showSteelPath={localShowSteelPath}
            setShowSteelPath={setLocalShowSteelPath}
          />

          <VoiceSettingsSection
            localVoiceSource={localVoiceSource}
            setLocalVoiceSource={setLocalVoiceSource}
            localVoicevoxUrl={localVoicevoxUrl}
            setLocalVoicevoxUrl={setLocalVoicevoxUrl}
            localVoicevoxSpeaker={localVoicevoxSpeaker}
            setLocalVoicevoxSpeaker={setLocalVoicevoxSpeaker}
            localClipboardCopyMode={localClipboardCopyMode}
            setLocalClipboardCopyMode={setLocalClipboardCopyMode}
          />

          <LocaleSettingsSection
            locale={locale}
            setLocale={setLocale}
            timeZone={timeZone}
            setTimeZone={setTimeZone}
          />

          <SyndicateRanksSection
            ranks={localSyndicateRanks}
            onRankChange={handleSyndicateRankChange}
          />

          <ExtensionsSection
            extensions={localExtensions}
            onToggle={handleExtensionToggle}
          />

          <button type="submit" className="btn-primary" style={{ alignSelf: 'center', padding: '12px 40px' }}>
            設定をすべて保存する
          </button>
        </form>

        {saveStatus === 'saved' && (
          <div className="alert-box info" style={{ textAlign: 'center' }}>
            設定を保存しました！
          </div>
        )}

        <SecurityNotice />
      </div>
    </div>
  );
};
