import React from 'react';
import { MessageSquareCode, Copy, Check } from 'lucide-react';

interface MessageGeneratorBoxProps {
  whisperCommand: string;
  copied: boolean;
  onCopy: () => void;
  sellerName: string;
  hasItem: boolean;
}

export const MessageGeneratorBox: React.FC<MessageGeneratorBoxProps> = ({
  whisperCommand,
  copied,
  onCopy,
  sellerName,
  hasItem,
}) => {
  return (
    <div className="glass-card neon-purple">
      <h3 className="card-title" style={{ color: 'var(--color-purple)' }}>
        <MessageSquareCode size={18} className="card-title-icon" style={{ color: 'var(--color-purple)' }} />
        コピー用ゲーム内チャットコマンド
      </h3>
      <p className="cycle-sub" style={{ marginBottom: '16px' }}>
        以下のテキストをコピーし、ゲーム内のチャットウィンドウにそのまま貼り付ける（Ctrl+V）と、相手に直接ウィスパー（個チャ）を送ることができます。
      </p>

      <div className="copypasta-box" style={{ wordBreak: 'break-all' }}>
        <span>{whisperCommand}</span>
      </div>

      <button
        onClick={onCopy}
        className="btn-primary"
        style={{
          marginTop: '16px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          background: copied ? 'var(--color-success)' : undefined,
        }}
        disabled={!sellerName || !hasItem}
      >
        {copied ? (
          <>
            <Check size={18} />
            クリップボードにコピーしました！
          </>
        ) : (
          <>
            <Copy size={18} />
            チャットコマンドをコピー
          </>
        )}
      </button>

      {!sellerName && (
        <p className="cycle-sub" style={{ color: 'var(--color-danger)', marginTop: '8px', textAlign: 'center' }}>
          ※コピペメッセージを生成するには「ユーザー名」を入力してください。
        </p>
      )}
    </div>
  );
};
