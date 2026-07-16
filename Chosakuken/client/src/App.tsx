import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldAlert, 
  UploadCloud, 
  Video, 
  Music, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Lock, 
  RefreshCw, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface RiskItem {
  timestamp: string;
  seconds: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  legalBasis: string;
  solution: string;
}

interface AnalysisResult {
  summary: string;
  overallRiskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  copyrightRisks: RiskItem[];
  portraitRisks: RiskItem[];
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [fileType, setFileType] = useState<'video' | 'audio' | null>(null);
  
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('chosakuken_gemini_key') || '';
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'summary' | 'copyright' | 'portrait'>('summary');
  const [selectedRiskIndex, setSelectedRiskIndex] = useState<number | null>(null);
  const [selectedRiskType, setSelectedRiskType] = useState<'copyright' | 'portrait' | null>(null);
  
  const [isDragActive, setIsDragActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // APIキーのローカルストレージ保存
  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('chosakuken_gemini_key', apiKey);
    alert('APIキーをブラウザに一時保存しました。');
  };

  // ファイル変更時のクリーンアップ
  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  // ファイル選択の処理
  const handleFileChange = (selectedFile: File) => {
    if (!selectedFile) return;

    const type = selectedFile.type;
    if (type.startsWith('video/')) {
      setFileType('video');
    } else if (type.startsWith('audio/') || selectedFile.name.endsWith('.mp3') || selectedFile.name.endsWith('.wav')) {
      setFileType('audio');
    } else {
      setErrorMsg('対応していないファイル形式です。動画(MP4等)または音声(MP3等)を選択してください。');
      return;
    }

    setFile(selectedFile);
    setFileUrl(URL.createObjectURL(selectedFile));
    setAnalysisResult(null);
    setSelectedRiskIndex(null);
    setSelectedRiskType(null);
    setErrorMsg('');
    setCurrentTime(0);
    setDuration(0);
  };

  // ドラッグ＆ドロップ処理
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // メディアの時間更新イベント
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
    
    if (!analysisResult) return;

    // 現在再生している時間に最も近いリスクアイテムを自動選択する
    let closestIndex: number | null = null;
    let closestType: 'copyright' | 'portrait' | null = null;
    let minDiff = 2.5; // 2.5秒以内の近さ

    const checkClosest = (risks: RiskItem[], type: 'copyright' | 'portrait') => {
      risks.forEach((risk, index) => {
        const diff = Math.abs(risk.seconds - time);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = index;
          closestType = type;
        }
      });
    };

    checkClosest(analysisResult.copyrightRisks || [], 'copyright');
    checkClosest(analysisResult.portraitRisks || [], 'portrait');

    if (closestIndex !== null && closestType !== null) {
      setSelectedRiskIndex(closestIndex);
      setSelectedRiskType(closestType);
      // 自動でタブを切り替える
      setActiveTab(closestType);
    }
  };

  const handleLoadedMetadata = (mediaDuration: number) => {
    setDuration(mediaDuration);
  };

  // タイムスタンプジャンプ機能
  const seekTo = (seconds: number) => {
    if (fileType === 'video' && videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    } else if (fileType === 'audio' && audioRef.current) {
      audioRef.current.currentTime = seconds;
      audioRef.current.play().catch(() => {});
    }
  };

  // 解析リクエスト送信
  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setErrorMsg('');
    setProgressText('ファイルをサーバーに転送中...');

    const formData = new FormData();
    formData.append('file', file);

    // バックエンドへの接続用
    try {
      // 処理フェーズのシミュレーション付きテキスト
      const interval = setInterval(() => {
        setProgressText(prev => {
          if (prev.includes('転送中')) return 'サーバーでファイルを一時保存中...';
          if (prev.includes('一時保存中')) return 'Gemini API へコンテンツをアップロード中...';
          if (prev.includes('アップロード中')) return 'AIモデルが動画/音声をマルチモーダル解析中 (約15〜30秒かかります)...';
          return prev;
        });
      }, 5000);

      const headers: HeadersInit = {};
      if (apiKey) {
        headers['x-gemini-api-key'] = apiKey;
      }

      // ローカルの Express サーバーにリクエスト
      // サーバー側の env の GEMINI_API_KEY を優先するが、なければ x-gemini-api-key も送る仕組み
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
          ...headers,
        },
        body: formData,
      });

      clearInterval(interval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '解析に失敗しました。');
      }

      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);
      setActiveTab('summary');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '接続エラーが発生しました。サーバーが起動しているか確認してください。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">
          <div className="brand-logo">Chosakuken</div>
          <span className="brand-tag">AI Risk Detector</span>
        </div>
        <div className="privacy-badge">
          <Lock size={16} />
          <span>データ学習非利用 (AI Opt-Out) 適用中</span>
        </div>
      </header>

      {/* API Key Setup Panel */}
      <section className="glass-panel setup-panel" style={{ marginBottom: '2rem' }}>
        <div className="setup-title">
          <Info size={18} className="text-secondary" />
          <span>Gemini API キーの設定</span>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          ※ サーバー側の環境変数 <code>GEMINI_API_KEY</code> にキーが設定されている場合は、ここでの入力は不要です。<br />
          設定されていない場合は、以下に一時的にキーを入力して利用してください（キーはブラウザと通信先APIのみで完結し、学習には使用されません）。
        </p>
        <form onSubmit={handleSaveApiKey} className="api-input-group">
          <input 
            type="password" 
            placeholder="AI Studio から取得した API キーを入力..." 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
            className="api-input"
          />
          <button type="submit" className="btn">
            キーを保存
          </button>
        </form>
      </section>

      {/* Main workspace */}
      {!analysisResult && !isAnalyzing ? (
        <section className="glass-panel">
          <div 
            className={`upload-container ${isDragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="video/*,audio/*"
              onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
            />
            <UploadCloud className="upload-icon" />
            <h3 className="upload-text">解析したい動画または音声ファイルをドラッグ＆ドロップ</h3>
            <p className="upload-subtext">またはクリックしてファイルを選択 (MP4, MP3, WAV, WebM 等)</p>
          </div>

          {file && (
            <div className="file-info-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {fileType === 'video' ? <Video size={20} className="color-primary" /> : <Music size={20} className="color-secondary" />}
                <div>
                  <strong>{file.name}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                </div>
              </div>
              <button className="btn" onClick={handleAnalyze}>
                <ShieldAlert size={16} />
                解析を開始する
              </button>
            </div>
          )}

          {errorMsg && (
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem', 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              borderRadius: '8px', 
              color: 'var(--color-risk-high)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem' 
            }}>
              <AlertCircle size={20} />
              <span>{errorMsg}</span>
            </div>
          )}
        </section>
      ) : isAnalyzing ? (
        <section className="glass-panel loading-container">
          <div className="loader-spinner"></div>
          <h2>コンテンツを高度解析中...</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{progressText}</p>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: '60%', animation: 'pulse 2s infinite' }}></div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2rem' }}>
            ※ データ保護のため、解析が終了したデータは即座にクラウドおよびサーバー上から破棄されます。
          </p>
        </section>
      ) : (
        /* Results Dashboard */
        <div className="dashboard-grid">
          {/* Media Player Section */}
          <div className="media-section glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)' }}>メディアプレビュー</h3>
              <button 
                className="btn" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}
                onClick={() => {
                  setAnalysisResult(null);
                  setFile(null);
                }}
              >
                <RefreshCw size={12} />
                別のファイルを解析
              </button>
            </div>

            {fileType === 'video' && fileUrl && (
              <div className="video-wrapper">
                <video 
                  ref={videoRef}
                  src={fileUrl} 
                  controls 
                  className="video-element"
                  onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => handleLoadedMetadata(e.currentTarget.duration)}
                />
              </div>
            )}

            {fileType === 'audio' && fileUrl && (
              <div className="audio-wrapper">
                <Music size={48} className="text-secondary" style={{ opacity: 0.7 }} />
                <div style={{ textAlign: 'center' }}>
                  <strong>{file?.name}</strong>
                  <div style={{ fontSize: '0.8-rem', color: 'var(--text-muted)' }}>音声ファイル解析モード</div>
                </div>
                <audio 
                  ref={audioRef}
                  src={fileUrl} 
                  controls 
                  className="audio-element"
                  onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => handleLoadedMetadata(e.currentTarget.duration)}
                />
              </div>
            )}

            {/* Custom interactive timeline pins */}
            <div className="timeline-container">
              <div className="timeline-label">
                <span>00:00</span>
                <span>再生位置: {formatSeconds(currentTime)} / {formatSeconds(duration)}</span>
                <span>{formatSeconds(duration)}</span>
              </div>
              <div 
                className="timeline-track-wrapper"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const percent = clickX / rect.width;
                  seekTo(percent * duration);
                }}
              >
                <div className="timeline-progress-bar" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}></div>
                
                {/* Copyright Risk Pins */}
                {analysisResult?.copyrightRisks?.map((risk, index) => {
                  const percent = (risk.seconds / (duration || 1)) * 100;
                  const isActive = selectedRiskType === 'copyright' && selectedRiskIndex === index;
                  return (
                    <div 
                      key={`copy-${index}`}
                      className={`timeline-pin ${risk.riskLevel.toLowerCase()}`}
                      style={{ 
                        left: `${percent}%`,
                        boxShadow: isActive ? '0 0 12px 3px var(--color-primary)' : 'none',
                        transform: isActive ? 'translate(-50%, -50%) scale(1.4)' : 'translate(-50%, -50%)'
                      }}
                      title={`[著作権] ${risk.timestamp} - ${risk.description}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        seekTo(risk.seconds);
                        setSelectedRiskIndex(index);
                        setSelectedRiskType('copyright');
                        setActiveTab('copyright');
                      }}
                    />
                  );
                })}

                {/* Portrait Risk Pins */}
                {analysisResult?.portraitRisks?.map((risk, index) => {
                  const percent = (risk.seconds / (duration || 1)) * 100;
                  const isActive = selectedRiskType === 'portrait' && selectedRiskIndex === index;
                  return (
                    <div 
                      key={`port-${index}`}
                      className={`timeline-pin ${risk.riskLevel.toLowerCase()}`}
                      style={{ 
                        left: `${percent}%`,
                        border: '2px solid white', // 肖像権は白い枠線で区別
                        boxShadow: isActive ? '0 0 12px 3px var(--color-primary)' : 'none',
                        transform: isActive ? 'translate(-50%, -50%) scale(1.4)' : 'translate(-50%, -50%)'
                      }}
                      title={`[肖像権] ${risk.timestamp} - ${risk.description}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        seekTo(risk.seconds);
                        setSelectedRiskIndex(index);
                        setSelectedRiskType('portrait');
                        setActiveTab('portrait');
                      }}
                    />
                  );
                })}
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-risk-high)' }}></div> 高リスク
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-risk-medium)' }}></div> 中リスク
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-risk-low)' }}></div> 低リスク
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-risk-medium)', border: '2px solid white' }}></div> 肖像権リスク (白枠)
              </div>
            </div>
          </div>

          {/* Results Side Panel */}
          <div className="results-section">
            {/* Tab Bar */}
            <div className="tab-bar">
              <button 
                className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
                onClick={() => setActiveTab('summary')}
              >
                <FileText size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                要約レポート
              </button>
              <button 
                className={`tab-btn ${activeTab === 'copyright' ? 'active' : ''}`}
                onClick={() => setActiveTab('copyright')}
              >
                <ShieldAlert size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                著作権 ({analysisResult.copyrightRisks?.length || 0})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'portrait' ? 'active' : ''}`}
                onClick={() => setActiveTab('portrait')}
              >
                <AlertTriangle size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                肖像権 ({analysisResult.portraitRisks?.length || 0})
              </button>
            </div>

            {/* Tab Contents: Summary */}
            {activeTab === 'summary' && (
              <div className={`glass-panel summary-card ${analysisResult.overallRiskLevel.toLowerCase()}`}>
                <div className="summary-header">
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-display)' }}>総合評価</h3>
                  <span className={`risk-badge ${analysisResult.overallRiskLevel.toLowerCase()}`}>
                    リスク度: {analysisResult.overallRiskLevel}
                  </span>
                </div>
                <p style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>{analysisResult.summary}</p>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>著作権指摘数</div>
                    <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {analysisResult.copyrightRisks?.length || 0} 件
                    </span>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>肖像権指摘数</div>
                    <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-secondary)' }}>
                      {analysisResult.portraitRisks?.length || 0} 件
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Contents: Copyright Risks */}
            {activeTab === 'copyright' && (
              <div className="risk-list">
                {(!analysisResult.copyrightRisks || analysisResult.copyrightRisks.length === 0) ? (
                  <div className="glass-panel empty-state">
                    <CheckCircle className="empty-icon text-success" style={{ color: 'var(--color-risk-low)', opacity: 0.8 }} />
                    <p style={{ margin: 0 }}>著作権に関する懸念点は検出されませんでした。</p>
                  </div>
                ) : (
                  analysisResult.copyrightRisks.map((risk, index) => {
                    const isActive = selectedRiskType === 'copyright' && selectedRiskIndex === index;
                    return (
                      <div 
                        key={index} 
                        className={`glass-panel risk-card ${risk.riskLevel.toLowerCase()} ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedRiskIndex(index);
                          setSelectedRiskType('copyright');
                          seekTo(risk.seconds);
                        }}
                      >
                        <div className="risk-card-header">
                          <span className="timestamp-badge">{risk.timestamp}</span>
                          <span className={`risk-badge ${risk.riskLevel.toLowerCase()}`}>
                            {risk.riskLevel}
                          </span>
                        </div>
                        <div className="risk-desc">{risk.description}</div>
                        {isActive && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', animation: 'fadeIn 0.2s ease' }}>
                            <div className="risk-meta-item">
                              <div className="meta-label">法的根拠 / 影響</div>
                              <div className="meta-val">{risk.legalBasis}</div>
                            </div>
                            <div className="risk-meta-item" style={{ borderLeft: '3px solid var(--color-secondary)' }}>
                              <div className="meta-label">推奨される対策</div>
                              <div className="meta-val">{risk.solution}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab Contents: Portrait Risks */}
            {activeTab === 'portrait' && (
              <div className="risk-list">
                {(!analysisResult.portraitRisks || analysisResult.portraitRisks.length === 0) ? (
                  <div className="glass-panel empty-state">
                    <CheckCircle className="empty-icon text-success" style={{ color: 'var(--color-risk-low)', opacity: 0.8 }} />
                    <p style={{ margin: 0 }}>肖像権に関する懸念点は検出されませんでした。</p>
                  </div>
                ) : (
                  analysisResult.portraitRisks.map((risk, index) => {
                    const isActive = selectedRiskType === 'portrait' && selectedRiskIndex === index;
                    return (
                      <div 
                        key={index} 
                        className={`glass-panel risk-card ${risk.riskLevel.toLowerCase()} ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedRiskIndex(index);
                          setSelectedRiskType('portrait');
                          seekTo(risk.seconds);
                        }}
                      >
                        <div className="risk-card-header">
                          <span className="timestamp-badge">{risk.timestamp}</span>
                          <span className={`risk-badge ${risk.riskLevel.toLowerCase()}`}>
                            {risk.riskLevel}
                          </span>
                        </div>
                        <div className="risk-desc">{risk.description}</div>
                        {isActive && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', animation: 'fadeIn 0.2s ease' }}>
                            <div className="risk-meta-item">
                              <div className="meta-label">法的根拠 / 影響</div>
                              <div className="meta-val">{risk.legalBasis}</div>
                            </div>
                            <div className="risk-meta-item" style={{ borderLeft: '3px solid var(--color-secondary)' }}>
                              <div className="meta-label">推奨される対策</div>
                              <div className="meta-val">{risk.solution}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
