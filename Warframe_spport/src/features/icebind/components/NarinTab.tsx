import React from 'react';
import { Zap, Swords } from 'lucide-react';

export const NarinTab: React.FC = () => {
  return (
    <div>
      {/* Narin Overview Card */}
      <div className="glass-card neon-frost" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 500px' }}>
            <span className="badge frost" style={{ marginBottom: '8px', display: 'inline-block' }}>
              第66の戦士 (The 66th Warframe)
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#38bdf8', marginBottom: '10px' }}>
              Narin (ナリン) - 氷刃の舞姫
            </h2>
            <p style={{ color: 'var(--text-main)', fontSize: '14px', lineHeight: '1.7', marginBottom: '16px' }}>
              Update 44「ナリンの氷刃」にて実装された最新の冷気属性Warframe。
              レイピアを用いた優美な剣舞と、凍結した敵から回収する冷気エネルギー<strong>「氷ゲージ (Ice Gauge)」</strong>を駆使して戦います。
              周囲の冷気状態異常を吸収して自らに超過オーバーガードを張り巡らせる能力を持つため、敵Lv999+の「氷河の縛り」において屈指の生存力と装甲剥離性能を発揮します。
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>メイン属性</div>
                <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '14px' }}>Cold (冷気)</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>得意武器</div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '14px' }}>レイピア (Rapier)</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>固有リソース</div>
                <div style={{ fontWeight: 700, color: '#93c5fd', fontSize: '14px' }}>氷ゲージ (0〜100%)</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>縛り適性</div>
                <div style={{ fontWeight: 700, color: 'var(--color-gold)', fontSize: '14px' }}>SS (最上位メタ)</div>
              </div>
            </div>
          </div>

          {/* Passive Sangodae Highlight */}
          <div style={{ flex: '1 1 300px', background: 'rgba(0, 0, 0, 0.35)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(0, 210, 255, 0.25)' }}>
            <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
              Passive Ability
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
              Sangodae (サンゴデ)
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Narinまたは味方が凍結した敵をキルした際、特殊な<strong>「冷気弾薬パック」</strong>がドロップします。
              これを拾うとプライマリおよびセカンダリ武器の弾薬が瞬時に補充され、15秒間<strong>冷気ダメージ+100%</strong>のエンチャントが付与されます。
            </p>
            <div style={{ marginTop: '12px', fontSize: '11px', color: '#38bdf8', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
              💡 Lv999戦では弾薬枯渇が頻発するため、このパッシブによる無尽蔵の弾薬供給が分隊全体の生命線となります。
            </div>
          </div>
        </div>
      </div>

      {/* 4 Active Abilities Grid */}
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Zap size={20} style={{ color: '#38bdf8' }} /> ナリンの4大アビリティ詳細
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="badge frost">1st Ability</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>消費: 25 Energy</span>
          </div>
          <h4 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>Neote (ネオテ)</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '12px' }}>
            氷のレイピアを構えて前方に猛スピードで突進。直線上の敵を貫通し、確定で冷気＆刺突状態異常を付与します。
            命中した敵1体につき<strong>氷ゲージが15%</strong>チャージされます。
          </p>
          <div style={{ fontSize: '11px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '6px 10px', borderRadius: '6px' }}>
            用途: ゲージ高速充填 ＆ ナリファイアバリアや密集地帯への突破
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderColor: 'rgba(0, 210, 255, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="badge frost" style={{ background: 'rgba(46, 196, 182, 0.2)', color: 'var(--color-success)', borderColor: 'rgba(46, 196, 182, 0.4)' }}>2nd Ability (最重要)</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>消費: 50 Energy</span>
          </div>
          <h4 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>Naraemagi (ナレマギ)</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '12px' }}>
            周囲の敵に付着している冷気スタックを自らに引き寄せ、シールドを瞬時に全回復。
            さらにシールド上限を超過した回復量は<strong>「オーバーガード (Overguard)」</strong>へと変換されます（上限35,000+）。
          </p>
          <div style={{ fontSize: '11px', color: 'var(--color-success)', background: 'rgba(46, 196, 182, 0.1)', padding: '6px 10px', borderRadius: '6px' }}>
            用途: 状態異常完全無効 ＆ Lv999の即死攻撃から身を守る絶対防御
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="badge frost">3rd Ability</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>消費: 75 Energy</span>
          </div>
          <h4 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>Hakchum (ハクチュム)</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '12px' }}>
            宙へ優雅に浮揚したのち、ターゲットした座標へ氷の衝撃波とともに急降下。
            爆心地周囲の敵に<strong>「冷気ダメージ脆弱性 (+75%)」</strong>のデバフを刻み込みます。
          </p>
          <div style={{ fontSize: '11px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '6px 10px', borderRadius: '6px' }}>
            用途: エリート敵やエクシマスへのデバフ付与 ＆ 空中回避
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderColor: 'rgba(255, 183, 3, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="badge gold">4th Ultimate Ability</span>
            <span style={{ fontSize: '12px', color: 'var(--color-gold)' }}>条件: 氷ゲージ100%</span>
          </div>
          <h4 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>Nurinarim (ヌリナリム)</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '12px' }}>
            先祖の剣士の魂を宿し、氷片を舞散らせながら円舞攻撃を実行。
            氷片が命中した敵の<strong>装甲とシールドを100%完全粉砕</strong>し、凍結した敵を連鎖大爆発させて壊滅させます。
          </p>
          <div style={{ fontSize: '11px', color: 'var(--color-gold)', background: 'rgba(255, 183, 3, 0.1)', padding: '6px 10px', borderRadius: '6px' }}>
            用途: Lv999敵の装甲を瞬時に剥離し、大爆発で一網打尽にする決戦兵器
          </div>
        </div>
      </div>

      {/* Recommended Build for Icebind */}
      <div className="glass-card neon-purple" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-purple)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Swords size={20} /> 氷河の縛り・特化型推奨ビルド構成 (The Icebind Spec)
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          敵Lv999+の猛攻を耐え抜きつつ、アビリティ回転と冷気オーバーガードを維持するための厳選構成です。
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>推奨 MOD 構成</div>
            <ul style={{ listStyle: 'none', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>🔹 <strong>Aura:</strong> Brief Respite (シールドゲーティング補助)</li>
              <li>🔹 <strong>Exilus:</strong> Primed Sure Footed (ノックダウン完全防止)</li>
              <li>🔹 <strong>Archon Flow:</strong> 冷気キル時にオーブ追加生成</li>
              <li>🔹 <strong>Archon Continuity:</strong> 毒と冷気の複合持続時間UP</li>
              <li>🔹 <strong>Blind Rage:</strong> アビリティ威力の最大化</li>
              <li>🔹 <strong>Transient Fortitude:</strong> 威力向上</li>
              <li>🔹 <strong>Stretch / Overextended:</strong> 範囲拡大（冷気吸引範囲）</li>
              <li>🔹 <strong>Rolling Guard:</strong> 緊急時無敵＆状態異常解除</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-gold)', marginBottom: '8px' }}>アルケイン ＆ アルコンの欠片</div>
            <ul style={{ listStyle: 'none', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>✨ <strong>Arcane Ice Storm:</strong> 敵凍結時にアビリティ威力＆武器速度+40%</li>
              <li>✨ <strong>Arcane Energize:</strong> エネルギー枯渇防止</li>
              <li>💠 <strong>クリムゾン・シャード (赤) x3:</strong> アビリティ威力+30% (Tauforged)</li>
              <li>💠 <strong>アンバー・シャード (黄) x2:</strong> 発動速度+37.5% (迅速な舞の発動)</li>
              <li style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px' }}>
                🗡️ <strong>相性の良い武器:</strong> 属性冷気レイピア、Glaxion Vandal、Torid (Incarnon)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
