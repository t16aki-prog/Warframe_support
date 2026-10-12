import React from 'react';
import { BadgeAlert } from 'lucide-react';

export const TradeMannersBox: React.FC = () => {
  return (
    <div className="glass-card">
      <h3 className="card-title">
        <BadgeAlert size={18} className="card-title-icon" style={{ color: 'var(--color-gold)' }} />
        トレード時のチェックリスト
      </h3>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
        <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>✔</span>
          取引に必要なクレジット（取引税）が十分にありますか？（特にアルケインや伝説MODは高額なクレジットが必要です）
        </li>
        <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>✔</span>
          道場に入った後、ホストから「取引申請」が来るまでじっと待っていますか？
        </li>
        <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>✔</span>
          取引画面にセットしたアイテム、およびプラチナの数量は正しいですか？
        </li>
        <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>✔</span>
          取引が終わったら「ty (thank you)」などの挨拶を送りましたか？
        </li>
      </ul>
    </div>
  );
};
