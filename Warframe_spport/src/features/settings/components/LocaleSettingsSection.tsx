import React from 'react';
import { Compass } from 'lucide-react';
import { LANGUAGE_OPTIONS } from '../constants';

interface LocaleSettingsSectionProps {
  locale: string;
  setLocale: (val: string) => void;
  timeZone: string;
  setTimeZone: (val: string) => void;
}

export const LocaleSettingsSection: React.FC<LocaleSettingsSectionProps> = ({
  locale,
  setLocale,
  timeZone,
  setTimeZone,
}) => {
  return (
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
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
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
                <option key={tz} value={tz}>
                  {tz}
                </option>
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
  );
};
