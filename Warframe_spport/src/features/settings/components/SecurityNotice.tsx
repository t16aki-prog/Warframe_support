import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const SecurityNotice: React.FC = () => {
  return (
    <div className="alert-box info" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      <ShieldAlert size={24} style={{ color: 'var(--color-teal)', flexShrink: 0, marginTop: '2px' }} />
      <div>
        <strong style={{ color: 'var(--color-teal)', display: 'block', marginBottom: '4px' }}>
          セキュリティとプライバシーについて
        </strong>
        本アプリケーションはサーバーを持たない完全なクライアントサイド（SPA）アプリです。
        入力されたAPIキーはユーザー自身のブラウザ（localStorage）にのみ保存され、開発者を含むいかなる外部サーバーにも送信されません。
      </div>
    </div>
  );
};
