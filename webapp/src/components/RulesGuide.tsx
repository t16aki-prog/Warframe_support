import React from 'react';
import { ShieldCheck, MessageSquare, AlertTriangle, Users, Award } from 'lucide-react';

export const RulesGuide: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">安全規約 ＆ マナーガイド</h2>
        <p className="page-desc">
          Warframeを安全かつ快適に遊ぶために、公式規約やコミュニティのマナー、法律を学びましょう。
        </p>
      </div>

      <div className="rules-container">
        {/* Section 1: Official Software Rules */}
        <section className="rule-section">
          <h3>
            <ShieldCheck size={22} className="card-title-icon" style={{ color: 'var(--color-teal)' }} />
            公式利用規約（EULA）と外部ツールポリシー
          </h3>
          <p>
            Digital Extremesは、ゲームバランスを損なうツールや自動化行為に対して非常に厳格な姿勢を取っています。
            これに違反すると、警告なしにアカウントが永久停止（2035年までBAN）されることがあります。
          </p>

          <div className="rule-grid">
            <div className="rule-card">
              <div className="rule-card-title" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertTriangle size={16} style={{ color: 'var(--color-danger)' }} />
                自動化マクロ・Botの禁止
              </div>
              <div className="rule-card-desc">
                キーボードやマウス入力を自動化するマクロ（特にAFK/放置ファーム目的のもの）や、一定の周期で特定のスキルを自動で実行する行為は完全に禁止されています。
                「自動で戦闘を行う」「放置した状態でアイテムを稼ぐ」といった行為はチート判定されます。
              </div>
            </div>

            <div className="rule-card">
              <div className="rule-card-title" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertTriangle size={16} style={{ color: 'var(--color-danger)' }} />
                メモリ改変・プロセスの解析禁止
              </div>
              <div className="rule-card-desc">
                Warframeのゲームメモリを読み書きするツール（チートツール、プロセスにフックする外部ソフト）は即座にBAN対象となります。
                オーバーレイを表示するソフトウェアや一部のツールも、ゲームメモリに干渉する動作があるとCloudflareや公式のアンチチート検知に引っかかるリスクがあります。
              </div>
            </div>

            <div className="rule-card">
              <div className="rule-card-title" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertTriangle size={16} style={{ color: 'var(--color-danger)' }} />
                RMT（リアルマネートレード）の禁止
              </div>
              <div className="rule-card-desc">
                ゲーム内のプラチナやアイテムを、現実の金銭（RMTサイト、個人の金銭やり取り）で取引することは、EULAにより固く禁じられています。
                また、複数アカウント（サブ垢）の間でプラチナを移動させたり、プロモーションコードを悪用してメインアカウントに送り届ける行為も厳重に対処されます。
              </div>
            </div>
          </div>

          <div className="alert-box danger" style={{ marginTop: '16px' }}>
            <strong>【警告：自己責任の原則】</strong>
            公式の回答として「安全であることが100%保証された非公式サードパーティソフトウェアは存在しない」とされています。
            本アプリケーションは、ゲーム本体に一切干渉しない外部のWebツールであるため100%安全ですが、ゲームクライアント本体に触れる常駐ソフト等の利用は極力避けましょう。
          </div>
        </section>

        {/* Section 2: Trading Manners */}
        <section className="rule-section">
          <h3>
            <MessageSquare size={22} className="card-title-icon" style={{ color: 'var(--color-gold)' }} />
            トレード（取引）におけるマナーとルール
          </h3>
          <p>
            Warframeでの取引はプレイヤー間の「クラン道場（Dojo）」で行われます。
            世界共通の暗黙のマナーがあり、それを守ることで不要なトラブルを防ぐことができます。
          </p>

          <div className="rule-grid">
            <div className="rule-card">
              <div className="rule-card-title">1. 取引の合意と定型文</div>
              <div className="rule-card-desc">
                `warframe.market` 等に記載されている定型文（ウィスパーコマンド）をコピーしてチャット欄に貼り付け、相手にメッセージを送ります。
                提示価格を無断で値切る（取引画面で急に価格を下げる）行為は非常に失礼にあたり、即座にブロックされる原因になります。
              </div>
            </div>

            <div className="rule-card">
              <div className="rule-card-title">2. クラン道場への移動と振る舞い</div>
              <div className="rule-card-desc">
                通常、売り手が買い手を自分の道場（Dojo）に「招待（Invite）」します。
                道場にロードできたら、**ホスト（売り手）から取引端末を通じて取引申請が送られてくるのを待ちます**。みだりに自分から端末を触ったり、招待を連投するのは避けましょう。
              </div>
            </div>

            <div className="rule-card">
              <div className="rule-card-title">3. 取引完了時の挨拶と手数料</div>
              <div className="rule-card-desc">
                取引画面では、お互いが合意したアイテムとプラチナをセットし、確認ボタンを複数回押して完了します。
                完了したら「ty (thank you)」「have a nice day」などの短い挨拶を送るのが良いマナーです。
                ※取引にはゲーム内通貨「クレジット」の「取引税」が必要ですので、事前に準備しておきましょう。
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: In-game & Community Manners */}
        <section className="rule-section">
          <h3>
            <Users size={22} className="card-title-icon" style={{ color: 'var(--color-purple)' }} />
            協力プレイ ＆ コミュニティ内でのマナー
          </h3>
          <p>
            Warframeは4人協力プレイ（マルチプレイ）が基本となるゲームです。
            他のプレイヤーを尊重し、全員が楽しめるように心がけましょう。
          </p>

          <div className="rule-grid">
            <div className="rule-card">
              <div className="rule-card-title" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Award size={16} style={{ color: 'var(--color-purple)' }} />
                ストーリー・クエストのネタバレ防止
              </div>
              <div className="rule-card-desc">
                Warframeのメインクエスト（特に「二番目の夢」「内なる紛争」以降）には、ゲームシステム自体が大きく変わる重要なストーリー上の変化があります。
                まだこれらのクエストをクリアしていない初心者テンノに対して、不用意にネタバレとなる要素を見せつけたり、チャットで話したりしないよう配慮しましょう。
              </div>
            </div>

            <div className="rule-card">
              <div className="rule-card-title" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Award size={16} style={{ color: 'var(--color-purple)' }} />
                ミッション中でのマナー
              </div>
              <div className="rule-card-desc">
                掃滅ミッションなどで一人だけ先に進みすぎて敵を出現させないようにする、エレベーターを他のプレイヤーが乗る前に勝手に動かさない、などの配慮が大切です。
                また、ルアの音楽パズルや金星・地球の依頼ミッション等では、進行手順を知らない人を責めず、チャットで優しく教えてあげるかサポートに徹しましょう。
              </div>
            </div>

            <div className="rule-card">
              <div className="rule-card-title" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Award size={16} style={{ color: 'var(--color-purple)' }} />
                野良マルチでの放置（AFK）禁止
              </div>
              <div className="rule-card-desc">
                ミッション開始直後から一切操作をせず、他のプレイヤーにクリアしてもらう「寄生行為」は非難の対象であり、ゲームシステム側でも「一定時間動かないとミッション報酬がもらえない」制限があります。
                やむを得ず席を外す場合はチャットで一言伝えるなどの配慮をしましょう。
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
