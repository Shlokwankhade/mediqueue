
import { useState, useEffect } from 'react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(
    localStorage.getItem('pwa-dismissed') === 'true'
  );

  useEffect(() => {
    // Already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }
    if (dismissed) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShow(true), 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShow(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [dismissed]);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    setShow(false);
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem('pwa-dismissed', 'true');
  };

  if (!show || installed || dismissed) return null;

  return (
    <div style={{
      position:'fixed', bottom:90, left:'50%',
      transform:'translateX(-50%)',
      width:'calc(100% - 32px)', maxWidth:400,
      background:'linear-gradient(135deg,#0D1526,#132038)',
      border:'1px solid rgba(13,155,130,0.3)',
      borderRadius:24, padding:'18px 20px',
      boxShadow:'0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(13,155,130,0.1)',
      zIndex:9990,
      animation:'pwaSlide 0.5s cubic-bezier(0.34,1.56,0.64,1)'
    }}>
      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
        <div style={{
          width:52,height:52,borderRadius:16,flexShrink:0,
          background:'linear-gradient(135deg,#0D9B82,#1DBEA0)',
          display:'flex',alignItems:'center',justifyContent:'center',
          boxShadow:'0 4px 20px rgba(13,155,130,0.4)'
        }}>
          <i className='fas fa-heart-pulse' style={{color:'white',fontSize:24}}/>
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:16,color:'white',marginBottom:3}}>
            Install MEDIQUEUE
          </div>
          <div style={{fontSize:12,color:'#7B8DB8',lineHeight:1.5}}>
            Add to home screen for faster access, offline support and push notifications
          </div>
        </div>
        <button onClick={dismiss} style={{
          width:30,height:30,borderRadius:9,flexShrink:0,
          background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',
          color:'#7B8DB8',cursor:'pointer',fontSize:13,
          display:'flex',alignItems:'center',justifyContent:'center'
        }}>
          <i className='fas fa-times'/>
        </button>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:14}}>
        {[
          {icon:'fa-bolt',text:'Faster loading'},
          {icon:'fa-wifi-slash',text:'Works offline'},
          {icon:'fa-bell',text:'Notifications'},
        ].map(f=>(
          <div key={f.text} style={{flex:1,background:'rgba(13,155,130,0.08)',border:'1px solid rgba(13,155,130,0.15)',borderRadius:10,padding:'8px 6px',textAlign:'center'}}>
            <i className={'fas '+f.icon} style={{color:'#0D9B82',fontSize:14,display:'block',marginBottom:4}}/>
            <div style={{fontSize:10,color:'#7B8DB8',fontWeight:600}}>{f.text}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:10}}>
        <button onClick={dismiss} style={{
          flex:1,padding:'11px',
          background:'rgba(255,255,255,0.06)',
          color:'#7B8DB8',border:'1px solid rgba(255,255,255,0.1)',
          borderRadius:12,fontFamily:'DM Sans,sans-serif',
          fontSize:13,fontWeight:600,cursor:'pointer'
        }}>
          Not now
        </button>
        <button onClick={install} style={{
          flex:2,padding:'11px',
          background:'linear-gradient(135deg,#0D9B82,#1DBEA0)',
          color:'white',border:'none',borderRadius:12,
          fontFamily:'DM Sans,sans-serif',fontSize:14,fontWeight:700,
          cursor:'pointer',
          boxShadow:'0 4px 16px rgba(13,155,130,0.4)',
          display:'flex',alignItems:'center',justifyContent:'center',gap:8
        }}>
          <i className='fas fa-download'/> Install App
        </button>
      </div>

      <style>{`
        @keyframes pwaSlide {
          from { opacity:0; transform:translate(-50%,30px) scale(0.95); }
          to { opacity:1; transform:translate(-50%,0) scale(1); }
        }
      `}</style>
    </div>
  );
}
