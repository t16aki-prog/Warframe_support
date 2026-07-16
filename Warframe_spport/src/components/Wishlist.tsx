import React, { useState, useEffect } from 'react';
import { Star, Target, Trash2 } from 'lucide-react';

export const Wishlist: React.FC = () => {
  const [wishlist, setWishlist] = useState<{ id: string, name: string, type: 'relic' | 'part' | 'frame' | 'resource' }[]>([]);
  const [trackedItem, setTrackedItem] = useState<string | null>(null);

  useEffect(() => {
    const savedWishlist = localStorage.getItem('warframe_wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
    const savedTracked = localStorage.getItem('warframe_tracked_item');
    if (savedTracked) {
      setTrackedItem(savedTracked);
    }
  }, []);

  const saveWishlist = (newList: any[]) => {
    setWishlist(newList);
    localStorage.setItem('warframe_wishlist', JSON.stringify(newList));
  };

  const removeItem = (id: string) => {
    const newList = wishlist.filter(item => item.id !== id);
    saveWishlist(newList);
    if (trackedItem === id) {
      handleTrack(null);
    }
  };

  const handleTrack = (id: string | null) => {
    setTrackedItem(id);
    if (id) {
      localStorage.setItem('warframe_tracked_item', id);
    } else {
      localStorage.removeItem('warframe_tracked_item');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">欲しいものリスト・追跡 (Wishlist & Tracking)</h2>
        <p className="page-desc">欲しいアイテムをリスト化し、どれか一つを追跡（トラッキング）対象に設定できます。追跡中のアイテムが入手可能な亀裂ミッションはダッシュボードで強調表示されます。</p>
      </div>

      <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h3 className="card-title" style={{ color: 'var(--color-gold)' }}>
          <Star size={20} className="card-title-icon" style={{ color: 'var(--color-gold)' }} />
          欲しいものリスト
        </h3>

        {wishlist.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            アイテムが登録されていません。<br/>
            「データベース検索」画面から、欲しいアイテムを追加してください。
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {wishlist.map((item) => (
              <div 
                key={item.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '16px', 
                  background: trackedItem === item.name ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255,255,255,0.02)', 
                  border: trackedItem === item.name ? '1px solid var(--color-teal)' : '1px solid var(--border-light)',
                  borderRadius: '8px',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <div>
                  <strong style={{ fontSize: '16px', color: trackedItem === item.name ? 'var(--color-teal)' : 'var(--text-color)' }}>
                    {item.name}
                  </strong>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    種類: {item.type === 'relic' ? 'レリック' : item.type === 'frame' ? 'フレーム/武器' : item.type === 'resource' ? '素材' : 'パーツ'}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleTrack(trackedItem === item.name ? null : item.name)}
                    className="btn-copy"
                    style={{ 
                      borderColor: trackedItem === item.name ? 'var(--color-teal)' : 'var(--border-light)',
                      color: trackedItem === item.name ? 'var(--color-teal)' : 'var(--text-muted)'
                    }}
                  >
                    <Target size={16} style={{ marginRight: '6px' }} />
                    {trackedItem === item.name ? '追跡中' : '追跡する'}
                  </button>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="btn-copy"
                    style={{ borderColor: 'rgba(255, 77, 77, 0.3)', color: 'var(--color-danger)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card" style={{ maxWidth: '800px', margin: '24px auto 0' }}>
        <h3 className="card-title" style={{ color: 'var(--color-teal)' }}>
          <Target size={20} className="card-title-icon" style={{ color: 'var(--color-teal)' }} />
          現在の追跡対象
        </h3>
        {trackedItem ? (
          <div style={{ padding: '16px', background: 'rgba(0, 242, 254, 0.05)', borderRadius: '8px', border: '1px dashed var(--color-teal)' }}>
            <strong style={{ fontSize: '18px', color: 'var(--color-teal)' }}>{trackedItem}</strong>
            <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
              このアイテムが通常のミッション報酬（ローテーション報酬等）としてドロップする場所（ノード）に亀裂が発生している場合、ダッシュボードの亀裂一覧で<span style={{color: 'var(--color-gold)'}}>🎯 追跡アイテムドロップ！</span>と強調表示されます。
            </p>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)' }}>
            追跡対象は設定されていません。上のリストから「追跡する」を選んでください。
          </div>
        )}
      </div>
    </div>
  );
};
