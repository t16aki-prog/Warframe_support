import React from 'react';
import { ShoppingCart, Sparkles, Star } from 'lucide-react';
import type { WorldState } from '../../../utils/warframeApi';
import { translateText } from '../../../utils/translate';

interface EventsCardProps {
  worldState: WorldState;
  userLocale: string;
  userTimeZone: string;
  getLiveTimeLeft: (target: string) => string;
}

export const EventsCard: React.FC<EventsCardProps> = ({
  worldState,
  userLocale,
  userTimeZone,
  getLiveTimeLeft,
}) => {
  const currentResurgence = worldState.vaultTrader?.schedule
    ? worldState.vaultTrader.schedule.filter((s) => s.expiry && new Date(s.expiry).getTime() > Date.now())
    : [];

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Void Trader Section */}
      <div>
        <h3 className="card-title" style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>
          <ShoppingCart size={18} className="card-title-icon" style={{ color: 'var(--color-gold)' }} />
          Voidの商人 Baro Ki'Teer
        </h3>
        {worldState.voidTrader.active ? (
          <div style={{ padding: '12px', background: 'rgba(255, 183, 3, 0.05)', border: '1px solid rgba(255, 183, 3, 0.2)', borderRadius: '8px' }}>
            <div style={{ fontWeight: 'bold', color: 'var(--color-gold)' }}>
              現在出現中！ Location: {worldState.voidTrader.location}
            </div>
            <div className="cycle-sub" style={{ fontVariantNumeric: 'tabular-nums' }}>
              出発まであと: {getLiveTimeLeft(worldState.voidTrader.expiry)}
            </div>
            <div className="cycle-sub" style={{ marginTop: '4px' }}>
              出発日時: {new Date(worldState.voidTrader.expiry).toLocaleString(userLocale, { timeZone: userTimeZone })}
            </div>
          </div>
        ) : (
          <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
            <div>次回到着予定地: {worldState.voidTrader.location || '不明'}</div>
            <div className="cycle-sub" style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-mono)', fontSize: '14px', marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>
              到着まであと: {getLiveTimeLeft(worldState.voidTrader.activation)}
            </div>
            <div className="cycle-sub" style={{ marginTop: '4px' }}>
              到着日時: {new Date(worldState.voidTrader.activation).toLocaleString(userLocale, { timeZone: userTimeZone })}
            </div>
          </div>
        )}
      </div>

      {/* Nightwave Section */}
      {worldState.nightwave && (
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
          <h3 className="card-title" style={{ color: 'var(--color-teal)', marginBottom: '12px' }}>
            <Sparkles size={18} className="card-title-icon" style={{ color: 'var(--color-teal)' }} />
            ナイトウェーブ (Nightwave)
          </h3>
          {worldState.nightwave.expiry && (
            <div className="cycle-sub" style={{ marginBottom: '12px' }}>
              終了予定: {new Date(worldState.nightwave.expiry).toLocaleString(userLocale, { timeZone: userTimeZone })}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
            {worldState.nightwave.activeChallenges.map((challenge) => (
              <div
                key={challenge.id}
                style={{
                  padding: '8px',
                  background: 'rgba(255,255,255,0.015)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              >
                <div style={{ fontWeight: '600', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{translateText(challenge.title)}</span>
                  <span style={{ color: 'var(--color-teal)' }}>+{challenge.reputation}</span>
                </div>
                <div className="cycle-sub" style={{ fontSize: '11px' }}>{translateText(challenge.desc)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prime Resurgence Section */}
      {worldState.vaultTrader?.schedule && (
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
          <h3 className="card-title" style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>
            <Star size={18} className="card-title-icon" style={{ color: 'var(--color-gold)' }} />
            Prime Resurgence (Varzia)
          </h3>
          {currentResurgence.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="cycle-sub">
                現在のローテーション終了: {new Date(currentResurgence[0].expiry).toLocaleString(userLocale, { timeZone: userTimeZone })}
              </div>
              {currentResurgence.slice(0, 2).map((s, idx) => (
                <div key={idx} style={{ padding: '8px', background: 'rgba(255,183,3,0.05)', border: '1px solid rgba(255,183,3,0.2)', borderRadius: '6px', fontSize: '14px' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--color-gold)' }}>{s.item || 'シークレットアイテム'}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="cycle-sub">現在のデータはありません</div>
          )}
        </div>
      )}
    </div>
  );
};
