import { useState } from 'react';

export const useChatRecruiter = () => {
  const [selectedRelic, setSelectedRelic] = useState('');
  const [refinement, setRefinement] = useState('Radiant');
  const [partySize, setPartySize] = useState('1/4');
  const [missionType, setMissionType] = useState('H');

  const getChatText = () => {
    const refinementJP: Record<string, string> = {
      Intact: '無垢',
      Exceptional: '例外',
      Flawless: '無傷',
      Radiant: '輝く',
    };

    const refinementTag = refinementJP[refinement] || refinement;
    return `${missionType} [${selectedRelic}] ${refinementTag} 募集 ${partySize}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('クリップボードにコピーしました！');
  };

  const handleRelicSelect = (relicName: string) => {
    let base = relicName
      .replace(' (Radiant)', '')
      .replace(' (Flawless)', '')
      .replace(' (Exceptional)', '')
      .replace(' (Intact)', '')
      .trim();
    if (!base.toLowerCase().includes('relic') && !base.toLowerCase().includes('レリック')) {
      base += ' Relic';
    }
    base = base.replace(' (Vaulted)', '').trim();

    setSelectedRelic(base);
    document.getElementById('chat-generator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return {
    selectedRelic,
    setSelectedRelic,
    refinement,
    setRefinement,
    partySize,
    setPartySize,
    missionType,
    setMissionType,
    getChatText,
    copyToClipboard,
    handleRelicSelect,
  };
};
