import React from 'react';
import { Users } from 'lucide-react';

export function LocalChat() {
  return (
    <div className="tab-pane active" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header className="tab-header" style={{ marginBottom: '1rem' }}>
        <h2>ローカルチャット</h2>
        <p>※ Web版（Vercel公開環境）では、現在ローカルチャット機能は無効化されています。</p>
      </header>

      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '4rem', padding: '2rem' }}>
        <Users size={64} style={{ margin: '0 auto', opacity: 0.5, marginBottom: '1rem' }} />
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>機能制限</p>
        <p>サーバーレス環境（Vercel等）での動作のため、同一ネットワーク内での通信（Socket.io）機能は利用できません。</p>
        <p>将来的にはグローバルチャットとして改修される予定です。</p>
      </div>
    </div>
  );
}
