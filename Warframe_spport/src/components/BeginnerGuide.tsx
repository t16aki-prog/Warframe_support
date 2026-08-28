import React from 'react';
import { AlertTriangle, Info, Map } from 'lucide-react';
import { beginnerRoadmap, criticalAlerts } from '../utils/beginnerData';

export const BeginnerGuide: React.FC = () => {
  return (
    <div className="beginner-guide" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', color: '#64ffda' }}>
          <Map size={28} />
          初心者ガイド：テンノへの道
        </h1>
        <p style={{ color: '#8892b0', marginTop: '10px' }}>
          Warframeの世界へようこそ！最初は覚えることが多くて大変ですが、まずはこのロードマップに沿って少しずつ進めていきましょう。
        </p>
      </header>

      <section className="critical-alerts" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <AlertTriangle size={20} />
          絶対読んで！取り返しのつかない要素
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {criticalAlerts.map((alert) => (
            <div key={alert.id} style={{
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              borderLeft: '4px solid #ff6b6b',
              padding: '16px',
              borderRadius: '0 8px 8px 0'
            }}>
              <h3 style={{ fontSize: '16px', color: '#ff6b6b', marginBottom: '8px' }}>{alert.title}</h3>
              <p style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: '1.5' }}>{alert.content}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="roadmap">
        <h2 style={{ fontSize: '18px', color: '#64ffda', marginBottom: '20px' }}>進行ロードマップ</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {beginnerRoadmap.map((step, index) => (
            <div key={step.id} style={{
              backgroundColor: '#112240',
              border: '1px solid #233554',
              borderRadius: '8px',
              padding: '20px',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  backgroundColor: '#233554',
                  color: '#64ffda',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', color: '#ccd6f6' }}>{step.title}</h3>
                    {step.planet && (
                      <span style={{
                        backgroundColor: 'rgba(100, 255, 218, 0.1)',
                        color: '#64ffda',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {step.planet}
                      </span>
                    )}
                  </div>
                  <p style={{ color: '#8892b0', fontSize: '14px', marginBottom: '16px', lineHeight: '1.5' }}>
                    {step.description}
                  </p>
                  
                  {step.tips.length > 0 && (
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      padding: '12px',
                      borderRadius: '6px'
                    }}>
                      <h4 style={{ fontSize: '14px', color: '#a8b2d1', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <Info size={16} />
                        Tips
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#8892b0', fontSize: '13px' }}>
                        {step.tips.map((tip, i) => (
                          <li key={i} style={{ marginBottom: '4px' }}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <p style={{ color: '#8892b0', fontSize: '14px' }}>
          分からないことがあれば、「セファロンAI」タブでOrdisに聞いてみてくださいね！
        </p>
      </div>
    </div>
  );
};
