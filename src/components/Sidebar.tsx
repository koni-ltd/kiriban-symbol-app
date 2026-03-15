import React from 'react';
import msAbU from '../assets/ms_ab_u.gif';
import maru3 from '../assets/maru3.gif';

export const Sidebar: React.FC = () => {
  return (
    <div style={{
      width: '250px',
      flexShrink: 0,
      backgroundColor: '#00ffff',
      minHeight: '100vh',
      padding: '15px',
      borderRight: '2px outset #ffffff',
      boxSizing: 'border-box'
    }}>
      <div style={{
        fontSize: '14pt',
        marginBottom: '20px',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ffffff' }}>
          <img src={maru3} alt="" style={{ display: 'inline-block' }} />
          <span>メニュー</span>
          <img src={maru3} alt="" style={{ display: 'inline-block' }} />
        </span>
      </div>

      <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
        <li style={{ marginBottom: '25px', display: 'flex', alignItems: 'center' }}>
          <a href="/">★トップページ</a>
        </li>
        <li style={{ marginBottom: '25px', display: 'flex', alignItems: 'center' }}>
          <a href="https://x.com/im_k0ni" target="_blank" rel="noopener noreferrer">★管理人</a>
        </li>
        <li style={{ marginBottom: '25px', display: 'flex', alignItems: 'center' }}>
          <a href="#">★日記 (工事中)</a>
        </li>
        <li style={{ marginBottom: '25px', display: 'flex', alignItems: 'center' }}>
          <a href="/bbs">★掲示板</a>
          <img src={msAbU} alt="" style={{ marginLeft: '6px', display: 'inline-block', flexShrink: 0 }} />
        </li>
        <li style={{ marginBottom: '25px', display: 'flex', alignItems: 'center' }}>
          <a href="#">★リンク (工事中)</a>
        </li>
        <li style={{ marginBottom: '25px', display: 'flex', alignItems: 'center' }}>
          <a href="#">★メール (工事中)</a>
        </li>
      </ul>

      <p style={{ color: 'red', fontSize: '10pt' }}>
        相互リンク募集中♪<br />
        直リン厳禁(^^;)
      </p>
    </div>
  );
};
