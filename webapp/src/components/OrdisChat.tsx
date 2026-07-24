import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Settings as SettingsIcon, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { askOrdis, type ChatMessage } from '../utils/gemini';

interface OrdisChatProps {
  apiKey: string;
  onNavigateToSettings: () => void;
}

type VoiceState = 'idle' | 'waiting_wake' | 'listening_command';

export const OrdisChat: React.FC<OrdisChatProps> = ({ apiKey, onNavigateToSettings }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: `テンノ！お帰りなさいませ！Ordisは船内のシステム健全性をチェックしながら、テンノの帰還を心待ちにしておりまし――**早く敵を切り刻みに行こう！**――コホン、失礼しました。何かご質問や、サポートが必要なことはありますか？`,
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice Synthesis (Text-to-Speech) Settings
  const [isMuted, setIsMuted] = useState(false);

  // Voice Recognition (Speech-to-Text) States
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isVoiceEnabledRef = useRef(isVoiceEnabled);
  const voiceStateRef = useRef(voiceState);

  // Keep refs in sync for callback access
  useEffect(() => {
    isVoiceEnabledRef.current = isVoiceEnabled;
  }, [isVoiceEnabled]);

  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  // Auto-scroll chat history
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Play a beautiful beep sound using Web Audio API
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // 880Hz
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.error('Audio context error:', e);
    }
  };

  // Cephalon Ordis Text-to-Speech Helper with Glitch Pitch Shift
  const speakOrdis = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop current speech
      
      // Split text by Ordis glitch markers "――**glitch**――"
      const parts = text.split(/(――\*\*.*?\*\*――)/g);
      const utterances: SpeechSynthesisUtterance[] = [];

      parts.forEach((part) => {
        if (!part.trim()) return;

        const utterance = new SpeechSynthesisUtterance();
        utterance.lang = 'ja-JP';

        const voices = window.speechSynthesis.getVoices();
        const jaVoice = voices.find(v => v.lang.startsWith('ja'));
        if (jaVoice) {
          utterance.voice = jaVoice;
        }

        if (part.startsWith('――**') && part.endsWith('**――')) {
          // Glitch / Aggressive mode: Deep pitch, fast rate
          const cleanText = part.replace(/――\*\*(.*?)\*\*――/, '$1');
          utterance.text = cleanText;
          utterance.pitch = 0.55; 
          utterance.rate = 1.35;  
        } else {
          // Normal mode: High polite robotic pitch, normal rate
          const cleanText = part.replace(/――/g, '、'); // replace em dash with pause
          utterance.text = cleanText;
          utterance.pitch = 1.35; 
          utterance.rate = 1.05;  
        }
        utterances.push(utterance);
      });

      // Chain speech utterances
      utterances.forEach((utt) => {
        window.speechSynthesis.speak(utt);
      });
    } catch (e) {
      console.error('Text-to-speech error:', e);
    }
  };

  // Speak the initial greeting when active
  useEffect(() => {
    speakOrdis(messages[0].content);
  }, []);

  // Web Speech API Voice Recognition Loop
  useEffect(() => {
    if (!isVoiceEnabled) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setVoiceState('idle');
      setVoiceTranscript('');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('音声認識機能は、お使いのブラウザでは動作しません。Google Chrome 等をご利用ください。');
      setIsVoiceEnabled(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'ja-JP';

    recognition.onstart = () => {
      setVoiceState('waiting_wake');
      setVoiceTranscript('「Hi オーディス」とお呼びください...');
    };

    recognition.onresult = (event: any) => {
      const lastResultIndex = event.results.length - 1;
      const resultText = event.results[lastResultIndex][0].transcript.trim();
      const lowerText = resultText.toLowerCase();

      console.log('Voice result received:', resultText, 'State:', voiceStateRef.current);

      if (voiceStateRef.current === 'waiting_wake') {
        // Wake word detection ("Hi Ordis", "Hi オーディス", "オーディス" etc)
        const matched = 
          lowerText.includes('オーディス') || 
          lowerText.includes('ordis') || 
          lowerText.includes('オーディオス') ||
          lowerText.includes('ハイ');

        if (matched) {
          playBeep();
          const reply = 'はい、テンノ！Ordisは待機しておりま――**早く命令しろ！**――ご用件をどうぞ！';
          speakOrdis(reply);
          setVoiceState('listening_command');
          setVoiceTranscript('ご質問をどうぞ！聞き取り中...');
        }
      } else if (voiceStateRef.current === 'listening_command') {
        // Command input phase
        if (resultText) {
          setVoiceTranscript(`「${resultText}」を送信します...`);
          // Directly submit the command to AI
          submitMessage(resultText);
          // Return to wake-word waiting state
          setVoiceState('waiting_wake');
          setVoiceTranscript('「Hi オーディス」とお呼びください...');
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert('マイクの使用許可が必要です。ブラウザのアドレスバー横からマイクを許可してください。');
        setIsVoiceEnabled(false);
      }
    };

    recognition.onend = () => {
      // Loop-restart recognition to keep it active
      if (isVoiceEnabledRef.current) {
        try {
          recognition.start();
        } catch (e) {
          // ignore already started errors
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isVoiceEnabled]);

  // Handle manual message submission
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || isLoading) return;
    submitMessage(inputMsg);
    setInputMsg('');
  };

  // Submit query to Gemini or Mock and play reply voice
  const submitMessage = async (text: string) => {
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: text }]);

    try {
      const apiHistory = messages.slice(1);
      const ordisReply = await askOrdis('', apiHistory, text);
      setMessages((prev) => [...prev, { role: 'model', content: ordisReply }]);
      speakOrdis(ordisReply);
    } catch (err) {
      console.error(err);
      const errMsg = '音声伝達システムにエラーが発生しました。もう一度お試しください、テンノ。';
      setMessages((prev) => [...prev, { role: 'model', content: errMsg }]);
      speakOrdis(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">セファロン・オーディス (Cephalon Ordis)</h2>
        <p className="page-desc">
          音声入力と音声読み上げに対応。「Hi オーディス」と話しかけることで音声入力が起動します。
        </p>
      </div>

      <div className="ordis-layout">
        {/* Left pane: Cephalon Visualizer */}
        <div className="ordis-avatar-box">
          <div className="hologram-container">
            <div className="hologram-ring"></div>
            <div 
              className={`hologram-cube ${
                voiceState === 'waiting_wake' 
                  ? 'waiting-wake' 
                  : voiceState === 'listening_command' 
                  ? 'listening-command' 
                  : ''
              }`}
            ></div>
            <div className="hologram-scanline"></div>
          </div>
          <div className="ordis-status-text">
            {isLoading ? 'Processing...' : voiceState === 'listening_command' ? 'LISTENING' : 'Online'}
          </div>
          <div className="ordis-status-sub">
            {apiKey ? 'Gemini 脳波シンクロ完了' : 'デモ（制限付き機能）モード中'}
          </div>

          {/* Voice Command Status Bar */}
          {isVoiceEnabled && (
            <div className="voice-status-bar">
              <div 
                className={`voice-indicator-dot ${
                  voiceState === 'listening_command' ? 'active-listening' : 'waiting'
                }`}
              ></div>
              <span style={{ fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {voiceTranscript}
              </span>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '20px' }}>
            <button
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className="btn-copy"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
                borderColor: isVoiceEnabled ? 'var(--color-gold)' : 'var(--border-light)',
                color: isVoiceEnabled ? 'var(--color-gold)' : 'var(--text-muted)'
              }}
            >
              {isVoiceEnabled ? <Mic size={14} /> : <MicOff size={14} />}
              {isVoiceEnabled ? 'マイク監視ON' : '音声起動ON'}
            </button>

            <button
              onClick={() => {
                setIsMuted(!isMuted);
                window.speechSynthesis.cancel();
              }}
              className="btn-copy"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px',
                borderColor: 'var(--border-light)',
                color: isMuted ? 'var(--color-danger)' : 'var(--color-teal)'
              }}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          </div>

          {!apiKey && (
            <button
              onClick={onNavigateToSettings}
              className="btn-copy"
              style={{
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                justifyContent: 'center',
                borderColor: 'var(--color-purple)',
                color: 'var(--color-purple)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--color-purple)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-purple)';
              }}
            >
              <SettingsIcon size={14} />
              API キー設定へ
            </button>
          )}
        </div>

        {/* Right pane: Chat Terminal */}
        <div className="chat-terminal has-glow">
          <div className="terminal-header">
            <div className="terminal-title">
              <Terminal size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              CEPHALON_ORDIS_COMM_LINK_v3.2
            </div>
            <div className="terminal-dots">
              <div className="dot red"></div>
              <div className="dot yellow"></div>
              <div className="dot green"></div>
            </div>
          </div>

          <div className="chat-history">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-msg ${msg.role === 'user' ? 'user' : 'ordis'}`}>
                <div className="msg-sender">{msg.role === 'user' ? 'Tenno' : 'Ordis'}</div>
                <div className="msg-bubble">{msg.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-msg ordis">
                <div className="msg-sender">Ordis</div>
                <div className="msg-bubble" style={{ color: 'var(--text-muted)' }}>
                  セファロン・思考展開中...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className="chat-input-area">
            <input
              type="text"
              className="terminal-input"
              placeholder="Ordisに質問する... (音声起動ONで「Hi オーディス」と呼びかけても質問可能)"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="btn-send" disabled={isLoading || !inputMsg.trim()}>
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
