import { useState, useEffect } from 'react';
import type { SettingsProps, SaveStatus } from '../types';
import { DEFAULT_SYNDICATE_RANKS } from '../constants';

export const useSettingsForm = (props: SettingsProps) => {
  const {
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
  } = props;

  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [localVoiceSource, setLocalVoiceSource] = useState(voiceSource || 'browser');
  const [localVoicevoxUrl, setLocalVoicevoxUrl] = useState(voicevoxUrl || 'http://localhost:50021');
  const [localVoicevoxSpeaker, setLocalVoicevoxSpeaker] = useState(voicevoxSpeaker || 2);
  const [localClipboardCopyMode, setLocalClipboardCopyMode] = useState(clipboardCopyMode || 'all');
  const [localShowSteelPath, setLocalShowSteelPath] = useState(showSteelPath ?? true);
  const [localExtensions, setLocalExtensions] = useState<Record<string, boolean>>(enabledExtensions || {});

  const [localSyndicateRanks, setLocalSyndicateRanks] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('syndicateRanks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* fallback */
      }
    }
    return DEFAULT_SYNDICATE_RANKS;
  });

  const [locale, setLocale] = useState(
    () => localStorage.getItem('ordis_locale') || (typeof navigator !== 'undefined' ? navigator.language : 'ja-JP')
  );
  const [timeZone, setTimeZone] = useState(
    () => localStorage.getItem('ordis_timezone') || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Tokyo')
  );

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

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

  const handleSyndicateRankChange = (id: string, rank: number) => {
    setLocalSyndicateRanks((prev) => ({ ...prev, [id]: rank }));
  };

  const handleExtensionToggle = (id: string, checked: boolean) => {
    setLocalExtensions((prev) => ({ ...prev, [id]: checked }));
  };

  return {
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
    isOnline: Boolean(inputKey)
  };
};
