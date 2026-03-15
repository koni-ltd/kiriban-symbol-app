import React, { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Counter } from './components/Counter';
import { BBS } from './components/BBS';
import { KiribanReports } from './components/KiribanReports';
import bgImg from './assets/bg-img.png';
import mainTitleImg from './assets/main-title.png';
import wBackImg from './assets/w_back.gif';
import wHomeImg from './assets/w_home.gif';

const frameStyle: React.CSSProperties = {
  minHeight: '100vh',
  width: '100%',
  minWidth: '1050px',
  display: 'flex',
  boxSizing: 'border-box',
  borderLeft: '1px solid #000',
  borderRight: '1px solid #000',
};

const mainStyle: React.CSSProperties = {
  minHeight: '100vh',
  flex: 1,
  minWidth: 0,
  padding: '20px',
  boxSizing: 'border-box',
  backgroundImage: `url(${bgImg})`,
  backgroundRepeat: 'repeat',
  backgroundColor: '#ffffff',
};

const HomeContent: React.FC = () => {
  return (
    <>
      <div
        className="marquee-container"
        style={{ margin: '0 auto 40px', maxWidth: '780px', backgroundColor: '#000080' }}
      >
        <span className="marquee-text" style={{ color: '#ffffff', fontSize: '14pt' }}>
          ホームページへようこそ♪ゆっくりしていってね！
        </span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <img
          src={mainTitleImg}
          alt="Welcome to Symbol World"
          style={{ display: 'inline-block', width: 'min(100%, 460px)', height: 'auto' }}
        />
      </div>

      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '12pt', marginBottom: '20px', textDecoration: 'underline' }}>
        最終更新日　２０２６／０３／１５<br />
        ＨＰ開設日　２０２６／０３／１５
      </div>
      <p style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'bold', color: '#000080' }}>
        Ｓｏｒｒｙ，　Ｔｈｉｓ　Ｈｏｍｅｐａｇｅ　​ｉｓ　Ｊａｐａｎｉｓｅ　Ｏｎｒｙ．
      </p>

      <div style={{ height: '20px' }}></div>

      <div className="visitor-counter-row">
        <span className="visitor-counter-label">あなたは</span>
        <Counter />
        <span className="visitor-counter-label">人目のお客様です！</span>
      </div>

      <p style={{ textAlign: 'center', marginBottom: '10px' }}>
        キリ番を踏んだ方は記念カキコお願いします
      </p>
      <p style={{ textAlign: 'center', marginBottom: '20px' }}>
        <span style={{ color: '#ff0000' }}>！！！踏み逃げ禁止です！！！</span>
      </p>

      <div style={{ height: '20px' }}></div>

      <div className="max-w-[780px] mx-auto">
        <p className="retro-highlight-banner" style={{ marginBottom: '10px' }}>★キリ番報告★</p>
        <p
          style={{
            textAlign: 'center',
            color: '#000000',
          }}
        >
          管理人のアドレス（テストネット）<br />
          ↓↓↓<br />
          <span style={{ color: '#000080', textDecoration: 'underline' }}>
            TC6TI3BLF6VVMMVHX34Z63SFP5VZPY77OCDVDZQ
          </span>
        </p>
        <KiribanReports />
      </div>

      <div style={{ height: '50px' }}></div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', width: '100%' }}>
        <img src={wHomeImg} alt="w home" style={{ display: 'block' }} />
      </div>

      <div style={{ marginTop: '50px', textAlign: 'center', fontSize: '10pt' }}>
        <p>当サイトは WIN98 + Internet Explorer 5.0以上、1024x768 での閲覧を推奨しています。 </p>
        <p>※公開している画像や文章は無断転載禁止です。</p>
        <p>Since2026-3-15</p>
      </div>
    </>
  );
};

const BBSPageContent: React.FC = () => {
  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28pt', margin: '8px 0' }}>掲示板</h1>
        <p style={{ margin: 0 }}>
          足あとでも雑談でもお気軽にどうぞ。<br />
          煽り・荒らしは放置の方向でお願いします。<br />
          荒らしは(・∀・)ｶｴﾚ!!
        </p>
      </div>

      <div className="max-w-[780px] mx-auto" style={{ marginBottom: '30px' }}>
        <BBS />
      </div>

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
        <a href="/index.html">
          <img src={wBackImg} alt="トップページへ戻る" />
        </a>
      </div>
    </>
  );
};

export default function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  const isBBSPage = path === '/bbs';

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      window.alert('右クリックは禁止です。');
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <div style={frameStyle}>
      <Sidebar />
      <div style={mainStyle}>
        {isBBSPage ? <BBSPageContent /> : <HomeContent />}
      </div>
    </div>
  );
}
