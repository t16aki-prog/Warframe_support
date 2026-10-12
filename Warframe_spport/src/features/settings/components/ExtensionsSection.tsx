import React from 'react';
import { Database } from 'lucide-react';
import { EXTENSION_LIST } from '../constants';

interface ExtensionsSectionProps {
  extensions: Record<string, boolean>;
  onToggle: (id: string, checked: boolean) => void;
}

export const ExtensionsSection: React.FC<ExtensionsSectionProps> = ({
  extensions,
  onToggle,
}) => {
  return (
    <div className="glass-card" style={{ marginBottom: '24px' }}>
      <h3 className="card-title">
        <Database size={20} className="card-title-icon" style={{ color: 'var(--color-teal)' }} />
        拡張機能 (Extensions)
      </h3>
      <p className="cycle-sub" style={{ marginBottom: '20px' }}>
        サイドバーに表示する機能を個別にオン・オフできます。不要な機能を隠して画面をスッキリさせましょう。
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        {EXTENSION_LIST.map((ext) => (
          <label
            key={ext.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.02)',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
            }}
          >
            <input
              type="checkbox"
              checked={extensions[ext.id] !== false}
              onChange={(e) => onToggle(ext.id, e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold)' }}
            />
            <span>{ext.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
